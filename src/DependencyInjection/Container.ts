import StartController from '../Application/StartController';
import ConversationChatCompletionClientOpenAiChat
    from '../Infrastructure/Conversation/ChatCompletionClient/OpenAi/OpenAiChat';
import AudioTransformClientOpenAiAudio from '../Infrastructure/AudioTransformClient/OpenAi/OpenAiAudio';
import NodeAudioRecorder from '../Infrastructure/AudioRecorder/Node/Node';
import NodeAudioPlayer from '../Infrastructure/AudioPlayer/Node/Node';
import InMemoryConversationStorage
    from '../Infrastructure/Conversation/ConversationStorage/InMemoryConversationStorage';
import SystemPromptServiceDefinedSystemPrompt from '../Infrastructure/Conversation/SystemPrompt/DefinedSystemPrompt';
import NoopConversationLogger from '../Infrastructure/Conversation/ConversationLogger/NoopConversationLogger';
import FileSystemActionHandler from '../Infrastructure/FileActions/FileSystemActionHandler';
import FileCollectorService from '../Core/Conversation/FileCollectorService';
import FileCollector from '../Infrastructure/Conversation/FileCollector/FileCollector';
import FileActionUseCase from '../Core/FileActions/FileActionUseCase';
import FsDirectoryWatcher from '../Infrastructure/FileActions/FsDirectoryWatcher';
import {OpenAI} from 'openai';
import AudioUseCase from '../Core/Audio/AudioUseCase';
import NodeAudioRecorderConfig from '../Infrastructure/AudioRecorder/Node/NodeAudioRecorderConfig';
import ConversationUseCase from '../Core/Conversation/UseCase/ConversationUseCase';
import AudioRecorder from '../Core/Audio/AudioRecorder';
import Config from './Config';
import Logger from '../Infrastructure/Logger/Logger';
import FileConversationLogger from '../Infrastructure/Conversation/ConversationLogger/FileConversationLogger';
import ConversationLogger from '../Core/Conversation/ConversationLogger';
import PauseUseCase from '../Core/Conversation/PauseUseCase/PauseUseCase';
import StateStorageMemory from '../Infrastructure/StateStorage/Memory/Memory';
import StateStorage from '../Core/StateStorage';
import FileActionExecutor from '../Application/Task/FileActionExecutor';
import ToolCallConverter from '../Infrastructure/Conversation/ChatCompletionClient/OpenAi/ToolCallConverter';
import MessageEncoder from '../Infrastructure/Conversation/ChatCompletionClient/OpenAi/MessageEncoder';

class GlobalContainer {
    private config: Config = new Config();
    private openAi: OpenAI = new OpenAI({
        organization: this.config.openAiOrg,
        apiKey: this.config.apiKey
    });

    private conversationStorage: InMemoryConversationStorage = new InMemoryConversationStorage();
    private systemPromptService: SystemPromptServiceDefinedSystemPrompt = new SystemPromptServiceDefinedSystemPrompt();
    private conversationLogger: ConversationLogger = this.config.logToFile ? new FileConversationLogger() : new NoopConversationLogger();
    private fileSystemActionHandler: FileSystemActionHandler = new FileSystemActionHandler(new Logger());
    private fileCollectorService: FileCollectorService = new FileCollector(
        '.',
        this.config.includePatterns,
        this.config.excludeDirs,
        this.config.excludeFiles
    );
    private logger: Logger = new Logger();
    private conversationChatCompletionClientOpenAiChat: ConversationChatCompletionClientOpenAiChat = new ConversationChatCompletionClientOpenAiChat(
        this.openAi,
        this.config.openAiChatTemperature,
        this.logger,
        this.config.openAiChatModel,
        this.config.maxTokens,
        new ToolCallConverter(
            this.logger
        ),
        new MessageEncoder(),
        this.conversationLogger
    );
    private audioTransformClientOpenAi: AudioTransformClientOpenAiAudio = new AudioTransformClientOpenAiAudio(
        'https://api.openai.com/v1/audio/speech',
        this.config.apiKey,
        this.openAi,
        this.config.openAiAudioTemperature,
        this.logger
    );
    private audioRecorderConfig: NodeAudioRecorderConfig = new NodeAudioRecorderConfig();
    private audioRecorder: AudioRecorder = new NodeAudioRecorder(this.audioRecorderConfig);
    private audioPlayer: NodeAudioPlayer = new NodeAudioPlayer();
    private audioUseCase: AudioUseCase = new AudioUseCase(
        this.audioTransformClientOpenAi,
        this.audioRecorder,
        this.audioPlayer
    );
    private fileActionUseCase: FileActionUseCase = new FileActionUseCase(this.fileSystemActionHandler);
    private directoryWatcher: FsDirectoryWatcher = new FsDirectoryWatcher(
        '.',
        this.config.includePatterns,
        this.config.excludeDirs,
        this.config.excludeFiles
    );
    private conversationUseCase: ConversationUseCase = new ConversationUseCase(
        this.conversationChatCompletionClientOpenAiChat,
        this.conversationStorage,
        this.conversationLogger,
        this.systemPromptService,
        this.fileCollectorService
    );
    private stateStorage: StateStorage = new StateStorageMemory();
    private pauseUseCase: PauseUseCase = new PauseUseCase(
        this.stateStorage
    );
    private fileActionExecutor: FileActionExecutor = new FileActionExecutor(
        this.fileActionUseCase,
        this.conversationUseCase
    );
    public startController: StartController = new StartController(
        this.audioUseCase,
        this.conversationUseCase,
        this.directoryWatcher,
        this.pauseUseCase,
        this.fileActionExecutor
    );
}

const Container: GlobalContainer = new GlobalContainer();
export default Container;
