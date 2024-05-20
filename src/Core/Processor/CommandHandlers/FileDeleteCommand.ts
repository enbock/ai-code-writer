import CommandHandler from './CommandHandler';
import CommandWords from '../CommandWords';
import FileActionEntity from '../../Entities/FileActionEntity';

export default class FileDeleteCommand implements CommandHandler {
    public canHandle(command: string): boolean {
        return command.startsWith(CommandWords.FILE_DELETE);
    }

    public async handle(section: Array<string>): Promise<{ comments: string[], actions: FileActionEntity[] }> {
        const filePath: string = String(section.shift()).slice(CommandWords.FILE_DELETE.length).trim();
        const fileAction: FileActionEntity = new FileActionEntity();
        fileAction.actionType = CommandWords.FILE_DELETE;
        fileAction.filePath = filePath;
        return {comments: [], actions: [fileAction]};
    }
}
