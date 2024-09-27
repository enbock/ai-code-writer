import {ChatCompletionChunk} from 'openai/src/resources/chat/completions';
import FileActionEntity from '../../../../Core/FileActionEntity';
import FileActionType from '../../../../Core/FileActionType';
import Logger from '../../../Logger/Logger';

export default class ToolCallConverter {
    private actionMap: Record<string, FileActionType> = {
        readFile: FileActionType.READ,
        writeFile: FileActionType.WRITE,
        deleteFile: FileActionType.DELETE,
        moveFile: FileActionType.MOVE
    };

    constructor(
        private logger: Logger
    ) {
    }

    public convert(toolCalls: Array<ChatCompletionChunk.Choice.Delta.ToolCall>): Array<FileActionEntity> {
        return toolCalls.map(call => this.convertToFile(call));
    }

    private convertToFile(call: ChatCompletionChunk.Choice.Delta.ToolCall): FileActionEntity {
        const file: FileActionEntity = new FileActionEntity();
        file.id = call.id || '';
        const functionName: string = call.function?.name || '';
        file.name = functionName;
        let callArguments: any = {};
        try {
            callArguments = JSON.parse(call.function?.arguments || '{}');
        } catch {
            this.logger.logError('Unable to parse argument :' + call.function?.arguments);
        }
        file.filePath =
            callArguments.filePath ||
            callArguments.sourcePath ||
            '';
        file.targetFilePath = callArguments.destinationPath || '';
        file.actionType = this.actionMap[functionName];
        file.content = callArguments.content || '';

        return file;
    }
}
