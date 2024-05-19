export default class GptResponseProcessor {
    public async processResponse(response: string): Promise<{ comments: string[], actions: string[] }> {
        const lines: Array<string> = response.split('\n');
        let currentSection: Array<string> = [];
        let comments: Array<string> = [];
        let actions: Array<string> = [];

        for (const line of lines) {
            if (line.startsWith('===') || line.startsWith('<<<') || line.startsWith('>>>') || line.startsWith('---')) {
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

    private async processSection(section: Array<string>): Promise<{ comments: string[], actions: string[] }> {
        const command: string = section.shift()!;

        if (command.startsWith('===')) {
            return {comments: [command.replace(/^=== /, '') + section.join('\n')], actions: []};
        } else if (command.startsWith('<<<')) {
            const filePath: string = command.slice(3).trim();
            const content: string = section.join('\n');
            return {comments: [], actions: [`<<< ${filePath}\n${content}`]};
        } else if (command.startsWith('>>>')) {
            const [source, destination]: Array<string> = command.slice(3).trim().split(/\s+/);
            return {comments: [], actions: [`>>> ${source} ${destination}`]};
        } else if (command.startsWith('---')) {
            const filePath: string = command.slice(3).trim();
            return {comments: [], actions: [`--- ${filePath}`]};
        }

        return {comments: [], actions: []};
    }
}
