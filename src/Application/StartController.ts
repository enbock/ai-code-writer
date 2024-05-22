import AudioUseCase from '../Core/Audio/AudioUseCase';
import AudioResponse from './AudioResponse';
import ConversationUseCase from '../Core/Conversation/UseCase/ConversationUseCase';
import ConversationRequest from './ConversationRequest';
import ConversationResponse from './ConversationResponse';
import FileActionUseCase from '../Core/FileActions/FileActionUseCase';
import FileActionRequest from './FileActionRequest';
import DirectoryWatcher from '../Core/FileActions/DirectoryWatcher';
import AddToConversationHistoryRequest from './AddToConversationHistoryRequest';
import FileActionEntity from '../Core/Entities/FileActionEntity';

export default class StartController {
    private paused: boolean = false;

    constructor(
        private audioUseCase: AudioUseCase,
        private gptConversationUseCase: ConversationUseCase,
        private fileActionUseCase: FileActionUseCase,
        private directoryWatcher: DirectoryWatcher
    ) {
        this.directoryWatcher.onChange(this.handleDirectoryChange.bind(this));
        process.stdin.setRawMode(true);
        process.stdin.resume();
        process.stdin.on('data', this.handleKeyPress.bind(this));
        process.on('SIGINT', this.handleExit.bind(this));
    }

    public async start(): Promise<void> {
        await this.gptConversationUseCase.initialize();
        this.directoryWatcher.startWatching();
        await this.audioUseCase.measureNoiseLevel();
        await this.introduction();

        // noinspection InfiniteLoopJS
        while (true) {
            if (this.paused) {
                await new Promise<void>(resolve => setTimeout(resolve, 1000));
                continue;
            }

            const response: AudioResponse = new AudioResponse();
            console.log('Assistent hört...');
            await this.audioUseCase.recordAndProcess(response);

            if (response.transcription != '' && !this.paused) {
                console.log('Ihre Eingabe:', response.transcription);
                await this.runConversation(response);
                await this.pause();
            }
        }
    }

    private async introduction() {
        const helloAudio: Buffer = await this.audioUseCase.transformTextToAudio(
            'Der K.I. Code Writer ist bereit. ' +
            'Sie können das Programm mit Steuerung plus "C" oder der Taste "e" beenden und mit der Taste "p" pausieren'
        );
        console.log('Der KI Code Writer ist bereit.');
        const audioPromise: Promise<void> = this.audioUseCase.playAudio(helloAudio);
        console.log('Sie können das Programm mit Strg+C oder "e" beenden und mit "p" pausieren.');
        await audioPromise;
    }

    private async runConversation(response: AudioResponse): Promise<void> {
        const conversationRequest: ConversationRequest = new ConversationRequest();
        conversationRequest.transcription = response.transcription;

        console.log('Starte KI Anfrage');
        const conversationResponse: ConversationResponse = new ConversationResponse();
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

    private async executeFileActions(actions: Array<FileActionEntity>): Promise<void> {
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
        console.log('Datei geändert:', fileName);
    }

    private async handleKeyPress(key: Buffer): Promise<void> {
        const keyString: string = key.toString();
        let charCode: number = [...key.values()][0] || 0;
        if (keyString.toLowerCase() === 'p') {
            await this.pause();
        } else if (keyString.toLowerCase() === 'e' || charCode == 3) {
            this.handleExit();
        }
    }

    private async pause() {
        this.paused = !this.paused;
        console.log(this.paused ? 'Programm pausiert (p zum Fortsetzen)' : 'Programm fortgesetzt');
        await this.audioUseCase.stopRecording();
    }

    private handleExit(): void {
        console.log('Programm beendet');
        process.exit(0);
    }
}

