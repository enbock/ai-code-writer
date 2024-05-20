import CommandHandler from './CommandHandler';
import CommandWords from '../CommandWords';
import FileActionEntity from '../../Entities/FileActionEntity';

export default class FileWriteCommand implements CommandHandler {
    public canHandle(command: string): boolean {
        return command.startsWith(CommandWords.FILE_WRITE);
    }

    public async handle(section: Array<string>): Promise<{ comments: string[], actions: FileActionEntity[] }> {
        const filePath: string = String(section.shift()).slice(CommandWords.FILE_WRITE.length).trim();
        const content: string = section.join('\n');
        const fileAction: FileActionEntity = new FileActionEntity();
        fileAction.actionType = CommandWords.FILE_WRITE;
        fileAction.filePath = filePath;
        fileAction.content = content;
        return {comments: [], actions: [fileAction]};
    }
}
