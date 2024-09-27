import FileActionEntity from './FileActionEntity';

export type MessageRoles = 'user' | 'assistant' | 'system' | 'tool';

export default class ChatMessageEntity {
    public role: MessageRoles = 'user';
    public filePath: string = '';
    public content: string = '';
    public toolCalls: Array<FileActionEntity> = [];
    public callId: string = '';
}
