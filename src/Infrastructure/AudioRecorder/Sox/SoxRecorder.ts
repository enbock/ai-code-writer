import AudioRecorder from '../../../Core/Audio/AudioRecorder';
import {PassThrough} from 'stream';
import {Recording, SoxRecordingFactory} from './SoxConnector/Recording';

class RecordingHandler {
    private chunks: Buffer[] = [];
    private isStopped: boolean = false;
    private passThrough: PassThrough = new PassThrough();
    private timeoutId?: NodeJS.Timeout;

    constructor(
        private recordingStream: Recording,
        private resolve: (value: Buffer | PromiseLike<Buffer>) => void,
        private reject: (reason?: any) => void
    ) {
        this.registerEvents();
        this.resetTimeout();
    }

    private registerEvents(): void {
        this.passThrough.on('data', this.onData.bind(this));
        this.passThrough.on('end', this.onEnd.bind(this));
        this.passThrough.on('error', this.onError.bind(this));

        const stream = this.recordingStream.stream();
        stream.on('error', this.onError.bind(this));
        stream.pipe(this.passThrough);
    }

    private resetTimeout(): void {
        if (this.timeoutId) {
            clearTimeout(this.timeoutId);
        }
        this.timeoutId = setTimeout(() => this.stopRecording(), 5000);
    }

    private onData(chunk: Buffer): void {
        this.chunks.push(chunk);
        this.resetTimeout();
    }

    private onEnd(): void {
        if (!this.isStopped) {
            this.resolve(Buffer.concat(this.chunks));
            this.isStopped = true;
        }
    }

    private onError(error: Error): void {
        if (!this.isStopped) {
            this.reject(error);
            this.isStopped = true;
        }
    }

    private stopRecording(): void {
        if (!this.isStopped) {
            this.recordingStream.stream().unpipe(this.passThrough);
            this.recordingStream.stop();
            this.isStopped = true;
            this.resolve(Buffer.concat(this.chunks)); // Sicherstellen, dass der Buffer immer zurückgegeben wird
        }
    }
}

export default class SoxRecorder implements AudioRecorder {
    constructor(
        private soxFactory: typeof SoxRecordingFactory
    ) {
    }

    public async startRecording(): Promise<Buffer> {
        return new Promise<Buffer>((resolve, reject): void => {
            const recordingStream: Recording = this.soxFactory({
                sampleRate: 16000,
                channels: 1,
                threshold: 1.1,
                silence: '1.5',
                endOnSilence: true,
                audioType: 'wav',
                bitRate: 16
            });

            new RecordingHandler(recordingStream, resolve, reject);
        });
    }
}

