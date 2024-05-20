import CommandHandler from './CommandHandler';
import CommandWords from '../CommandWords';
import FileActionEntity from '../../Entities/FileActionEntity';

export default class CommentCommand implements CommandHandler {
    public canHandle(command: string): boolean {
        return command.startsWith(CommandWords.COMMENT);
    }

    public async handle(section: Array<string>): Promise<{ comments: string[], actions: FileActionEntity[] }> {
        const comment: string = String(section.shift()).replace(new RegExp(`^${CommandWords.COMMENT}`), '') + section.join('\n');
        return {comments: [comment], actions: []};
    }
}
