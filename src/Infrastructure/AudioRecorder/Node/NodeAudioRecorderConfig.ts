export default class NodeAudioRecorderConfig {
    public MAX_SILENCE_DURATION: number = 3000;
    public MAX_WAIT_DURATION: number = 15000;
    public SILENCE_DETECTION_WINDOW: number = 5;
    public silenceThresholdMultiplier: number = 1.2;
    public SILENCE_DETECTION_WINDOW_HALVED: number = 2;
}
