export default interface AudioRecorder {
    startRecording(): Promise<Buffer>;
}
