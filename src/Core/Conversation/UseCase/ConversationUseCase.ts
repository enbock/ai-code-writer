import ConversationRequest from './ConversationRequest';
import ConversationResponse from './ConversationResponse';
import ConversationStorage from '../ConversationStorage';
import ConversationLogger from '../ConversationLogger';
import SystemPromptService from '../SystemPromptService';
import FileCollectorService, {FileData} from '../FileCollectorService';
import ChatMessageEntity from '../../ChatMessageEntity';
import StateStorage from '../../StateStorage';
import Config from '../../../DependencyInjection/Config';
import ConversationRunner from './Task/ConversationRunner';
import FileTask from './Task/FileTask';
import AddToConversationHistoryRequest from './AddToConversationHistoryRequest';

export default class ConversationUseCase {
    constructor(
        private conversationStorage: ConversationStorage,
        private conversationLogger: ConversationLogger,
        private systemPromptService: SystemPromptService,
        private fileCollectorService: FileCollectorService,
        private stateStorage: StateStorage,
        private config: Config,
        private conversationRunner: ConversationRunner,
        private fileTask: FileTask
    ) {
    }

    public async initialize(): Promise<void> {
        const conversationHistory: Array<ChatMessageEntity> = await this.conversationStorage.loadConversation();

        if (conversationHistory.length != 0) return;

        const systemPrompt: ChatMessageEntity = new ChatMessageEntity();
        systemPrompt.role = 'system';
        systemPrompt.content = this.systemPromptService.getSystemPrompt(this.config.magicWord);
        conversationHistory.push(systemPrompt);
        // await this.conversationLogger.logConversation(systemPrompt);

        await this.conversationStorage.saveConversation(conversationHistory);
    }

    public async addProjectFiles(): Promise<void> {
        const conversationHistory: Array<ChatMessageEntity> = await this.conversationStorage.loadConversation();
        const filesContents: Array<FileData> = await this.fileCollectorService.collectFiles();

        await this.fileTask.addFileContentsToInitialConversation(filesContents, conversationHistory);
        // this.fileTask.addFileListToInitialConversation(filesContents, conversationHistory);

        await this.conversationStorage.saveConversation(conversationHistory);
    }

    public async addUserMessageToConversation(request: ConversationRequest): Promise<void> {
        if (this.stateStorage.getSuspendMode()) {
            this.conversationStorage.setSuspendTranscription(request.transcription);
            return;
        }
        await this.addCommonUserMessage(request);
    }

    public async continueConversation(response: ConversationResponse): Promise<void> {
        await this.conversationRunner.continueConversation(response);
    }

    public async addToConversationHistory(request: AddToConversationHistoryRequest): Promise<void> {
        if (this.stateStorage.getSuspendMode()) return;

        const conversationHistory: Array<ChatMessageEntity> = await this.conversationStorage.loadConversation();
        this.fileTask.removeOldFileFromHistory(conversationHistory, request.fileName);

        const messageItem: ChatMessageEntity = new ChatMessageEntity();
        messageItem.callId = request.callId;
        messageItem.role = request.role;
        messageItem.content = request.content;
        messageItem.filePath = request.fileName;
        conversationHistory.push(messageItem);

        await this.conversationLogger.logConversation(messageItem);
        await this.conversationStorage.saveConversation(conversationHistory);
    }

    private async addCommonUserMessage(request: ConversationRequest): Promise<void> {
        const conversationHistory: Array<ChatMessageEntity> = await this.conversationStorage.loadConversation();

        const userRequestMessage: ChatMessageEntity = new ChatMessageEntity();
        userRequestMessage.role = request.role;
        userRequestMessage.content = request.transcription;
        conversationHistory.push(userRequestMessage);

        await this.conversationLogger.logConversation(userRequestMessage);
        await this.conversationStorage.saveConversation(conversationHistory);
    }

    public async wakeUpConversation(): Promise<void> {
        const conversationHistory: Array<ChatMessageEntity> = await this.conversationStorage.loadConversation();

        const systemMessage: ChatMessageEntity = new ChatMessageEntity();
        systemMessage.content = 'User waked you up.';
        systemMessage.role = 'system';
        conversationHistory.push(systemMessage);
        await this.conversationLogger.logConversation(systemMessage);

        const userMessage: ChatMessageEntity = new ChatMessageEntity();
        userMessage.content = this.conversationStorage.getSuspendTranscription();
        userMessage.role = 'user';
        conversationHistory.push(userMessage);
        await this.conversationLogger.logConversation(userMessage);

        await this.conversationStorage.saveConversation(conversationHistory);
    }
}
