import {FileData} from '../../FileCollectorService';
import ChatMessageEntity from '../../../ChatMessageEntity';
import ConversationLogger from '../../ConversationLogger';

export default class FileTask {
    constructor(
        private conversationLogger: ConversationLogger
    ) {
    }

    public addFileListToInitialConversation(
        filesContents: Array<FileData>,
        conversationHistory: Array<ChatMessageEntity>
    ): void {
        const messageItem = new ChatMessageEntity();
        messageItem.role = 'system';
        messageItem.content = 'Existing files in den Project:\n* ' +
            filesContents.map(f => f.filePath).join('\n* ');
        conversationHistory.push(messageItem);
    }

    public async addFileContentsToInitialConversation(
        filesContent: Array<FileData>,
        conversationHistory: Array<ChatMessageEntity>
    ): Promise<void> {
        for (const {filePath, content} of filesContent) {
            const messageItem = new ChatMessageEntity();
            messageItem.role = 'system';
            messageItem.content = `Changed file ${filePath}:
\`\`\`
${content}
\`\`\`
`;
            messageItem.filePath = filePath;
            conversationHistory.push(messageItem);
            await this.conversationLogger.logConversation(messageItem);
        }
    }

    public removeOldFileFromHistory(
        conversationHistory: Array<ChatMessageEntity>,
        filePath: string
    ): void {
        const existingMessageIndex: number = conversationHistory.findIndex(
            message => message.filePath === filePath
        );
        if (existingMessageIndex == -1) return;

        const deletedMessage: ChatMessageEntity = conversationHistory.splice(
                existingMessageIndex,
                1
            )[0]
        ;
        this.removeCallFromResultMessages(deletedMessage, conversationHistory);
        this.removeCallFromMessagesToolCalls(deletedMessage, conversationHistory);

    }

    private removeCallFromResultMessages(
        deletedMessage: ChatMessageEntity,
        conversationHistory: Array<ChatMessageEntity>
    ): void {
        for (const deletedCall of deletedMessage.toolCalls) {
            const callId: string = deletedCall.id;
            const index: number = conversationHistory.findIndex(c => c.callId == callId);

            if (index == -1) continue;

            conversationHistory.splice(index, 1);
        }
    }

    private removeCallFromMessagesToolCalls(
        deletedMessage: ChatMessageEntity,
        conversationHistory: Array<ChatMessageEntity>
    ): void {
        for (const message of conversationHistory) {
            const index: number = message.toolCalls.findIndex(c => c.id == deletedMessage.callId);

            if (index == -1) continue;

            message.toolCalls.splice(index, 1);
        }
    }
}
