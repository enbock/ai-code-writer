import ActionEntity from '../../ActionEntity';

export default class ChatResultEntity {
    public toolCalls: Array<ActionEntity> = [];
    public content: string = '';
    public conversationComplete: boolean = false;
}
