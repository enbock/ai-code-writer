import AudioUseCase from '../Core/Audio/AudioUseCase';
import AudioResponse from './AudioResponse';
import ConversationUseCase from '../Core/Conversation/ConversationUseCase';
import ConversationRequest from './ConversationRequest';

export default class StartController {
    constructor(
        private audioUseCase: AudioUseCase,
        private gptConversationUseCase: ConversationUseCase
    ) {
    }

    public async start(): Promise<void> {
        console.log('StartController is running...');

        const response: AudioResponse = new AudioResponse();
        await this.audioUseCase.recordAndProcess(response);
        console.log('Transcription:', response.transcription);

        const conversationRequest: ConversationRequest = new ConversationRequest();
        conversationRequest.transcription = response.transcription;
        const conversationResponse: string = await this.gptConversationUseCase.handleConversation(conversationRequest);
        console.log('Conversation Response:', conversationResponse);
    }
}
