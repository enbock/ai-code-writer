import ChatMessageEntity from '../../ChatMessageEntity';
import {FileData} from '../FileCollectorService';
import FileCollectorService from '../FileCollectorService';
import ConversationStorage from '../ConversationStorage';
import FileTask from './Task/FileTask';

export default class ConversationService {
    constructor(
        private conversationStorage: ConversationStorage,
        private fileCollectorService: FileCollectorService,
        private fileTask: FileTask
    ) {
    }

    public async addProjectFiles(): Promise<void> {
        const conversationHistory: Array<ChatMessageEntity> = await this.conversationStorage.loadConversation();
        const filesContents: Array<FileData> = await this.fileCollectorService.collectFiles();

        await this.fileTask.addFileContentsToInitialConversation(filesContents, conversationHistory);

        await this.conversationStorage.saveConversation(conversationHistory);
    }
}
