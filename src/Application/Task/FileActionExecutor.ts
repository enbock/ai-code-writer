import FileActionRequest from '../FileActionRequest';
import FileActionUseCase from '../../Core/FileActions/FileActionUseCase';
import ConversationUseCase from '../../Core/Conversation/UseCase/ConversationUseCase';
import FileActionResponse from '../FileActionResponse';
import AddToConversationHistoryRequest from '../AddToConversationHistoryRequest';
import ActionEntity from '../../Core/ActionEntity';
import FileActionType from '../../Core/FileActionType';

export default class FileActionExecutor {
    constructor(
        private fileActionUseCase: FileActionUseCase,
        private conversationUseCase: ConversationUseCase
    ) {
    }

    public async executeCall(fileAction: ActionEntity): Promise<void> {
        const request: FileActionRequest = new FileActionRequest();
        const response: FileActionResponse = new FileActionResponse();
        request.action = fileAction;
        await this.fileActionUseCase.executeAction(request, response);
        await this.addToHistory(fileAction, response.content);

        console.log('(' + FileActionType[fileAction.type] + ')', fileAction.filePath);
    }

    private async addToHistory(fileAction: ActionEntity, resultContent: string): Promise<void> {
        const request: AddToConversationHistoryRequest = new AddToConversationHistoryRequest();
        request.callId = fileAction.id;
        request.fileName = fileAction.filePath;
        request.content = resultContent;
        request.role = 'tool';
        await this.conversationUseCase.addToConversationHistory(request);
    }
}
