import StartController from '../Application/StartController';
import ConversationChatCompletionClientOpenAiChat
    from '../Infrastructure/Conversation/ChatCompletionClient/OpenAi/OpenAiChat';
import AudioTransformClientOpenAiAudio from '../Infrastructure/AudioTransformClient/OpenAi/OpenAiAudio';
import NodeAudioRecorder from '../Infrastructure/AudioRecorder/Node/Node';
import NodeAudioPlayer from '../Infrastructure/AudioPlayer/Node/Node';
import * as dotenv from 'dotenv';
import {OpenAI} from 'openai';
import AudioUseCase from '../Core/Audio/AudioUseCase';
import ConversationUseCase from '../Core/Conversation/ConversationUseCase';

dotenv.config();

class GlobalContainer {
    private apiKey: string = String(process.env.OPENAI_API_KEY || '');
    private openAi: OpenAI = new OpenAI({
        organization: String(process.env.OPENAI_API_ORG || ''),
        apiKey: this.apiKey
    });
    private conversationChatCompletionClientOpenAiChat: ConversationChatCompletionClientOpenAiChat = new ConversationChatCompletionClientOpenAiChat(
        this.openAi
    );
    private audioTransformClientOpenAi: AudioTransformClientOpenAiAudio = new AudioTransformClientOpenAiAudio(
        'https://api.openai.com/v1/audio/speech',
        this.apiKey,
        this.openAi
    );
    private audioRecorder: NodeAudioRecorder = new NodeAudioRecorder();
    private audioPlayer: NodeAudioPlayer = new NodeAudioPlayer();
    private audioUseCase: AudioUseCase = new AudioUseCase(
        this.audioTransformClientOpenAi,
        this.audioRecorder,
        this.audioPlayer
    );
    private gptConversationUseCase: ConversationUseCase = new ConversationUseCase(
        this.conversationChatCompletionClientOpenAiChat
    );
    public startController: StartController = new StartController(
        this.audioUseCase,
        this.gptConversationUseCase
    );
}

const Container: GlobalContainer = new GlobalContainer();
export default Container;
