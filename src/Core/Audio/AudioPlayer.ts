export default interface AudioPlayer {
    play(audioBuffer: Buffer): Promise<void>;
}
