import ChatMessageEntity from '../ChatMessageEntity';
import ChatResultEntity from './UseCase/ChatResultEntity';

export default interface ChatClient {
    runChat(messages: Array<ChatMessageEntity>): Promise<ChatResultEntity>;
}
