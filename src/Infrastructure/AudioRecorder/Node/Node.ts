import AudioRecorder from '../../../Core/Audio/AudioRecorder';
import {PassThrough} from 'stream';
import {AudioContext} from 'node-web-audio-api';
import microphone from 'node-microphone';
import NodeAudioRecorderConfig from './NodeAudioRecorderConfig';

const debug: boolean = false;

class RecordingHandler {
    private chunks: Buffer[] = [];
    private isStopped: boolean = false;
    private passThrough: PassThrough = new PassThrough();
    private audioContext: AudioContext = new AudioContext();
    private micInstance: any;
    private silenceDuration: number = 0;
    private audioInputDetected: boolean = false;
    private isSilenceLevelAdjusted: boolean = false;
    private waitTimeout?: NodeJS.Timeout;
    private silenceLevels: Array<number> = [];

    constructor(
        private resolve: (value: Buffer | PromiseLike<Buffer>) => void,
        private reject: (reason?: any) => void,
        private config: NodeAudioRecorderConfig,
        public globalSilenceThreshold: number,
        private retryCallback: () => void
    ) {
        this.registerEvents();
    }

    public async startRecording(): Promise<void> {
        try {
            this.micInstance = new microphone();
            const micStream = this.micInstance.startRecording();

            micStream.on('data', (chunk: Buffer) => {
                this.chunks.push(chunk);
                if (this.passThrough.writable && !this.passThrough.writableEnded && !this.passThrough.writableFinished) {
                    this.passThrough.write(chunk);
                }

                if (this.isStopped) return;

                const detectionWindow: number = this.globalSilenceThreshold != 0 ? this.config.SILENCE_DETECTION_WINDOW_HALVED : this.config.SILENCE_DETECTION_WINDOW;

                if (this.silenceLevels.length < detectionWindow) {
                    this.silenceLevels.push(this.getAudioLevel(chunk));
                } else if (!this.isSilenceLevelAdjusted) {
                    this.sanitizeHighLevelStartingValue();
                    this.globalSilenceThreshold = this.silenceLevels.reduce((a, b) => a + b, 0) / this.silenceLevels.length * this.config.silenceThresholdMultiplier;
                    this.isSilenceLevelAdjusted = true;
                    console.log('Aufzeichnung läuft.');
                }

                const isSilent = this.isSilenceLevelAdjusted && this.isSilentChunk(chunk);
                if (isSilent) {
                    this.silenceDuration += chunk.length / this.audioContext.sampleRate * 1000;
                } else {
                    this.silenceDuration = 0;
                    if (!this.audioInputDetected && this.isSilenceLevelAdjusted) {
                        this.audioInputDetected = true;
                        clearTimeout(this.waitTimeout);
                    }
                }

                if (this.silenceDuration >= this.config.MAX_SILENCE_DURATION && this.audioInputDetected) {
                    this.stopRecording();
                }

                if (debug) console.log(
                    'Audio:', this.getAudioLevel(chunk),
                    'Threshold:', this.globalSilenceThreshold,
                    'isSilent:', isSilent, 'audioInputDetected:',
                    this.audioInputDetected
                );
            });

            micStream.on('end', () => this.streamEnded());
            micStream.on('error', (error: Error) => this.onError(error));

            this.waitTimeout = setTimeout(() => {
                if (!this.audioInputDetected) {
                    console.log('No audio input detected. Stopping recording.');
                    this.reject(new Error('No audio input detected within the time frame.'));
                    this.stopRecording();
                }
            }, this.config.MAX_WAIT_DURATION);
        } catch (error: any) {
            this.reject(error);
        }
    }

    private sanitizeHighLevelStartingValue() {
        this.silenceLevels.shift();
    }

    public stopRecording(): void {
        if (this.isStopped) return;
        this.isStopped = true;
        if (this.micInstance) {
            this.micInstance.stopRecording();
            this.micInstance = undefined;
        }
        if (!this.passThrough.destroyed) {
            this.passThrough.end();
        }
        this.audioContext.close().catch((error: Error) => console.error('Error closing audio context:', error));
    }

    private isSilentChunk(chunk: Buffer): boolean {
        const avg: number = this.getAudioLevel(chunk);
        return avg <= this.globalSilenceThreshold;
    }

    private getAudioLevel(chunk: Buffer): number {
        const int16Array = new Int16Array(chunk.buffer, chunk.byteOffset, chunk.byteLength / Int16Array.BYTES_PER_ELEMENT);
        return Math.sqrt(int16Array.reduce((sum, value) => sum + value * value, 0) / int16Array.length);
    }

    private registerEvents(): void {
        this.passThrough.on('end', this.onEnd.bind(this));
        this.passThrough.on('error', this.onError.bind(this));
    }

    private async streamEnded(): Promise<void> {
        if (!this.isStopped) {
            this.stopRecording();
        } else {
            this.onEnd();
        }
    }

    private onEnd(): void {
        if (!this.isStopped) {
            this.stopRecording();
        }
        if (this.chunks.length === 0) {
            this.retryCallback();
        } else {
            this.resolve(Buffer.concat(this.chunks));
        }
        this.isStopped = true;
    }

    private onError(error: Error): void {
        if (!this.isStopped) {
            this.stopRecording();
        }
        this.retryCallback();
    }
}

export default class Node implements AudioRecorder {
    private globalSilenceThreshold: number = 0;

    constructor(
        private config: NodeAudioRecorderConfig
    ) {
    }

    public async startRecording(): Promise<ThrowsErrorOrReturn<Error, Buffer>> {
        return new Promise<Buffer>((resolve, reject): void => {
            const retryCallback = () => {
                const handler: RecordingHandler = new RecordingHandler(resolve, reject, this.config, this.globalSilenceThreshold, retryCallback);
                handler.startRecording().then(() => {
                    this.globalSilenceThreshold = handler.globalSilenceThreshold;
                });
            };

            retryCallback();
        });
    }
}
