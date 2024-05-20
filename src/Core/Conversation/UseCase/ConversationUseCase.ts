import {ChatCompletionMessageParam} from 'openai/resources';
import ConversationRequest from './ConversationRequest';
import ConversationResponse from './ConversationResponse';
import ChatCompletionClient from '../ChatCompletionClient';
import ConversationStorage from '../ConversationStorage';
import ConversationLogger from '../ConversationLogger';
import SystemPromptService from '../SystemPromptService';
import GptResponseProcessor from '../../Processor/GptResponseProcessor';
import FileCollectorService from '../FileCollectorService';
import AddToConversationHistoryRequest from './AddToConversationHistoryRequest';
import FileActionEntity from '../../Entities/FileActionEntity';

export default class ConversationUseCase {
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
        const conversationHistory: Array<ChatCompletionMessageParam> = await this.conversationStorage.loadConversation();
        const fileContent: Map<string, string> = await this.conversationStorage.loadFileContent();

        if (conversationHistory.length != 0) return;

        const systemPrompt = this.systemPromptService.getSystemPrompt();
        conversationHistory.push({role: 'system', content: systemPrompt});
        const filesContent = await this.fileCollectorService.collectFiles();
        conversationHistory.push({role: 'user', content: filesContent});

        await this.conversationStorage.saveConversation(conversationHistory);
        await this.conversationStorage.saveFileContent(fileContent);
    }

    public async handleConversation(request: ConversationRequest, response: ConversationResponse): Promise<void> {
        const conversationHistory: Array<ChatCompletionMessageParam> = await this.conversationStorage.loadConversation();
        await this.addModifiedFilesToConversation(conversationHistory);

        conversationHistory.push({role: 'user', content: request.transcription});
        const responseText: string = await this.chatCompletionClient.completePrompt(conversationHistory);
        conversationHistory.push({role: 'assistant', content: responseText});

        await this.conversationStorage.saveConversation(conversationHistory);
        await this.conversationLogger.logConversation(conversationHistory);
        const {comments, actions}: {
            comments: Array<string>,
            actions: Array<FileActionEntity>
        } = await this.gptResponseProcessor.processResponse(responseText);

        response.comments = comments.join('\n');
        response.actions = actions;
    }

    private async addModifiedFilesToConversation(conversationHistory: Array<ChatCompletionMessageParam>) {
        const map: Map<string, string> = await this.conversationStorage.loadFileContent();

        for (const fileContent of map.values()) {
            conversationHistory.push({role: 'user', content: fileContent});
        }

        await this.conversationStorage.saveFileContent(new Map());
    }

    public async addToConversationHistory(request: AddToConversationHistoryRequest): Promise<void> {
        const changedFiles: Map<string, string> = await this.conversationStorage.loadFileContent();

        changedFiles.set(request.fileName, request.transcription);

        await this.conversationStorage.saveFileContent(changedFiles);
    }
}