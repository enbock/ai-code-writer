export default interface AudioRecorder {
    startRecording(): Promise<ThrowsErrorOrReturn<Error, Buffer>>;
}
