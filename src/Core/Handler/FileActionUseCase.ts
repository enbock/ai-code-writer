import GptActionHandler from './GptActionHandler';

export default class FileActionUseCase {
    constructor(
        private actionHandler: GptActionHandler
    ) {
    }

    public async executeActions(actions: Array<string>): Promise<void> {
        for (const action of actions) {
            await this.processAction(action);
        }
    }

    private async processAction(action: string): Promise<void> {
        const lines = action.split('\n').filter(line => line);
        const command = lines.shift();

        if (!command) return;

        if (command.startsWith('<<<')) {
            const filePath = command.slice(3).trim();
            const content = lines.join('\n');
            await this.actionHandler.handleWriteFile(filePath, content);
        } else if (command.startsWith('>>>')) {
            const [source, destination] = command.slice(3).trim().split(/\s+/);
            await this.actionHandler.handleMoveFile(source, destination);
        } else if (command.startsWith('---')) {
            const filePath = command.slice(3).trim();
            await this.actionHandler.handleDeleteFile(filePath);
        }
    }
}
