export default interface AudioRecorder {
    startRecording(): Promise<Buffer>;

    measureNoiseLevel(): Promise<void>;
}
