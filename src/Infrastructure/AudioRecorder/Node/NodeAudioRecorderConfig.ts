export default class NodeAudioRecorderConfig {
    public MAX_SILENCE_DURATION: number = 2000;
    public MAX_WAIT_DURATION: number = 15000; // Erhöht von 10000 auf 15000
    public SILENCE_DETECTION_WINDOW: number = 5; // Erhöht von 2 auf 5
    public silenceThresholdMultiplier: number = 1.2; // Erhöht von 1.05 auf 1.2
    public SILENCE_DETECTION_WINDOW_HALVED: number = 2.5; // Hinzugefügt
}
