import CommandHandler from './CommandHandler';
import CommandWords from '../CommandWords';
import FileActionEntity from '../../Entities/FileActionEntity';

export default class FileMoveCommand implements CommandHandler {
    public canHandle(command: string): boolean {
        return command.startsWith(CommandWords.FILE_MOVE);
    }

    public async handle(section: Array<string>): Promise<{ comments: string[], actions: FileActionEntity[] }> {
        const commandLine: string = String(section.shift());
        const [source, destination]: Array<string> = commandLine.slice(CommandWords.FILE_MOVE.length).trim().split(/\s+/);
        const fileAction: FileActionEntity = new FileActionEntity();
        fileAction.actionType = CommandWords.FILE_MOVE;
        fileAction.filePath = source;
        fileAction.targetFilePath = destination;
        return {comments: [], actions: [fileAction]};
    }
}
