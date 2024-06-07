import ConversationRequest from './ConversationRequest';
import ConversationResponse from './ConversationResponse';
import ChatCompletionClient from '../ChatCompletionClient';
import ConversationStorage from '../ConversationStorage';
import ConversationLogger from '../ConversationLogger';
import SystemPromptService from '../SystemPromptService';
import GptResponseProcessor from '../../Processor/GptResponseProcessor';
import FileCollectorService, {FileData} from '../FileCollectorService';
import AddToConversationHistoryRequest from './AddToConversationHistoryRequest';
import FileActionEntity from '../../FileActionEntity';
import ChatMessageEntity from '../../ChatMessageEntity';
import ActionType from '../../ActionType';
import FileActionType from '../../FileActionType';

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

    private fileActionToMessageActionMap: Map<FileActionType, ActionType> = new Map([
        [FileActionType.WRITE, ActionType.FILE_WRITE],
        [FileActionType.DELETE, ActionType.FILE_DELETE]
    ]);

    public async initialize(): Promise<void> {
        const conversationHistory: Array<ChatMessageEntity> = await this.conversationStorage.loadConversation();

        if (conversationHistory.length != 0) return;

        const systemPrompt: ChatMessageEntity = new ChatMessageEntity();
        systemPrompt.role = 'system';
        systemPrompt.content = this.systemPromptService.getSystemPrompt();
        conversationHistory.push(systemPrompt);
        await this.conversationLogger.logConversation(systemPrompt);
        const filesContent: Array<FileData> = await this.fileCollectorService.collectFiles();

        for (const {filePath, content} of filesContent) {
            const messageItem = new ChatMessageEntity();
            messageItem.role = 'user';
            messageItem.content = content;
            messageItem.filePath = filePath;
            messageItem.action = ActionType.FILE_WRITE;
            conversationHistory.push(messageItem);
            await this.conversationLogger.logConversation(messageItem);
        }

        await this.conversationStorage.saveConversation(conversationHistory);
    }

    public async handleConversation(request: ConversationRequest, response: ConversationResponse): Promise<void> {
        const conversationHistory: Array<ChatMessageEntity> = await this.conversationStorage.loadConversation();

        const userRequestMessage: ChatMessageEntity = new ChatMessageEntity();
        userRequestMessage.role = 'user';
        userRequestMessage.content = request.transcription;
        userRequestMessage.action = ActionType.COMMENT;
        conversationHistory.push(userRequestMessage);
        await this.conversationLogger.logConversation(userRequestMessage);

        const responseText: string = await this.chatCompletionClient.completePrompt(conversationHistory);
        await this.conversationLogger.logConversation({RAW: responseText});
        const {comments, actions}: {
            comments: Array<string>,
            actions: Array<FileActionEntity>
        } = await this.gptResponseProcessor.processResponse(responseText);

        for (const action of actions) {
            this.removeOldFileFromHistory(conversationHistory, action.filePath);

            const actionMessage: ChatMessageEntity = new ChatMessageEntity();
            actionMessage.role = 'assistant';
            actionMessage.content = action.content;
            actionMessage.filePath = action.filePath;
            actionMessage.action = this.fileActionToMessageActionMap.get(action.actionType) || ActionType.COMMENT;
            conversationHistory.push(actionMessage);
            await this.conversationLogger.logConversation(actionMessage);
        }

        const assistantAnswerMessage: ChatMessageEntity = new ChatMessageEntity();
        assistantAnswerMessage.role = 'assistant';
        assistantAnswerMessage.content = comments.join('\n');
        assistantAnswerMessage.action = ActionType.COMMENT;
        conversationHistory.push(assistantAnswerMessage);
        await this.conversationLogger.logConversation(assistantAnswerMessage);

        await this.conversationStorage.saveConversation(conversationHistory);

        response.comments = comments.join('\n');
        response.actions = actions;
    }

    public async addToConversationHistory(request: AddToConversationHistoryRequest): Promise<void> {
        const conversationHistory: Array<ChatMessageEntity> = await this.conversationStorage.loadConversation();
        this.removeOldFileFromHistory(conversationHistory, request.fileName);

        const messageItem: ChatMessageEntity = new ChatMessageEntity();
        messageItem.role = 'user';
        messageItem.content = request.content;
        messageItem.filePath = request.fileName;
        messageItem.action = request.action;
        conversationHistory.push(messageItem);
        await this.conversationLogger.logConversation(messageItem);

        await this.conversationStorage.saveConversation(conversationHistory);
    }

    private removeOldFileFromHistory(conversationHistory: Array<ChatMessageEntity>, filePath: string): void {
        const existingMessageIndex: number = conversationHistory.findIndex(
            message => message.filePath === filePath
        );

        if (existingMessageIndex !== -1) {
            conversationHistory.splice(existingMessageIndex, 1);
        }
    }
}
