import StartController from '../Application/StartController';
import ChatClientOpenAi from '../Infrastructure/Conversation/ChatCompletionClient/OpenAi/OpenAi';
import AudioTransformClientOpenAiAudio from '../Infrastructure/AudioTransformClient/OpenAi/OpenAiAudio';
import NodeAudioRecorder from '../Infrastructure/AudioRecorder/Node/Node';
import NodeAudioPlayer from '../Infrastructure/AudioPlayer/Node/Node';
import ConversationStorageInMemory from '../Infrastructure/Conversation/ConversationStorage/InMemory';
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
import ModeUseCase from '../Core/Conversation/ModeUseCase/ModeUseCase';
import StateStorageMemory from '../Infrastructure/StateStorage/Memory/Memory';
import StateStorage from '../Core/StateStorage';
import FileActionExecutor from '../Application/Task/FileActionExecutor';
import ToolCallConverter from '../Infrastructure/Conversation/ChatCompletionClient/OpenAi/ToolCallConverter';
import MessageEncoder from '../Infrastructure/Conversation/ChatCompletionClient/OpenAi/MessageEncoder';
import ConversationStorage from '../Core/Conversation/ConversationStorage';
import ConversationRunner from '../Core/Conversation/UseCase/Task/ConversationRunner';
import FileTask from '../Core/Conversation/UseCase/Task/FileTask';
import ChatClient from '../Core/Conversation/ChatClient';
import ConversationHandler from '../Application/Task/ConversationHandler';
import ActionHandler from '../Application/Task/ActionHandler';
import PauseHandler from '../Application/Task/PauseHandler';
import ExitHandler from '../Application/Task/ExitHandler';

class GlobalContainer {
    private config: Config = new Config();
    private openAi: OpenAI = new OpenAI({
        organization: this.config.openAiOrg,
        apiKey: this.config.apiKey
    });

    private conversationStorage: ConversationStorage = new ConversationStorageInMemory();
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
    private chatClient: ChatClient = new ChatClientOpenAi(
        this.openAi,
        this.config.openAiChatTemperature,
        this.logger,
        this.config.openAiChatModel,
        this.config.maxTokens,
        new ToolCallConverter(
            this.logger
        ),
        new MessageEncoder()
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
    private stateStorage: StateStorage = new StateStorageMemory();
    private conversationRunner: ConversationRunner = new ConversationRunner(
        this.chatClient,
        this.conversationStorage,
        this.conversationLogger,
        this.stateStorage,
        this.systemPromptService,
        this.config
    );
    private fileTask: FileTask = new FileTask(
        this.conversationLogger
    );
    private conversationUseCase: ConversationUseCase = new ConversationUseCase(
        this.conversationStorage,
        this.conversationLogger,
        this.systemPromptService,
        this.fileCollectorService,
        this.stateStorage,
        this.config,
        this.conversationRunner,
        this.fileTask
    );
    private modeUseCase: ModeUseCase = new ModeUseCase(
        this.stateStorage
    );
    private fileActionExecutor: FileActionExecutor = new FileActionExecutor(
        this.fileActionUseCase,
        this.conversationUseCase
    );
    private pauseHandler: PauseHandler = new PauseHandler(
        this.audioUseCase,
        this.modeUseCase
    );
    private exitHandler: ExitHandler = new ExitHandler();
    private actionHandler: ActionHandler = new ActionHandler(
        this.directoryWatcher,
        this.fileActionExecutor,
        this.modeUseCase,
        this.audioUseCase,
        this.conversationUseCase,
        this.pauseHandler,
        this.exitHandler
    );
    private conversationHandler: ConversationHandler = new ConversationHandler(
        this.audioUseCase,
        this.conversationUseCase,
        this.actionHandler
    );
    public startController: StartController = new StartController(
        this.audioUseCase,
        this.conversationUseCase,
        this.directoryWatcher,
        this.conversationHandler,
        this.exitHandler,
        this.pauseHandler
    );
}

const Container: GlobalContainer = new GlobalContainer();
export default Container;
