export default class NodeAudioRecorderConfig {
    public MAX_SILENCE_DURATION: number = 3000;
    public MAX_WAIT_DURATION: number = 15000;
    public SILENCE_DETECTION_WINDOW: number = 5;
    public silenceThresholdMultiplier: number = 1.2;
    public SILENCE_DETECTION_WINDOW_HALVED: number = 1;
    public NOISE_MEASUREMENT_DURATION: number = 5000; // Dauer zur Messung des Rauschpegels in Millisekunden
}
