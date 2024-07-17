import CommandHandler from './CommandHandler';
import FileActionEntity from '../../FileActionEntity';
import FileActionType from '../../FileActionType';
import ActionType from '../../ActionType';

export default class FileWriteCommand implements CommandHandler {
    public canHandle(command: string): boolean {
        return command.startsWith(ActionType.FILE_WRITE);
    }

    public async handle(section: Array<string>): Promise<{ comments: string[], actions: FileActionEntity[] }> {
        const filePath: string = String(section.shift()).slice(ActionType.FILE_WRITE.length).trim();
        const content: string = section.join('\n');
        const fileAction: FileActionEntity = new FileActionEntity();
        fileAction.actionType = FileActionType.WRITE;
        fileAction.filePath = filePath;
        fileAction.content = content;
        return {comments: [], actions: [fileAction]};
    }
}
