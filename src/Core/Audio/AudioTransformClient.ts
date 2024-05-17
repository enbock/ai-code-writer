export default interface AudioTransformClient {
    transformAudioToText(audioBuffer: Buffer): Promise<string>;

    transformTextToAudio(text: string): Promise<Buffer>;
}
