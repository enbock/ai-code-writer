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
    private firstFrameSkipped: boolean = false;

    constructor(
        private resolve: (value: Buffer | PromiseLike<Buffer>) => void,
        private reject: (reason?: any) => void,
        private config: NodeAudioRecorderConfig,
        private silenceThreshold: number,
        private newSilenceThresholdCallback: (newValue: number) => void
    ) {
        this.registerEvents();
    }

    public async startRecording(): Promise<void> {
        this.isSilenceLevelAdjusted = this.silenceThreshold != 0;
        try {
            this.micInstance = new microphone();
            const micStream = this.micInstance.startRecording();

            micStream.on('data', (chunk: Buffer) => {
                this.handleData(chunk);
            });

            micStream.on('end', () => this.streamEnded());
            micStream.on('error', (error: Error) => this.onError(error));

            this.waitTimeout = setTimeout(() => {
                if (!this.audioInputDetected) {
                    this.chunks = [];
                    this.stopRecording();
                }
            }, this.config.MAX_WAIT_DURATION);
        } catch (error: any) {
            this.reject(error);
        }
    }

    public stopRecording(): void {
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

    private handleData(chunk: Buffer): void {
        this.storeChunk(chunk);
        if (!this.firstFrameSkipped) {
            this.skipFirstFrame();
            return;
        }
        if (this.isStopped) return;
        if (!this.isSilenceLevelAdjusted) this.adjustSilenceLevel(chunk);
        this.processAudioChunk(chunk);
    }

    private storeChunk(chunk: Buffer): void {
        this.chunks.push(chunk);
        if (this.passThrough.writable && !this.passThrough.writableEnded && !this.passThrough.writableFinished) {
            this.passThrough.write(chunk);
        }
    }

    private skipFirstFrame(): void {
        this.firstFrameSkipped = true;
    }

    private processAudioChunk(chunk: Buffer): void {
        const isSilent = this.isSilenceLevelAdjusted && this.isSilentChunk(chunk);
        if (isSilent) {
            this.incrementSilenceDuration(chunk);
        } else {
            this.resetSilenceDuration();
        }
        if (this.shouldStopRecording()) {
            this.stopRecording();
        }
        if (debug) this.logDebugInfo(chunk, isSilent);
    }

    private incrementSilenceDuration(chunk: Buffer): void {
        this.silenceDuration += chunk.length / this.audioContext.sampleRate * 1000;
    }

    private resetSilenceDuration(): void {
        this.silenceDuration = 0;
        if (!this.audioInputDetected && this.isSilenceLevelAdjusted) {
            this.audioInputDetected = true;
            clearTimeout(this.waitTimeout);
        }
    }

    private shouldStopRecording(): boolean {
        return this.silenceDuration >= this.config.MAX_SILENCE_DURATION && this.audioInputDetected;
    }

    private logDebugInfo(chunk: Buffer, isSilent: boolean): void {
        console.log(
            'Audio:', this.getAudioLevel(chunk),
            'Threshold:', this.silenceThreshold,
            'isSilent:', isSilent, 'audioInputDetected:',
            this.audioInputDetected
        );
    }

    private adjustSilenceLevel(chunk: Buffer): void {
        if (this.silenceLevels.length < this.config.SILENCE_DETECTION_WINDOW) {
            this.silenceLevels.push(this.getAudioLevel(chunk));
        } else {
            this.sanitizeHighLevelStartingValue();
            this.silenceThreshold = this.silenceLevels.reduce((a, b) => a + b, 0) / this.silenceLevels.length * this.config.silenceThresholdMultiplier;
            this.isSilenceLevelAdjusted = true;
            this.newSilenceThresholdCallback(this.silenceThreshold);
        }
    }

    private sanitizeHighLevelStartingValue() {
        this.silenceLevels.shift();
    }

    private isSilentChunk(chunk: Buffer): boolean {
        const avg: number = this.getAudioLevel(chunk);
        return avg <= this.silenceThreshold;
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
        this.resolve(Buffer.concat(this.chunks));
        this.isStopped = true;
    }

    private onError(error: Error): void {
        if (!this.isStopped) {
            this.stopRecording();
        }
        this.reject(error);
    }
}

export default class Node implements AudioRecorder {
    private silenceThreshold: number = 0;

    constructor(
        private config: NodeAudioRecorderConfig
    ) {
    }

    public async startRecording(): Promise<Buffer> {
        let buffer: Buffer | undefined;

        while (!buffer || buffer.length == 0)
            buffer = await this.runRecording();

        return buffer;
    }

    public async measureNoiseLevel(): Promise<void> {
        return new Promise<void>((resolve, reject): void => {
            const handler: RecordingHandler = new RecordingHandler(
                () => resolve(),
                reject,
                this.config,
                this.silenceThreshold,
                this.changeSilenceThreshold.bind(this)
            );
            handler.startRecording().catch((error) => {
                reject(error);
            });
            setTimeout(() => {
                handler.stopRecording();
            }, this.config.NOISE_MEASUREMENT_DURATION);
        });
    }

    private runRecording() {
        return new Promise<Buffer>((resolve, reject): void => {
            const retryCallback = () => {
                const handler: RecordingHandler = new RecordingHandler(
                    resolve,
                    reject,
                    this.config,
                    this.silenceThreshold,
                    this.changeSilenceThreshold.bind(this)
                );
                handler.startRecording().catch(() => {
                    retryCallback();
                });
            };

            retryCallback();
        });
    }

    private changeSilenceThreshold(newValue: number): void {
        this.silenceThreshold = newValue;
    }
}
