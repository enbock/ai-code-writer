import CommandHandler from './CommandHandler';
import CommandWords from '../CommandWords';

export default class CommentCommand implements CommandHandler {
    public canHandle(command: string): boolean {
        return command.startsWith(CommandWords.COMMENT);
    }

    public async handle(section: Array<string>): Promise<{ comments: string[], actions: string[] }> {
        const comment: string = section.shift()!.replace(new RegExp(`^${CommandWords.COMMENT}`), '') + section.join('\n');
        return {comments: [comment], actions: []};
    }
}
