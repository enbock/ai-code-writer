import AudioUseCase from '../Core/Audio/AudioUseCase';
import AudioResponse from './AudioResponse';
import ConversationUseCase from '../Core/Conversation/UseCase/ConversationUseCase';
import ConversationRequest from './ConversationRequest';
import ConversationResponse from './ConversationResponse';
import FileActionUseCase from '../Core/FileActions/FileActionUseCase';
import FileActionRequest from './FileActionRequest';
import DirectoryWatcher from '../Core/FileActions/DirectoryWatcher';
import AddToConversationHistoryRequest from './AddToConversationHistoryRequest';

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
        await this.audioUseCase.measureNoiseLevel();
        const helloAudio: Buffer = await this.audioUseCase.transformTextToAudio('Der K.I. Code Writer ist bereit.');
        console.log('Der K.I. Code Writer ist bereit.');
        await this.audioUseCase.playAudio(helloAudio);

        // noinspection InfiniteLoopJS
        while (true) {
            const response: AudioResponse = new AudioResponse();

            await this.audioUseCase.recordAndProcess(response);
            console.log('Ihre Eingabe:', response.transcription);

            if (response.transcription != '') await this.runConversation(response);
        }
    }

    private async runConversation(response: AudioResponse): Promise<void> {
        const conversationRequest: ConversationRequest = new ConversationRequest();
        conversationRequest.transcription = response.transcription;


        console.log('Starte KI Anfrage');
        const conversationResponse = new ConversationResponse();
        await this.gptConversationUseCase.handleConversation(conversationRequest, conversationResponse);
        console.log('KI Antwort:', conversationResponse.comments);

        if (conversationResponse.actions.length > 0) {
            void this.executeFileActions(conversationResponse.actions);
        }

        if (conversationResponse.comments != '') {
            const answerAudio: Buffer = await this.audioUseCase.transformTextToAudio(conversationResponse.comments);
            await this.audioUseCase.playAudio(answerAudio);
        }
    }

    private async executeFileActions(actions: Array<string>): Promise<void> {
        this.directoryWatcher.pauseWatching();
        const fileActionRequest: FileActionRequest = new FileActionRequest();
        fileActionRequest.actions = actions;
        await this.fileActionUseCase.executeActions(fileActionRequest);
        this.directoryWatcher.resumeWatching();
    }

    private async handleDirectoryChange(action: string, fileName: string): Promise<void> {
        const addToConversationHistoryRequest: AddToConversationHistoryRequest = new AddToConversationHistoryRequest();
        addToConversationHistoryRequest.transcription = `${action} ${fileName}`;
        addToConversationHistoryRequest.fileName = fileName;

        await this.gptConversationUseCase.addToConversationHistory(addToConversationHistoryRequest);
        console.log('Directory Change Recorded:', fileName);
    }
}
