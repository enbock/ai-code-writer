import StateStorage from '../../StateStorage';
import GetStateResponse from './GetStateResponse';

export default class ModeUseCase {
    constructor(
        private stateStorage: StateStorage
    ) {
    }

    public getState(response: GetStateResponse): void {
        response.isPaused = this.stateStorage.getPauseFlag();
        response.isSuspended = this.stateStorage.getSuspendMode();
    }

    public togglePause(): void {
        const currentPauseState: boolean = this.stateStorage.getPauseFlag();
        this.stateStorage.setPauseFlag(!currentPauseState);
    }

    public enableSuspendMode(): void {
        this.stateStorage.setSuspendMode(true);
    }

    public disableSuspendMode(): void {
        this.stateStorage.setSuspendMode(false);
    }
}
