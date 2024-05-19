import StartController from '../Application/StartController';
import ConversationChatCompletionClientOpenAiChat
    from '../Infrastructure/Conversation/ChatCompletionClient/OpenAi/OpenAiChat';
import AudioTransformClientOpenAiAudio from '../Infrastructure/AudioTransformClient/OpenAi/OpenAiAudio';
import NodeAudioRecorder from '../Infrastructure/AudioRecorder/Node/Node';
import NodeAudioPlayer from '../Infrastructure/AudioPlayer/Node/Node';
import InMemoryConversationStorage
    from '../Infrastructure/Conversation/ConversationStorage/InMemoryConversationStorage';
import SystemPromptServiceDefinedSystemPrompt from '../Infrastructure/Conversation/SystemPrompt/DefinedSystemPrompt';
import FileConversationLogger from '../Infrastructure/Conversation/ConversationLogger/FileConversationLogger';
import FileSystemActionHandler from '../Infrastructure/FileActions/FileSystemActionHandler';
import GptResponseProcessor from '../Core/Processor/GptResponseProcessor';
import FileCollectorService from '../Core/Conversation/FileCollectorService';
import FileCollector from '../Infrastructure/Conversation/FileCollector/FileCollector';
import FileActionUseCase from '../Core/FileActions/FileActionUseCase';
import FsDirectoryWatcher from '../Infrastructure/FileActions/FsDirectoryWatcher';
import * as dotenv from 'dotenv';
import {OpenAI} from 'openai';
import AudioUseCase from '../Core/Audio/AudioUseCase';
import NodeAudioRecorderConfig from '../Infrastructure/AudioRecorder/Node/NodeAudioRecorderConfig';
import ConversationUseCase from '../Core/Conversation/UseCase/ConversationUseCase';
import AudioRecorder from '../Core/Audio/AudioRecorder';
import SoxRecorder from '../Infrastructure/AudioRecorder/Sox/SoxRecorder';
import {SoxRecordingFactory} from '../Infrastructure/AudioRecorder/Sox/SoxConnector/Recording';

dotenv.config();

class GlobalContainer {
    private apiKey: string = String(process.env.OPENAI_API_KEY || '');
    private openAi: OpenAI = new OpenAI({
        organization: String(process.env.OPENAI_API_ORG || ''),
        apiKey: this.apiKey
    });
    private useNodeAudioInput: boolean = String(process.env.USE_NODE_AUDIO_INPUT || '') === 'true';

    private conversationStorage: InMemoryConversationStorage = new InMemoryConversationStorage();
    private systemPromptService: SystemPromptServiceDefinedSystemPrompt = new SystemPromptServiceDefinedSystemPrompt();
    private conversationLogger: FileConversationLogger = new FileConversationLogger('conversation_log.txt');
    private fileSystemActionHandler: FileSystemActionHandler = new FileSystemActionHandler();
    private gptResponseProcessor: GptResponseProcessor = new GptResponseProcessor();

    private fileCollectorService: FileCollectorService = new FileCollector(
        '.',
        ['*.ts', '*.json', '*.yaml'],
        ['node_modules', 'build', '.git'],
        ['package-lock.json', 'conversation_log.txt', '.*']
    );

    private conversationChatCompletionClientOpenAiChat: ConversationChatCompletionClientOpenAiChat = new ConversationChatCompletionClientOpenAiChat(
        this.openAi
    );
    private audioTransformClientOpenAi: AudioTransformClientOpenAiAudio = new AudioTransformClientOpenAiAudio(
        'https://api.openai.com/v1/audio/speech',
        this.apiKey,
        this.openAi
    );

    private audioRecorderConfig: NodeAudioRecorderConfig = new NodeAudioRecorderConfig();
    private audioRecorder: AudioRecorder = this.useNodeAudioInput
        ? new NodeAudioRecorder(this.audioRecorderConfig)
        : new SoxRecorder(SoxRecordingFactory)
    ;
    private audioPlayer: NodeAudioPlayer = new NodeAudioPlayer();
    private audioUseCase: AudioUseCase = new AudioUseCase(
        this.audioTransformClientOpenAi,
        this.audioRecorder,
        this.audioPlayer
    );
    private conversationUseCase: ConversationUseCase = new ConversationUseCase(
        this.conversationChatCompletionClientOpenAiChat,
        this.conversationStorage,
        this.conversationLogger,
        this.systemPromptService,
        this.gptResponseProcessor,
        this.fileCollectorService
    );
    private fileActionUseCase: FileActionUseCase = new FileActionUseCase(this.fileSystemActionHandler);
    private directoryWatcher: FsDirectoryWatcher = new FsDirectoryWatcher(
        '.',
        ['*.ts', '*.json', '*.yaml'],
        ['node_modules', 'build', '.git'],
        ['package-lock.json', 'conversation_log.txt', '.*']
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
