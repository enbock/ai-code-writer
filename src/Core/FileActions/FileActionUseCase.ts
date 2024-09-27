import FileSystemHandler from './FileSystemHandler';
import FileActionRequest from './FileActionRequest';
import FileActionEntity from '../FileActionEntity';
import FileActionType from '../FileActionType';
import FileActionResponse from './FileActionResponse';

export default class FileActionUseCase {
    constructor(
        private fileSystemHandler: FileSystemHandler
    ) {
    }

    public async executeAction(request: FileActionRequest, response: FileActionResponse): Promise<void> {
        const action: FileActionEntity = request.action;

        if (action.actionType === FileActionType.READ) {
            response.content = await this.fileSystemHandler.handleReadFile(action.filePath);
        } else if (action.actionType === FileActionType.WRITE) {
            await this.fileSystemHandler.handleWriteFile(action.filePath, action.content);
            response.content = JSON.stringify({result: 'File ' + action.filePath + ' written.'});
        } else if (action.actionType === FileActionType.MOVE) {
            await this.fileSystemHandler.handleMoveFile(action.filePath, action.targetFilePath);
            response.content = JSON.stringify(
                {result: 'File move from ' + action.filePath + ' to ' + action.targetFilePath + '.'}
            );
        } else if (action.actionType === FileActionType.DELETE) {
            await this.fileSystemHandler.handleDeleteFile(action.filePath);
            response.content = JSON.stringify({result: 'File ' + action.filePath + ' deleted.'});
        }
    }
}
