import CommandHandler from './CommandHandler';
import CommandWords from '../CommandWords';
import FileActionEntity from '../../FileActionEntity';
import FileActionType from '../../FileActionType';

export default class FileDeleteCommand implements CommandHandler {
    public canHandle(command: string): boolean {
        return command.startsWith(CommandWords.FILE_DELETE);
    }

    public async handle(section: Array<string>): Promise<{ comments: string[], actions: FileActionEntity[] }> {
        const filePath: string = String(section.shift()).slice(CommandWords.FILE_DELETE.length).trim();
        const fileAction: FileActionEntity = new FileActionEntity();
        fileAction.actionType = FileActionType.DELETE;
        fileAction.filePath = filePath;
        return {comments: [], actions: [fileAction]};
    }
}
