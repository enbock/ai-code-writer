import CommandHandler from './CommandHandler';
import ActionType from '../../ActionType';
import FileActionEntity from '../../FileActionEntity';

export default class CommentCommand implements CommandHandler {
    public canHandle(command: string): boolean {
        return command.startsWith(ActionType.COMMENT);
    }

    public async handle(section: Array<string>): Promise<{ comments: string[], actions: FileActionEntity[] }> {
        const comment: string = String(section.shift())
            .replace(new RegExp(`^${ActionType.COMMENT}`), '') + section.join('\n');
        return {comments: [comment], actions: []};
    }
}
