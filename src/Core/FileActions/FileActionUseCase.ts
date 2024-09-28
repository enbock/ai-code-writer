import FileSystemHandler from './FileSystemHandler';
import FileActionRequest from './FileActionRequest';
import ActionEntity from '../ActionEntity';
import FileActionType from '../FileActionType';
import FileActionResponse from './FileActionResponse';

export default class FileActionUseCase {
    constructor(
        private fileSystemHandler: FileSystemHandler
    ) {
    }

    public async executeAction(request: FileActionRequest, response: FileActionResponse): Promise<void> {
        const action: ActionEntity = request.action;

        if (action.type === FileActionType.READ) {
            response.content = await this.fileSystemHandler.handleReadFile(action.filePath);
        } else if (action.type === FileActionType.WRITE) {
            await this.fileSystemHandler.handleWriteFile(action.filePath, action.content);
            response.content = JSON.stringify({result: 'File ' + action.filePath + ' written.'});
        } else if (action.type === FileActionType.MOVE) {
            await this.fileSystemHandler.handleMoveFile(action.filePath, action.targetFilePath);
            response.content = JSON.stringify(
                {result: 'File move from ' + action.filePath + ' to ' + action.targetFilePath + '.'}
            );
        } else if (action.type === FileActionType.DELETE) {
            await this.fileSystemHandler.handleDeleteFile(action.filePath);
            response.content = JSON.stringify({result: 'File ' + action.filePath + ' deleted.'});
        }
    }
}
