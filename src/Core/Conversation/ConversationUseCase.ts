import AudioTransformClient from '../AudioTransformClient';
import ConversationRequest from './ConversationRequest';
import RecordAndProcessResponse from './RecordAndProcessResponse';
import AudioRecorder from '../AudioRecorder';

export default class ConversationUseCase {
    constructor(
        private audioTransformClient: AudioTransformClient,
        private audioRecorder: AudioRecorder
    ) {
    }

    public async speak(request: ConversationRequest, response: RecordAndProcessResponse): Promise<void> {
        response.audio = await this.audioTransformClient.transformTextToAudio(request.text);
    }

    public async recordAndProcess(response: RecordAndProcessResponse): Promise<void> {
        const audioBuffer: Buffer = await this.audioRecorder.startRecording();
        const transcription: string = await this.audioTransformClient.transformAudioToText(audioBuffer);

        response.audio = audioBuffer;
        response.transcription = transcription;
    }
}
