import ChatMessageEntity from '../ChatMessageEntity';
import ChatResultEntity from './UseCase/ChatResultEntity';

export default interface ChatClient {
    completePrompt(messages: Array<ChatMessageEntity>): Promise<ChatResultEntity>;
}
