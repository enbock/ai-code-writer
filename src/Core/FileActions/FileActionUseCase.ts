import FileSystemHandler from './FileSystemHandler';
import FileActionRequest from './FileActionRequest';
import FileActionEntity from '../FileActionEntity';
import FileActionType from '../FileActionType';

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
        if (action.actionType === FileActionType.WRITE) {
            await this.fileSystemHandler.handleWriteFile(action.filePath, action.content);
        } else if (action.actionType === FileActionType.MOVE) {
            await this.fileSystemHandler.handleMoveFile(action.filePath, action.targetFilePath);
        } else if (action.actionType === FileActionType.DELETE) {
            await this.fileSystemHandler.handleDeleteFile(action.filePath);
        }
    }
}
