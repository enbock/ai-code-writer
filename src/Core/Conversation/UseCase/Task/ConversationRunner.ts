import ConversationResponse from '../ConversationResponse';
import ChatMessageEntity from '../../../ChatMessageEntity';
import ChatResultEntity from '../ChatResultEntity';
import ChatClient from '../../ChatClient';
import ConversationStorage from '../../ConversationStorage';
import ConversationLogger from '../../ConversationLogger';
import StateStorage from '../../../StateStorage';
import SystemPromptService from '../../SystemPromptService';
import Config from '../../../../DependencyInjection/Config';

export default class ConversationRunner {
    constructor(
        private chatClient: ChatClient,
        private conversationStorage: ConversationStorage,
        private conversationLogger: ConversationLogger,
        private stateStorage: StateStorage,
        private systemPromptService: SystemPromptService,
        private config: Config
    ) {
    }

    public async continueConversation(response: ConversationResponse): Promise<void> {
        const isSuspended: boolean = this.stateStorage.getSuspendMode();
        const conversationHistory: Array<ChatMessageEntity> = isSuspended
            ? this.getSuspendHistory()
            : await this.conversationStorage.loadConversation()
        ;
        const chatResult: ChatResultEntity = await this.chatClient.runChat(conversationHistory);
        await this.conversationLogger.logConversation({chatResult: chatResult});

        const assistantAnswerMessage: ChatMessageEntity = new ChatMessageEntity();
        assistantAnswerMessage.role = 'assistant';
        assistantAnswerMessage.content = chatResult.content;
        assistantAnswerMessage.toolCalls = chatResult.toolCalls;
        conversationHistory.push(assistantAnswerMessage);

        if (!isSuspended) await this.conversationStorage.saveConversation(conversationHistory);

        response.result = chatResult;
        response.conversationComplete = chatResult.conversationComplete;
    }

    private getSuspendHistory(): Array<ChatMessageEntity> {
        const systemMessage: ChatMessageEntity = new ChatMessageEntity();
        systemMessage.role = 'system';
        systemMessage.content = this.systemPromptService.getSuspendModePrompt(this.config.magicWord);
        const userMessage: ChatMessageEntity = new ChatMessageEntity();
        userMessage.role = 'user';
        userMessage.content = this.conversationStorage.getSuspendTranscription();

        return [systemMessage, userMessage];
    }
}
