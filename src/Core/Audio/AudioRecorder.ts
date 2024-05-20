export default interface AudioRecorder {
    startRecording(): Promise<Buffer>;

    stopRecording(): Promise<void>;

    measureNoiseLevel(): Promise<void>;
}
