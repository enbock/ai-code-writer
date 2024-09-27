import ChatMessageEntity from '../../../../Core/ChatMessageEntity';
import {ChatCompletionMessageParam} from 'openai/src/resources/chat/completions';
import {ChatCompletionToolMessageParam} from 'openai/src/resources/chat/completions';
import {ChatCompletionAssistantMessageParam} from 'openai/src/resources/chat/completions';
import FileActionEntity from '../../../../Core/FileActionEntity';
import OpenAI from 'openai';
import ChatCompletionMessageToolCall = OpenAI.ChatCompletionMessageToolCall;

export default class MessageEncoder {
    private argumentConverter: Record<string, (call: FileActionEntity) => any> = {
        readFile: this.convertFilePathArguments.bind(this),
        writeFile: this.convertPathAndContentArguments.bind(this),
        deleteFile: this.convertFilePathArguments.bind(this),
        moveFile: this.convertMoveArguments.bind(this)
    };

    public encode(messages: Array<ChatMessageEntity>): Array<ChatCompletionMessageParam> {
        return messages.map(m => this.encodeMessage(m));
    }

    private encodeMessage(message: ChatMessageEntity): ChatCompletionMessageParam {
        const result: ChatCompletionMessageParam = <ChatCompletionMessageParam>{
            role: message.role,
            content: message.content
        };
        if (message.callId) {
            (<ChatCompletionToolMessageParam>result).tool_call_id = message.callId;
        }
        if (message.toolCalls.length > 0) {
            (<ChatCompletionAssistantMessageParam>result).tool_calls = message.toolCalls.map(
                tc => this.convertToolCall(tc));
        }

        return result;
    }

    private convertToolCall(call: FileActionEntity): ChatCompletionMessageToolCall {
        return {
            type: 'function',
            id: call.id,
            function: {
                name: call.name,
                arguments: JSON.stringify(
                    (this.argumentConverter[call.name] || this.argumentConverter.readFile)(call)
                )
            }
        };
    }

    private convertPathAndContentArguments(call: FileActionEntity): any {
        return {
            filePath: call.filePath,
            content: call.content
        };
    }

    private convertFilePathArguments(call: FileActionEntity): any {
        return {
            filePath: call.filePath
        };
    }

    private convertMoveArguments(call: FileActionEntity): any {
        return {
            sourcePath: call.filePath,
            destinationPath: call.targetFilePath
        };
    }
}
