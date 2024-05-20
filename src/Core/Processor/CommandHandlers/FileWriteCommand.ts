import CommandHandler from './CommandHandler';
import CommandWords from '../CommandWords';

export default class FileWriteCommand implements CommandHandler {
    public canHandle(command: string): boolean {
        return command.startsWith(CommandWords.FILE_WRITE);
    }

    public async handle(section: Array<string>): Promise<{ comments: string[], actions: string[] }> {
        const filePath: string = section.shift()!.slice(CommandWords.FILE_WRITE.length).trim();
        const content: string = section.join('\n');
        return {comments: [], actions: [`${CommandWords.FILE_WRITE} ${filePath}\n${content}`]};
    }
}