import ConversationUseCase from '../Core/Conversation/ConversationUseCase';
import RecordAndProcessResponse from './RecordAndProcessResponse';

export default class StartController {
    constructor(
        private conversationUseCase: ConversationUseCase
    ) {
    }

    public async start(): Promise<void> {
        console.log('StartController is running...');

        const response: RecordAndProcessResponse = new RecordAndProcessResponse();

        await this.conversationUseCase.recordAndProcess(response);
        console.log('Transcription:', response.transcription);
    }
}
