declare module 'node-record-lpcm16' {
    interface Options {
        sampleRateHertz?: number;
        threshold?: number;
        verbose?: boolean;
        recordProgram?: string;
        silence?: string;
    }

    interface Recorder {
        record(options?: Options): RecorderStream;
    }

    export interface RecorderStream {
        stream(): NodeJS.ReadableStream;

        stop(): void;
    }

    const record: Recorder['record'];
    export {record};
}
