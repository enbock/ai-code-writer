import StartController from '../Application/StartController';
import ConversationChatCompletionClientOpenAiChat
    from '../Infrastructure/Conversation/ChatCompletionClient/OpenAi/OpenAiChat';
import AudioTransformClientOpenAiAudio from '../Infrastructure/AudioTransformClient/OpenAi/OpenAiAudio';
import * as dotenv from 'dotenv';
import {OpenAI} from 'openai';
import {record} from 'node-record-lpcm16';
import ConversationUseCase from '../Core/Conversation/ConversationUseCase';
import NodeAudioRecorder from '../Infrastructure/AudioRecorder/NodeAudioRecorder';

dotenv.config();

class GlobalContainer {
    private apiKey: string = String(process.env.OPENAI_API_KEY || '');
    private openAi: OpenAI = new OpenAI({
        organization: String(process.env.OPENAI_API_ORG || ''),
        apiKey: this.apiKey
    });

    private conversationChatCompletionClientOpenAiChat: ConversationChatCompletionClientOpenAiChat = new ConversationChatCompletionClientOpenAiChat(this.openAi);
    private audioTransformClientOpenAi: AudioTransformClientOpenAiAudio = new AudioTransformClientOpenAiAudio(
        'https://api.openai.com/v1/audio/speech',
        this.apiKey,
        this.openAi
    );
    private audioRecorder: NodeAudioRecorder = new NodeAudioRecorder(record);
    private conversationUseCase: ConversationUseCase = new ConversationUseCase(this.audioTransformClientOpenAi, this.audioRecorder);

    public startController: StartController = new StartController(this.conversationUseCase);
}

const Container: GlobalContainer = new GlobalContainer();
export default Container;
