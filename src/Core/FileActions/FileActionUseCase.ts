import FileSystemHandler from './FileSystemHandler';
import FileActionRequest from './FileActionRequest';
import ActionEntity from '../ActionEntity';
import FileActionType from '../FileActionType';
import FileActionResponse from './FileActionResponse';
import ConversationService from '../Conversation/UseCase/ConversationService';

export default class FileActionUseCase {
    constructor(
        private fileSystemHandler: FileSystemHandler,
        private conversationService: ConversationService
    ) {
    }

    public async executeAction(request: FileActionRequest, response: FileActionResponse): Promise<void> {
        const action: ActionEntity = request.action;

        switch (action.type) {
            case FileActionType.READ:
                response.content = await this.fileSystemHandler.handleReadFile(action.filePath);
                break;
            case FileActionType.WRITE:
                await this.fileSystemHandler.handleWriteFile(action.filePath, action.content);
                response.content = JSON.stringify({result: 'File ' + action.filePath + ' written.'});
                break;
            case FileActionType.MOVE:
                await this.fileSystemHandler.handleMoveFile(action.filePath, action.targetFilePath);
                response.content = JSON.stringify(
                    {result: 'File move from ' + action.filePath + ' to ' + action.targetFilePath + '.'}
                );
                break;
            case FileActionType.DELETE:
                await this.fileSystemHandler.handleDeleteFile(action.filePath);
                response.content = JSON.stringify({result: 'File ' + action.filePath + ' deleted.'});
                break;
            case FileActionType.READ_ALL_FILES:
                await this.conversationService.addProjectFiles();
                response.content = 'Files added to conversation.';
                break;
        }
    }
}
