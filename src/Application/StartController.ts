import AudioUseCase from '../Core/Audio/AudioUseCase';
import AudioResponse from './Response/AudioResponse';
import ConversationUseCase from '../Core/Conversation/UseCase/ConversationUseCase';
import ConversationRequest from './ConversationRequest';
import DirectoryWatcher from '../Core/FileActions/DirectoryWatcher';
import AddToConversationHistoryRequest from './AddToConversationHistoryRequest';
import StateResponse from './Response/StateResponse';
import ActionType from '../Core/FileActions/ActionType';
import ConversationHandler from './Task/ConversationHandler';
import ExitHandler from './Task/ExitHandler';
import PauseHandler from './Task/PauseHandler';

export default class StartController {

    constructor(
        private audioUseCase: AudioUseCase,
        private gptConversationUseCase: ConversationUseCase,
        private directoryWatcher: DirectoryWatcher,
        private conversationHandler: ConversationHandler,
        private exitHandler: ExitHandler,
        private pauseHandler: PauseHandler
    ) {
        this.directoryWatcher.onChange(this.handleDirectoryChange.bind(this));
        process.stdin.setRawMode(true);
        process.stdin.resume();
        process.stdin.on('data', this.handleKeyPress.bind(this));
        process.on('SIGINT', this.exitHandler.exitProgramm.bind(this.exitHandler));
    }

    public async start(): Promise<void> {
        await this.audioUseCase.measureNoiseLevel();
        await this.gptConversationUseCase.initialize();
        await this.introduceWithAi();
        await this.gptConversationUseCase.addProjectFiles();
        this.directoryWatcher.startWatching();
        await this.main();
    }

    private async introduceWithAi(): Promise<void> {
        const introductionRequest: ConversationRequest = new ConversationRequest();
        introductionRequest.role = 'system';
        introductionRequest.transcription = 'Bitte begrüße den Benutzer.';

        await this.gptConversationUseCase.addUserMessageToConversation(introductionRequest);
        await this.conversationHandler.completeConversation();
    }

    private async main(): Promise<void> {
        // noinspection InfiniteLoopJS
        while (true) {
            const pauseState: StateResponse = this.pauseHandler.getPauseState();

            if (pauseState.isPaused) {
                await new Promise<void>(resolve => setTimeout(resolve, 1000));
                continue;
            }

            const response: AudioResponse = new AudioResponse();
            console.log('Assistent hört...');
            await this.audioUseCase.recordAndProcess(response);

            if (response.transcription == '') continue;

            console.log('Ihre Eingabe:', response.transcription);
            await this.conversationHandler.runConversation(response);
        }
    }

    private async handleDirectoryChange(_: ActionType, filePath: string, content: string): Promise<void> {
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
        // console.log('Datei geändert:', '(' + action + ')' + filePath);
    }

    private async handleKeyPress(key: Buffer): Promise<void> {
        const keyString: string = key.toString();
        let charCode: number = [...key.values()][0] || 0;
        if (keyString.toLowerCase() === 'p') {
            await this.pauseHandler.pause();
        } else if (keyString.toLowerCase() === 'e' || charCode == 3) {
            this.exitHandler.exitProgramm();
        }
    }

}
