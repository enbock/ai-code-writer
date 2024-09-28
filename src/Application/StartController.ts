import AudioUseCase from '../Core/Audio/AudioUseCase';
import AudioResponse from './Response/AudioResponse';
import ConversationUseCase from '../Core/Conversation/UseCase/ConversationUseCase';
import ConversationRequest from './ConversationRequest';
import ConversationResponse from './ConversationResponse';
import DirectoryWatcher from '../Core/FileActions/DirectoryWatcher';
import AddToConversationHistoryRequest from './AddToConversationHistoryRequest';
import PauseResponse from './Response/PauseResponse';
import PauseUseCase from '../Core/Conversation/PauseUseCase/PauseUseCase';
import ActionType from '../Core/ActionType';
import FileActionEntity from '../Core/FileActionEntity';
import FileActionExecutor from './Task/FileActionExecutor';

export default class StartController {

    constructor(
        private audioUseCase: AudioUseCase,
        private gptConversationUseCase: ConversationUseCase,
        private directoryWatcher: DirectoryWatcher,
        private pauseUseCase: PauseUseCase,
        private fileActionExecutor: FileActionExecutor
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
        await this.introduceWithAi();
        await this.listenToUserInput();
    }

    private async introduceWithAi(): Promise<void> {
        const introductionRequest: ConversationRequest = new ConversationRequest();
        introductionRequest.role = 'system';
        introductionRequest.transcription = 'Bitte begrüße den Benutzer.';

        await this.gptConversationUseCase.addUserMessageToConversation(introductionRequest);
        await this.completeConversation();
    }

    private async listenToUserInput(): Promise<void> {
        // noinspection InfiniteLoopJS
        while (true) {
            const pauseState: PauseResponse = this.getPauseState();

            if (pauseState.isPaused) {
                await new Promise<void>(resolve => setTimeout(resolve, 1000));
                continue;
            }

            const response: AudioResponse = new AudioResponse();
            console.log('Assistent hört...');
            await this.audioUseCase.recordAndProcess(response);

            if (response.transcription == '') continue;

            console.log('Ihre Eingabe:', response.transcription);
            await this.runConversation(response);
        }
    }

    private getPauseState(): PauseResponse {
        const pauseState: PauseResponse = new PauseResponse();
        this.pauseUseCase.getState(pauseState);
        return pauseState;
    }

    private async runConversation(response: AudioResponse): Promise<void> {
        const conversationRequest: ConversationRequest = new ConversationRequest();
        conversationRequest.transcription = response.transcription;
        console.log('Starte KI Anfrage...');
        await this.gptConversationUseCase.addUserMessageToConversation(conversationRequest);
        await this.completeConversation();
    }

    private async completeConversation(): Promise<void> {
        let conversationResponse: ConversationResponse;
        do {
            conversationResponse = new ConversationResponse();
            await this.gptConversationUseCase.continueConversation(conversationResponse);
            console.log('KI Antwort:', conversationResponse.result.content);

            await Promise.all([
                this.executeFileActions(conversationResponse.result.toolCalls),
                this.playAnswer(conversationResponse.result.content)
            ]);
        } while (conversationResponse.conversationComplete == false);
    }

    private async playAnswer(content: string): Promise<void> {
        if (content == '') return;
        const answerAudio: Buffer = await this.audioUseCase.transformTextToAudio(content);
        await this.audioUseCase.playAudio(answerAudio);
    }

    private async executeFileActions(toolCalls: Array<FileActionEntity>): Promise<void> {
        this.directoryWatcher.pauseWatching();
        for (const call of toolCalls) await this.fileActionExecutor.executeCall(call);
        this.directoryWatcher.resumeWatching();
    }

    private async handleDirectoryChange(action: ActionType, filePath: string, content: string): Promise<void> {
        const addToConversationHistoryRequest: AddToConversationHistoryRequest = new AddToConversationHistoryRequest();
        addToConversationHistoryRequest.fileName = filePath;
        addToConversationHistoryRequest.content = content
            ? 'Changed file ' + filePath + `:
\`\`\`
${content}
\`\`\`
`
            : 'File ' + filePath + ' was deleted by user.';
        addToConversationHistoryRequest.role = 'system';

        await this.gptConversationUseCase.addToConversationHistory(addToConversationHistoryRequest);
        console.log('Datei geändert:', '(' + action + ')' + filePath);
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
        this.pauseUseCase.togglePause();
        const pauseState: PauseResponse = this.getPauseState();
        console.log(pauseState.isPaused ? 'Programm pausiert (p zum Fortsetzen)' : 'Programm fortgesetzt');
        if (pauseState.isPaused) await this.audioUseCase.stopRecording();
    }

    private handleExit(): void {
        console.log('Programm beendet');
        process.exit(0);
    }
}
