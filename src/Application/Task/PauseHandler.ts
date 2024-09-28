import PauseResponse from '../Response/PauseResponse';
import AudioUseCase from '../../Core/Audio/AudioUseCase';
import ModeUseCase from '../../Core/Conversation/ModeUseCase/ModeUseCase';

export default class PauseHandler {

    constructor(
        private audioUseCase: AudioUseCase,
        private modeUseCase: ModeUseCase
    ) {
    }

    public async pause(): Promise<void> {
        this.modeUseCase.togglePause();
        const pauseState: PauseResponse = this.getPauseState();
        console.log(pauseState.isPaused ? 'Eingabe pausiert (p zum Fortsetzen)' : 'Eingabe fortgesetzt');
        if (pauseState.isPaused) await this.audioUseCase.stopRecording();
    }

    public getPauseState(): PauseResponse {
        const pauseState: PauseResponse = new PauseResponse();
        this.modeUseCase.getState(pauseState);
        return pauseState;
    }
}
