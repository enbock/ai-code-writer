import ConversationLogger from '../../../Core/Conversation/ConversationLogger';
import * as fs from 'fs';
import * as path from 'path';

export default class FileConversationLogger implements ConversationLogger {
    private filePath: string;

    constructor(
        logDirectory: string = 'logs',
        logFileName: string = 'conversation.log'
    ) {
        this.filePath = path.join(logDirectory, logFileName);

        if (!fs.existsSync(logDirectory)) {
            fs.mkdirSync(logDirectory, {recursive: true});
        }
    }

    public async logConversation(history: Array<object>): Promise<void> {
        const logEntry: string = this.formatHistory(history);
        await fs.promises.appendFile(this.filePath, logEntry, 'utf8');
    }

    private formatHistory(history: Array<object>): string {
        return history.map(entry => JSON.stringify(entry)).join('\n') + '\n';
    }
}

