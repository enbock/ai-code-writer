import ChatCompletionClient from './ChatCompletionClient';
import ConversationStorage from './ConversationStorage';
import ConversationLogger from './ConversationLogger';
import SystemPromptService from './SystemPromptService';
import GptResponseProcessor from '../Processor/GptResponseProcessor';
import FileCollectorService from './FileCollectorService';
import {ChatCompletionMessageParam} from 'openai/resources';
import ConversationRequest from './ConversationRequest';
import ConversationResponse from './ConversationResponse';

export default class ConversationUseCase {
    private conversationHistory: Array<ChatCompletionMessageParam> = [];

    constructor(
        private chatCompletionClient: ChatCompletionClient,
        private conversationStorage: ConversationStorage,
        private conversationLogger: ConversationLogger,
        private systemPromptService: SystemPromptService,
        private gptResponseProcessor: GptResponseProcessor,
        private fileCollectorService: FileCollectorService
    ) {
    }

    public async initialize(): Promise<void> {
        this.conversationHistory = await this.conversationStorage.loadConversation();
        if (this.conversationHistory.length != 0) return;
        const systemPrompt = this.systemPromptService.getSystemPrompt();
        this.conversationHistory.push({role: 'system', content: systemPrompt});
        const filesContent = await this.fileCollectorService.collectFiles();
        this.conversationHistory.push({role: 'user', content: filesContent});
        console.log('>>>', this.conversationHistory);
    }

    public async handleConversation(request: ConversationRequest, response: ConversationResponse): Promise<void> {
        this.conversationHistory.push({role: 'user', content: request.transcription});
        const responseText: string = await this.chatCompletionClient.completePrompt(this.conversationHistory);
        this.conversationHistory.push({role: 'assistant', content: responseText});

        await this.conversationStorage.saveConversation(this.conversationHistory);
        await this.conversationLogger.logConversation(this.conversationHistory);
        const {comments, actions}: {
            comments: Array<string>,
            actions: Array<string>
        } = await this.gptResponseProcessor.processResponse(responseText);

        response.comments = comments.join('\n');
        response.actions = actions;
    }
}
