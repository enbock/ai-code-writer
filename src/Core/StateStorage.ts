export default interface StateStorage {
    getPauseFlag(): boolean;

    setPauseFlag(isPaused: boolean): void;

    getSuspendMode(): boolean;

    setSuspendMode(isSuspend: boolean): void;
}
