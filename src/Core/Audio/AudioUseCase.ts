import AudioTransformClient from './AudioTransformClient';
import AudioRecorder from './AudioRecorder';
import AudioResponse from './AudioResponse';

export default class AudioUseCase {
    constructor(
        private audioTransformClient: AudioTransformClient,
        private audioRecorder: AudioRecorder
    ) {
    }

    public async recordAndProcess(response: AudioResponse): Promise<void> {
        const audioBuffer: Buffer = await this.audioRecorder.startRecording();

        if (audioBuffer.length === 0) {
            response.transcription = 'No audio recorded.';
            return;
        }

        const transcription: string = await this.audioTransformClient.transformAudioToText(audioBuffer);

        response.audio = audioBuffer;
        response.transcription = transcription;
    }
}
