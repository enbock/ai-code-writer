import FileSystemHandler from './FileSystemHandler';
import FileActionRequest from './FileActionRequest';
import FileActionEntity from '../Entities/FileActionEntity';
import CommandWords from '../Processor/CommandWords';

export default class FileActionUseCase {
    constructor(
        private fileSystemHandler: FileSystemHandler
    ) {
    }

    public async executeActions(request: FileActionRequest): Promise<void> {
        for (const action of request.actions) {
            await this.processAction(action);
        }
    }

    private async processAction(action: FileActionEntity): Promise<void> {
        if (action.actionType === CommandWords.FILE_WRITE) {
            await this.fileSystemHandler.handleWriteFile(action.filePath, action.content);
        } else if (action.actionType === CommandWords.FILE_MOVE) {
            await this.fileSystemHandler.handleMoveFile(action.filePath, action.targetFilePath);
        } else if (action.actionType === CommandWords.FILE_DELETE) {
            await this.fileSystemHandler.handleDeleteFile(action.filePath);
        }
    }
}
