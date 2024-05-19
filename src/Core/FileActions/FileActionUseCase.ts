import FileSystemHandler from './FileSystemHandler';

export default class FileActionUseCase {
    constructor(
        private fileSystemHandler: FileSystemHandler
    ) {
    }

    public async executeActions(actions: Array<string>): Promise<void> {
        for (const action of actions) {
            await this.processAction(action);
        }
    }

    private async processAction(action: string): Promise<void> {
        const lines: Array<string> = action.split('\n');
        const command: string | undefined = lines.shift();

        if (!command) return;

        if (command.startsWith('<<<')) {
            const filePath: string = command.slice(3).trim();
            const content: string = lines.join('\n');
            await this.fileSystemHandler.handleWriteFile(filePath, content);
        } else if (command.startsWith('>>>')) {
            const [source, destination]: Array<string> = command.slice(3).trim().split(/\s+/);
            await this.fileSystemHandler.handleMoveFile(source, destination);
        } else if (command.startsWith('---')) {
            const filePath: string = command.slice(3).trim();
            await this.fileSystemHandler.handleDeleteFile(filePath);
        }
    }
}

