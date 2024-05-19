import ChatCompletionClient from './ChatCompletionClient';
import ConversationStorage from './ConversationStorage';
import {ChatCompletionMessageParam} from 'openai/resources';
import ConversationRequest from './ConversationRequest';

export default class ConversationUseCase {
    private conversationHistory: Array<ChatCompletionMessageParam> = [
        {role: 'system', content: 'You are a helpful assistant.'}
    ];

    constructor(
        private chatCompletionClient: ChatCompletionClient,
        private conversationStorage: ConversationStorage
    ) {
    }

    public async initialize(): Promise<void> {
        this.conversationHistory = await this.conversationStorage.loadConversation();
        if (this.conversationHistory.length === 0) {
            this.conversationHistory.push({role: 'system', content: 'You are a helpful assistant.'});
        }
    }

    public async handleConversation(request: ConversationRequest): Promise<string> {
        this.conversationHistory.push({role: 'user', content: request.transcription});
        const responseText: string = await this.chatCompletionClient.completePrompt(this.conversationHistory);
        this.conversationHistory.push({role: 'assistant', content: responseText});

        await this.conversationStorage.saveConversation(this.conversationHistory);

        return responseText;
    }
}
