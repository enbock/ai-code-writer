import AudioRecorder from '../../Core/AudioRecorder';
import {PassThrough} from 'stream';
import {record, RecorderStream} from 'node-record-lpcm16';

class RecordingHandler {
    private chunks: Buffer[] = [];
    private isStopped: boolean = false;
    private passThrough: PassThrough = new PassThrough();

    constructor(
        private recordingStream: RecorderStream,
        private resolve: (value: Buffer | PromiseLike<Buffer>) => void,
        private reject: (reason?: any) => void
    ) {
        this.registerEvents();
    }

    private registerEvents(): void {
        this.passThrough.on('data', this.onData.bind(this));
        this.passThrough.on('end', this.onEnd.bind(this));
        this.passThrough.on('error', this.onError.bind(this));

        const stream = this.recordingStream.stream();
        stream.on('error', this.onError.bind(this));
        stream.pipe(this.passThrough);

        setTimeout(() => this.stopRecording(stream), 5000);
    }

    private onData(chunk: Buffer): void {
        this.chunks.push(chunk);
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

    private stopRecording(stream: NodeJS.ReadableStream): void {
        if (!this.isStopped) {
            stream.unpipe(this.passThrough);
            this.recordingStream.stop();
            this.isStopped = true;
            this.resolve(Buffer.concat(this.chunks));
        }
    }
}

export default class NodeAudioRecorder implements AudioRecorder {
    constructor(
        private recordLpcm16: typeof record
    ) {
    }

    public async startRecording(): Promise<Buffer> {
        return new Promise<Buffer>((resolve, reject): void => {
            const recordingStream: RecorderStream = this.recordLpcm16({
                sampleRateHertz: 16000,
                threshold: 0.5,
                verbose: true,
                silence: '10.0',
                recordProgram: 'sox'
            });

            new RecordingHandler(recordingStream, resolve, reject);
        });
    }
}
