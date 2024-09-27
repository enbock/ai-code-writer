import StateStorage from '../../../Core/StateStorage';

export default class Memory implements StateStorage {
    private pauseFlag: boolean = false;

    public getPauseFlag(): boolean {
        return this.pauseFlag;
    }

    public setPauseFlag(isPaused: boolean): void {
        this.pauseFlag = isPaused;
    }
}
