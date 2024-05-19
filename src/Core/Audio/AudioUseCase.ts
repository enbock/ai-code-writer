import AudioTransformClient from './AudioTransformClient';
import AudioRecorder from './AudioRecorder';
import AudioPlayer from './AudioPlayer';
import AudioResponse from './AudioResponse';

export default class AudioUseCase {
    constructor(
        private audioTransformClient: AudioTransformClient,
        private audioRecorder: AudioRecorder,
        private audioPlayer: AudioPlayer
    ) {
    }

    public async recordAndProcess(response: AudioResponse): Promise<void> {
        try {
            const audioBuffer: Buffer = await this.audioRecorder.startRecording();

            if (audioBuffer.length === 0) {
                response.transcription = 'No audio recorded.';
                return;
            }

            const transcription: string = await this.audioTransformClient.transformAudioToText(audioBuffer);
            if (transcription == '' || transcription.length < 2) return;

            response.audio = audioBuffer;
            response.transcription = transcription;
        } catch (error) {
        }
    }

    public async transformTextToAudio(text: string): Promise<Buffer> {
        return this.audioTransformClient.transformTextToAudio(text);
    }

    public async playAudio(audioBuffer: Buffer): Promise<void> {
        return this.audioPlayer.play(audioBuffer);
    }
}
