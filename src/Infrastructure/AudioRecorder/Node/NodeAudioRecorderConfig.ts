export default class NodeAudioRecorderConfig {
    public MAX_SILENCE_DURATION: number = 3000;
    public MAX_WAIT_DURATION: number = 10000;
    public SILENCE_DETECTION_WINDOW: number = 2;
    public silenceThresholdMultiplier: number = 1.05;
}
