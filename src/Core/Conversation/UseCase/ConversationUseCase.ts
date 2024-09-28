import ConversationRequest from './ConversationRequest';
import ConversationResponse from './ConversationResponse';
import ChatClient from '../ChatClient';
import ConversationStorage from '../ConversationStorage';
import ConversationLogger from '../ConversationLogger';
import SystemPromptService from '../SystemPromptService';
import FileCollectorService, {FileData} from '../FileCollectorService';
import AddToConversationHistoryRequest from './AddToConversationHistoryRequest';
import ChatMessageEntity from '../../ChatMessageEntity';
import ChatResultEntity from './ChatResultEntity';

export default class ConversationUseCase {
    constructor(
        private chatCompletionClient: ChatClient,
        private conversationStorage: ConversationStorage,
        private conversationLogger: ConversationLogger,
        private systemPromptService: SystemPromptService,
        private fileCollectorService: FileCollectorService
    ) {
    }

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
            messageItem.role = 'system';
            messageItem.content = 'Changed file ' + filePath + ':\n```\n' + content + '\n```';
            messageItem.filePath = filePath;
            conversationHistory.push(messageItem);
            await this.conversationLogger.logConversation(messageItem);
        }

        await this.conversationStorage.saveConversation(conversationHistory);
    }

    public async addUserMessageToConversation(request: ConversationRequest): Promise<void> {
        const conversationHistory: Array<ChatMessageEntity> = await this.conversationStorage.loadConversation();

        const userRequestMessage: ChatMessageEntity = new ChatMessageEntity();
        userRequestMessage.role = request.role;
        userRequestMessage.content = request.transcription;
        conversationHistory.push(userRequestMessage);

        await this.conversationLogger.logConversation(userRequestMessage);
        await this.conversationStorage.saveConversation(conversationHistory);
    }

    public async continueConversation(response: ConversationResponse): Promise<void> {
        const conversationHistory: Array<ChatMessageEntity> = await this.conversationStorage.loadConversation();
        const chatResult: ChatResultEntity = await this.chatCompletionClient.completePrompt(conversationHistory);
        await this.conversationLogger.logConversation({chatResult: chatResult});

        const assistantAnswerMessage: ChatMessageEntity = new ChatMessageEntity();
        assistantAnswerMessage.role = 'assistant';
        assistantAnswerMessage.content = chatResult.content;
        assistantAnswerMessage.toolCalls = chatResult.toolCalls;
        conversationHistory.push(assistantAnswerMessage);

        await this.conversationStorage.saveConversation(conversationHistory);

        response.result = chatResult;
        response.conversationComplete = chatResult.conversationComplete;
    }

    public async addToConversationHistory(request: AddToConversationHistoryRequest): Promise<void> {
        const conversationHistory: Array<ChatMessageEntity> = await this.conversationStorage.loadConversation();
        this.removeOldFileFromHistory(conversationHistory, request.fileName);

        const messageItem: ChatMessageEntity = new ChatMessageEntity();
        messageItem.callId = request.callId;
        messageItem.role = request.role;
        messageItem.content = request.content;
        messageItem.filePath = request.fileName;
        conversationHistory.push(messageItem);

        await this.conversationLogger.logConversation(messageItem);
        await this.conversationStorage.saveConversation(conversationHistory);
    }

    private removeOldFileFromHistory(
        conversationHistory: Array<ChatMessageEntity>,
        filePath: string
    ): void {
        const existingMessageIndex: number = conversationHistory.findIndex(
            message => message.filePath === filePath
        );
        if (existingMessageIndex == -1) return;

        const deletedMessage: ChatMessageEntity = conversationHistory.splice(
                existingMessageIndex,
                1
            )[0]
        ;
        this.removeCallFromResultMessages(deletedMessage, conversationHistory);
        this.removeCallFromMessagesToolCalls(deletedMessage, conversationHistory);

    }

    private removeCallFromResultMessages(
        deletedMessage: ChatMessageEntity,
        conversationHistory: Array<ChatMessageEntity>
    ): void {
        for (const deletedCall of deletedMessage.toolCalls) {
            const callId: string = deletedCall.id;
            const index: number = conversationHistory.findIndex(c => c.callId == callId);

            if (index == -1) continue;

            conversationHistory.splice(index, 1);
        }
    }

    private removeCallFromMessagesToolCalls(
        deletedMessage: ChatMessageEntity,
        conversationHistory: Array<ChatMessageEntity>
    ): void {
        for (const message of conversationHistory) {
            const index: number = message.toolCalls.findIndex(c => c.id == deletedMessage.callId);

            if (index == -1) continue;

            message.toolCalls.splice(index, 1);
        }
    }
}
