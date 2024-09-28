import ActionEntity from '../../Core/ActionEntity';
import DirectoryWatcher from '../../Core/FileActions/DirectoryWatcher';
import FileActionExecutor from './FileActionExecutor';
import ModeUseCase from '../../Core/Conversation/ModeUseCase/ModeUseCase';
import CommandActionType from '../../Core/CommandActionType';
import AudioUseCase from '../../Core/Audio/AudioUseCase';
import AddToConversationHistoryRequest from '../AddToConversationHistoryRequest';
import ConversationUseCase from '../../Core/Conversation/UseCase/ConversationUseCase';
import ConversationResponse from '../ConversationResponse';
import PauseHandler from './PauseHandler';
import ExitHandler from './ExitHandler';

export default class ActionHandler {
    constructor(
        private directoryWatcher: DirectoryWatcher,
        private fileActionExecutor: FileActionExecutor,
        private modeUseCase: ModeUseCase,
        private audioUseCase: AudioUseCase,
        private conversationUseCase: ConversationUseCase,
        private pauseHandler: PauseHandler,
        private exitHandler: ExitHandler
    ) {
    }

    public async executeActions(conversationResponse: ConversationResponse): Promise<void> {
        const toolCalls: Array<ActionEntity> = conversationResponse.result.toolCalls;
        const fileActions: Array<ActionEntity> = toolCalls.filter(t => t.actionType == 'file');
        const commandActions: Array<ActionEntity> = toolCalls.filter(t => t.actionType == 'command');
        await Promise.all([
            this.executeFileActions(fileActions),
            this.executeCommandActions(commandActions, conversationResponse)
        ]);
    }

    private async executeFileActions(toolCalls: Array<ActionEntity>): Promise<void> {
        this.directoryWatcher.pauseWatching();
        for (const call of toolCalls) await this.fileActionExecutor.executeCall(call);
        this.directoryWatcher.resumeWatching();
    }

    private async executeCommandActions(
        toolCalls: Array<ActionEntity>,
        conversationResponse: ConversationResponse
    ): Promise<void> {
        for (const action of toolCalls) {
            await this.addToHistory(action, 'Command executed.');
            switch (action.type) {
                case CommandActionType.PAUSE:
                    await this.pauseHandler.pause();
                    break;
                case CommandActionType.SUSPEND:
                    console.log('Gehe in den Schlummer-Modus.');
                    this.modeUseCase.enableSuspendMode();
                    conversationResponse.conversationComplete = true;
                    break;
                case CommandActionType.RESUME:
                    console.log('Gehen zurück in den Normal-Modus.');
                    this.modeUseCase.disableSuspendMode();
                    await this.conversationUseCase.wakeUpConversation();
                    conversationResponse.conversationComplete = false;
                    break;
                case CommandActionType.EXIT_PROGRAMM:
                    this.exitHandler.exitProgramm();
                    break;
            }
        }
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
