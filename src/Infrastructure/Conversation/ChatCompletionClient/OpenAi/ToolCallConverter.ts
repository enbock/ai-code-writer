import {ChatCompletionChunk} from 'openai/src/resources/chat/completions';
import ActionEntity from '../../../../Core/ActionEntity';
import FileActionType from '../../../../Core/FileActionType';
import CommandActionType from '../../../../Core/CommandActionType';
import Logger from '../../../Logger/Logger';

export default class ToolCallConverter {
    private fileActionMap: Record<string, FileActionType> = {
        readFile: FileActionType.READ,
        writeFile: FileActionType.WRITE,
        deleteFile: FileActionType.DELETE,
        moveFile: FileActionType.MOVE,
        readAllFiles: FileActionType.READ_ALL_FILES
    };
    private commandActionMap: Record<string, CommandActionType> = {
        pauseCommand: CommandActionType.PAUSE,
        suspendCommand: CommandActionType.SUSPEND,
        resumeCommand: CommandActionType.RESUME,
        exitCommand: CommandActionType.EXIT_PROGRAMM
    };

    constructor(
        private logger: Logger
    ) {
    }

    public convert(toolCalls: Array<ChatCompletionChunk.Choice.Delta.ToolCall>): Array<ActionEntity> {
        return toolCalls.map(call => this.convertToFile(call));
    }

    private convertToFile(call: ChatCompletionChunk.Choice.Delta.ToolCall): ActionEntity {
        const action: ActionEntity = new ActionEntity();
        action.id = call.id || '';
        const functionName: string = call.function?.name || '';
        action.name = functionName;
        let callArguments: any = {};
        try {
            callArguments = JSON.parse(call.function?.arguments || '{}');
        } catch {
            this.logger.logError('Unable to parse argument :' + call.function?.arguments);
        }
        action.filePath =
            callArguments.filePath ||
            callArguments.sourcePath ||
            '';
        action.targetFilePath = callArguments.destinationPath || '';
        action.actionType = this.fileActionMap[functionName] !== undefined ? 'file' : 'command';
        action.type = action.actionType == 'file' ? this.fileActionMap[functionName] : this.commandActionMap[functionName];
        action.content = callArguments.content || callArguments.command || '';

        return action;
    }
}
