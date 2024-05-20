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
import GptResponseProcessor from '../Core/Processor/GptResponseProcessor';
import FileCollectorService from '../Core/Conversation/FileCollectorService';
import FileCollector from '../Infrastructure/Conversation/FileCollector/FileCollector';
import FileActionUseCase from '../Core/FileActions/FileActionUseCase';
import FsDirectoryWatcher from '../Infrastructure/FileActions/FsDirectoryWatcher';
import {OpenAI} from 'openai';
import AudioUseCase from '../Core/Audio/AudioUseCase';
import NodeAudioRecorderConfig from '../Infrastructure/AudioRecorder/Node/NodeAudioRecorderConfig';
import ConversationUseCase from '../Core/Conversation/UseCase/ConversationUseCase';
import AudioRecorder from '../Core/Audio/AudioRecorder';
import CommandHandler from '../Core/Processor/CommandHandlers/CommandHandler';
import CommentCommand from '../Core/Processor/CommandHandlers/CommentCommand';
import FileWriteCommand from '../Core/Processor/CommandHandlers/FileWriteCommand';
import FileMoveCommand from '../Core/Processor/CommandHandlers/FileMoveCommand';
import FileDeleteCommand from '../Core/Processor/CommandHandlers/FileDeleteCommand';
import Config from './Config';

class GlobalContainer {
    private config: Config = new Config();
    private openAi: OpenAI = new OpenAI({
        organization: this.config.openAiOrg,
        apiKey: this.config.apiKey
    });

    private conversationStorage: InMemoryConversationStorage = new InMemoryConversationStorage();
    private systemPromptService: SystemPromptServiceDefinedSystemPrompt = new SystemPromptServiceDefinedSystemPrompt();
    private conversationLogger: NoopConversationLogger = new NoopConversationLogger();
    private fileSystemActionHandler: FileSystemActionHandler = new FileSystemActionHandler();
    private fileCollectorService: FileCollectorService = new FileCollector(
        '.',
        this.config.includePatterns,
        this.config.excludeDirs,
        this.config.excludeFiles
    );
    private conversationChatCompletionClientOpenAiChat: ConversationChatCompletionClientOpenAiChat = new ConversationChatCompletionClientOpenAiChat(
        this.openAi,
        this.config.openAiChatTemperature
    );
    private audioTransformClientOpenAi: AudioTransformClientOpenAiAudio = new AudioTransformClientOpenAiAudio(
        'https://api.openai.com/v1/audio/speech',
        this.config.apiKey,
        this.openAi,
        this.config.openAiAudioTemperature
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
    private commandHandlers: Array<CommandHandler> = [
        new CommentCommand(),
        new FileWriteCommand(),
        new FileMoveCommand(),
        new FileDeleteCommand()
    ];
    private gptResponseProcessor: GptResponseProcessor = new GptResponseProcessor(this.commandHandlers);
    private conversationUseCase: ConversationUseCase = new ConversationUseCase(
        this.conversationChatCompletionClientOpenAiChat,
        this.conversationStorage,
        this.conversationLogger,
        this.systemPromptService,
        this.gptResponseProcessor,
        this.fileCollectorService
    );
    public startController: StartController = new StartController(
        this.audioUseCase,
        this.conversationUseCase,
        this.fileActionUseCase,
        this.directoryWatcher
    );
}

const Container: GlobalContainer = new GlobalContainer();
export default Container;