import ConversationLogger from '../../../Core/Conversation/ConversationLogger';
import * as fs from 'fs';
import * as path from 'path';

export default class FileConversationLogger implements ConversationLogger {
    constructor(
        private logDirectory: string = 'logs'
    ) {
        this.getFileName(logDirectory);

        if (!fs.existsSync(logDirectory)) {
            fs.mkdirSync(logDirectory, {recursive: true});
        }
    }

    private getFileName(logDirectory: string): string {
        const date: Date = new Date();
        const timestamp: string = date.toISOString().replace(/[:.]/g, '-').slice(0, 15);
        const logFileName: string = `conversation-${timestamp}.log`;
        return path.join(logDirectory, logFileName);
    }

    public async logConversation(history: object): Promise<void> {
        const logEntry: string = JSON.stringify(history) + '\n';
        await fs.promises.appendFile(this.getFileName(this.logDirectory), logEntry, 'utf8');
    }
}
