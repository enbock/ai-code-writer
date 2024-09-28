import AudioResponse from '../Response/AudioResponse';
import ConversationRequest from '../ConversationRequest';
import ConversationResponse from '../ConversationResponse';
import AudioUseCase from '../../Core/Audio/AudioUseCase';
import ConversationUseCase from '../../Core/Conversation/UseCase/ConversationUseCase';
import ActionHandler from './ActionHandler';

export default class ConversationHandler {

    constructor(
        private audioUseCase: AudioUseCase,
        private gptConversationUseCase: ConversationUseCase,
        private actionHandler: ActionHandler
    ) {
    }

    public async runConversation(response: AudioResponse): Promise<void> {
        const conversationRequest: ConversationRequest = new ConversationRequest();
        conversationRequest.transcription = response.transcription;
        console.log('Starte KI Anfrage...');
        await this.gptConversationUseCase.addUserMessageToConversation(conversationRequest);
        await this.completeConversation();
    }

    public async completeConversation(): Promise<void> {
        let conversationResponse: ConversationResponse;
        do {
            conversationResponse = new ConversationResponse();
            await this.gptConversationUseCase.continueConversation(conversationResponse);
            console.log('KI Antwort:', conversationResponse.result.content);

            await Promise.all([
                this.actionHandler.executeActions(conversationResponse),
                this.playAnswer(conversationResponse.result.content)
            ]);
        } while (conversationResponse.conversationComplete == false);
    }

    private async playAnswer(content: string): Promise<void> {
        if (content == '') return;
        const answerAudio: Buffer = await this.audioUseCase.transformTextToAudio(content);
        await this.audioUseCase.playAudio(answerAudio);
    }
}