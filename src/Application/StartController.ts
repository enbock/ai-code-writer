import AudioUseCase from '../Core/Audio/AudioUseCase';
import AudioResponse from './AudioResponse';
import ConversationUseCase from '../Core/Conversation/ConversationUseCase';
import ConversationRequest from './ConversationRequest';
import ConversationResponse from './ConversationResponse';
import FileActionUseCase from '../Core/FileActions/FileActionUseCase';
import DirectoryWatcher from '../Core/FileActions/DirectoryWatcher';

export default class StartController {
    constructor(
        private audioUseCase: AudioUseCase,
        private gptConversationUseCase: ConversationUseCase,
        private fileActionUseCase: FileActionUseCase,
        private directoryWatcher: DirectoryWatcher
    ) {
        this.directoryWatcher.onChange(this.handleDirectoryChange.bind(this));
    }

    public async start(): Promise<void> {
        await this.gptConversationUseCase.initialize();
        this.directoryWatcher.startWatching();
        const helloAudio: Buffer = await this.audioUseCase.transformTextToAudio('AI Code Writer ist bereit und hört nun zu.');
        await this.audioUseCase.playAudio(helloAudio);

        // noinspection InfiniteLoopJS
        while (true) {
            const response: AudioResponse = new AudioResponse();

            await this.audioUseCase.recordAndProcess(response);
            console.log('Transcription:', response.transcription);

            if (response.transcription != '') await this.runConversation(response);
        }
    }

    private async runConversation(response: AudioResponse): Promise<void> {
        const conversationRequest: ConversationRequest = new ConversationRequest();
        conversationRequest.transcription = response.transcription;

        const conversationResponse = new ConversationResponse();
        await this.gptConversationUseCase.handleConversation(conversationRequest, conversationResponse);
        console.log('Conversation Response:', conversationResponse.comments);

        if (conversationResponse.comments != '') {
            const answerAudio: Buffer = await this.audioUseCase.transformTextToAudio(conversationResponse.comments);
            await this.audioUseCase.playAudio(answerAudio);
        }

        if (conversationResponse.actions.length > 0) {
            this.directoryWatcher.pauseWatching();
            await this.fileActionUseCase.executeActions(conversationResponse.actions);
            this.directoryWatcher.resumeWatching();
        }
    }

    private async handleDirectoryChange(action: string): Promise<void> {
        const conversationRequest: ConversationRequest = new ConversationRequest();
        conversationRequest.transcription = action;

        await this.gptConversationUseCase.addToConversationHistory(conversationRequest);
        console.log('Directory Change Recorded:', action);
    }
}
