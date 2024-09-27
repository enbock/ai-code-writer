import StateStorage from '../../StateStorage';
import GetStateResponse from './GetStateResponse';

export default class PauseUseCase {
    constructor(
        private stateStorage: StateStorage
    ) {
    }

    public getState(response: GetStateResponse): void {
        response.isPaused = this.stateStorage.getPauseFlag();
    }

    public togglePause(): void {
        const currentPauseState = this.stateStorage.getPauseFlag();
        this.stateStorage.setPauseFlag(!currentPauseState);
    }
}
