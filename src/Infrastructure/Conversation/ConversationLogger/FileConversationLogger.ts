import ConversationLogger from '../../../Core/Conversation/ConversationLogger';
import * as fs from 'fs/promises';

export default class FileConversationLogger implements ConversationLogger {
    constructor(
        private logFilePath: string
    ) {
    }

    public async logConversation(history: Array<object>): Promise<void> {
        const data: string = history.map(message => JSON.stringify(message)).join('\n');
        await fs.appendFile(this.logFilePath, data, 'utf8');
    }
}
