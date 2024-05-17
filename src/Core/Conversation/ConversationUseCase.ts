import ChatCompletionClient from './ChatCompletionClient';
import {ChatCompletionMessageParam} from 'openai/resources';
import ConversationRequest from './ConversationRequest';

export default class ConversationUseCase {
    constructor(
        private chatCompletionClient: ChatCompletionClient
    ) {
    }

    public async handleConversation(request: ConversationRequest): Promise<string> {
        const messages: Array<ChatCompletionMessageParam> = [
            {role: 'system', content: 'You are a helpful assistant.'},
            {role: 'user', content: request.transcription}
        ];

        return await this.chatCompletionClient.completePrompt(messages);
    }
}
