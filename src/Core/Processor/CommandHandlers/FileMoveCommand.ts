import CommandHandler from './CommandHandler';
import CommandWords from '../CommandWords';

export default class FileMoveCommand implements CommandHandler {
    public canHandle(command: string): boolean {
        return command.startsWith(CommandWords.FILE_MOVE);
    }

    public async handle(section: Array<string>): Promise<{ comments: string[], actions: string[] }> {
        const [source, destination]: Array<string> = section.shift()!.slice(CommandWords.FILE_MOVE.length).trim().split(/\s+/);
        return {comments: [], actions: [`${CommandWords.FILE_MOVE} ${source} ${destination}`]};
    }
}
