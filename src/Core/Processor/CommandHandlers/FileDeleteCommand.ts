import CommandHandler from './CommandHandler';
import FileActionEntity from '../../FileActionEntity';
import FileActionType from '../../FileActionType';
import ActionType from '../../ActionType';

export default class FileDeleteCommand implements CommandHandler {
    public canHandle(command: string): boolean {
        return command.startsWith(ActionType.FILE_DELETE);
    }

    public async handle(section: Array<string>): Promise<{ comments: string[], actions: FileActionEntity[] }> {
        const filePath: string = String(section.shift()).slice(ActionType.FILE_DELETE.length).trim();
        const fileAction: FileActionEntity = new FileActionEntity();
        fileAction.actionType = FileActionType.DELETE;
        fileAction.filePath = filePath;
        return {comments: [], actions: [fileAction]};
    }
}
