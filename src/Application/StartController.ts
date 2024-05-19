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
        const helloAudio: Buffer = await this.audioUseCase.transformTextToAudio('AI Code Writer ist bereit und hört nun zu.');
        await this.audioUseCase.playAudio(helloAudio);

        const response: AudioResponse = new AudioResponse();
        await this.audioUseCase.recordAndProcess(response);
        console.log('Transcription:', response.transcription);

        if (response.transcription != '') await this.runConversation(response);
    }

    private async runConversation(response: AudioResponse) {
        const conversationRequest: ConversationRequest = new ConversationRequest();
        conversationRequest.transcription = response.transcription;
        const conversationResponse: string = await this.gptConversationUseCase.handleConversation(conversationRequest);
        console.log('Conversation Response:', conversationResponse);

        const answerAudio: Buffer = await this.audioUseCase.transformTextToAudio(conversationResponse);
        await this.audioUseCase.playAudio(answerAudio);
    }
}
