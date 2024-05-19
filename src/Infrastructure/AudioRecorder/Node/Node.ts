import AudioRecorder from '../../../Core/Audio/AudioRecorder';
import {PassThrough} from 'stream';
import {AudioContext} from 'node-web-audio-api';
import microphone from 'node-microphone';

class RecordingHandler {
    private chunks: Buffer[] = [];
    private isStopped: boolean = false;
    private passThrough: PassThrough = new PassThrough();
    private audioContext: AudioContext = new AudioContext();
    private micInstance: any;
    private silenceDuration: number = 0;
    private silenceThreshold: number = 0;
    private MAX_SILENCE_DURATION: number = 1500;
    private audioInputDetected: boolean = false;
    private isSilenceLevelAdjusted: boolean = false;

    constructor(private resolve: (value: Buffer | PromiseLike<Buffer>) => void, private reject: (reason?: any) => void) {
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

                let isSilent = false;
                if (this.isSilenceLevelAdjusted) {
                    isSilent = this.isSilentChunk(chunk);
                }
                if (this.chunks.length <= 3 && this.isSilenceLevelAdjusted == false) {
                    this.silenceThreshold = this.getSilenceLevel();
                    this.isSilenceLevelAdjusted = true;
                    console.log('Aufzeichnung läuft.');
                }

                if (isSilent) this.silenceDuration += chunk.length / this.audioContext.sampleRate * 1000;
                else {
                    this.silenceDuration = 0;
                    this.audioInputDetected = true;
                }

                if (this.silenceDuration >= this.MAX_SILENCE_DURATION && this.audioInputDetected) {
                    this.stopRecording();
                }
            });

            micStream.on('end', () => this.streamEnded());
            micStream.on('error', (error: Error) => this.onError(error));
        } catch (error: any) {
            this.reject(error);
        }
    }

    private getSilenceLevel(): number {
        let sum: number = 0;
        this.chunks.forEach(c => sum += this.getAudioLevel(c));
        return sum / this.chunks.length;
    }

    private isSilentChunk(chunk: Buffer): boolean {
        const avg: number = this.getAudioLevel(chunk);
        return avg <= this.silenceThreshold;
    }

    private getAudioLevel(chunk: Buffer): number {
        return Math.round(chunk.reduce((sum, value) => sum + Math.abs(value), 0) / chunk.length);
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
}

export default class Node implements AudioRecorder {
    public async startRecording(): Promise<Buffer> {
        return new Promise<Buffer>((resolve, reject): void => {
            const handler: RecordingHandler = new RecordingHandler(resolve, reject);
            handler.startRecording();
        });
    }
}
