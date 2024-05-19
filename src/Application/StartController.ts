import AudioUseCase from '../Core/Audio/AudioUseCase';
import AudioResponse from './AudioResponse';
import ConversationUseCase from '../Core/Conversation/ConversationUseCase';
import ConversationRequest from './ConversationRequest';
import ConversationResponse from './ConversationResponse';
import FileActionUseCase from '../Core/FileActions/FileActionUseCase';

export default class StartController {
    constructor(
        private audioUseCase: AudioUseCase,
        private gptConversationUseCase: ConversationUseCase,
        private fileActionUseCase: FileActionUseCase
    ) {
    }

    public async start(): Promise<void> {
        await this.gptConversationUseCase.initialize();
        const helloAudio: Buffer = await this.audioUseCase.transformTextToAudio('AI Code Writer ist bereit und hört nun zu.');
        await this.audioUseCase.playAudio(helloAudio);

        // noinspection InfiniteLoopJS
        while (true) {
            const response: AudioResponse = new AudioResponse();

            await this.audioUseCase.recordAndProcess(response);
            console.log('Transcription:', response.transcription);

            if (response.transcription != '') await this.runConversation(response);
        }
    }

    private async runConversation(response: AudioResponse): Promise<void> {
        const conversationRequest: ConversationRequest = new ConversationRequest();
        conversationRequest.transcription = response.transcription;

        const conversationResponse: ConversationResponse = new ConversationResponse();
        await this.gptConversationUseCase.handleConversation(conversationRequest, conversationResponse);
        console.log('Conversation Response:', conversationResponse.comments);

        if (conversationResponse.comments != '') {
            const answerAudio: Buffer = await this.audioUseCase.transformTextToAudio(conversationResponse.comments);
            await this.audioUseCase.playAudio(answerAudio);
        }

        if (conversationResponse.actions.length > 0) {
            await this.fileActionUseCase.executeActions(conversationResponse.actions);
        }
    }
}
