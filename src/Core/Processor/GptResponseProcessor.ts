import CommandWords from './CommandWords';
import CommandHandler from './CommandHandlers/CommandHandler';
import FileActionEntity from '../FileActionEntity';

export default class GptResponseProcessor {
    constructor(
        private commandHandlers: Array<CommandHandler>
    ) {
    }

    public async processResponse(response: string): Promise<{ comments: string[], actions: FileActionEntity[] }> {
        const correctedResponse: string = this.ensureInitialCommandWord(response);
        const lines: Array<string> = correctedResponse.split('\n');
        let currentSection: Array<string> = [];
        let comments: Array<string> = [];
        let actions: Array<FileActionEntity> = [];

        for (const line of lines) {
            if (this.isCommand(line)) {
                if (currentSection.length > 0) {
                    const {
                        comments: sectionComments,
                        actions: sectionActions
                    } = await this.processSection(currentSection);
                    comments.push(...sectionComments);
                    actions.push(...sectionActions);
                    currentSection = [];
                }
            }
            currentSection.push(line);
        }

        if (currentSection.length > 0) {
            const {comments: sectionComments, actions: sectionActions} = await this.processSection(currentSection);
            comments.push(...sectionComments);
            actions.push(...sectionActions);
        }

        return {comments: comments, actions: actions};
    }

    private async processSection(section: Array<string>): Promise<{ comments: string[], actions: FileActionEntity[] }> {
        const command: string = this.removePrefix(section[0]);

        for (const handler of this.commandHandlers) {
            if (handler.canHandle(command)) {
                const processedSection: Array<string> = section.map(line => this.removePrefix(line));
                return handler.handle(processedSection);
            }
        }

        return {comments: [], actions: []};
    }

    private isCommand(line: string): boolean {
        return (
            line.startsWith(CommandWords.COMMENT) ||
            line.startsWith(CommandWords.FILE_WRITE) ||
            line.startsWith(CommandWords.FILE_DELETE)
        );
    }

    private removePrefix(line: string): string {
        const prefix: string = '^°µ|';
        return line.startsWith(prefix) ? line.slice(prefix.length) : line;
    }

    private ensureInitialCommandWord(response: string): string {
        const lines: Array<string> = response.split('\n');
        if (lines.length > 0 && !this.isCommand(lines[0])) {
            lines[0] = `${CommandWords.COMMENT}${lines[0]}`;
        }
        return lines.join('\n');
    }
}
