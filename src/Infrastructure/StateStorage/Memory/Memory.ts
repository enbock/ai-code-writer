import StateStorage from '../../../Core/StateStorage';

export default class Memory implements StateStorage {
    private pauseFlag: boolean = false;
    private suspendMode: boolean = false;

    public getPauseFlag(): boolean {
        return this.pauseFlag;
    }

    public setPauseFlag(isPaused: boolean): void {
        this.pauseFlag = isPaused;
    }

    public getSuspendMode(): boolean {
        return this.suspendMode;
    }

    public setSuspendMode(isSuspend: boolean): void {
        this.suspendMode = isSuspend;
    }
}
