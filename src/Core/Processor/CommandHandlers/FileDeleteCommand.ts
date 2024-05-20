import CommandHandler from './CommandHandler';
import CommandWords from '../CommandWords';

export default class FileDeleteCommand implements CommandHandler {
    public canHandle(command: string): boolean {
        return command.startsWith(CommandWords.FILE_DELETE);
    }

    public async handle(section: Array<string>): Promise<{ comments: string[], actions: string[] }> {
        const filePath: string = section.shift()!.slice(CommandWords.FILE_DELETE.length).trim();
        return {comments: [], actions: [`${CommandWords.FILE_DELETE} ${filePath}`]};
    }
}
