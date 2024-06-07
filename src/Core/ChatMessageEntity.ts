import ActionType from './ActionType';

export type MessageRoles = 'user' | 'assistant' | 'system';

export default class ChatMessageEntity {
    public role: MessageRoles = 'user';
    public action: ActionType = ActionType.COMMENT;
    public filePath: string = '';
    public content: string = '';
}
