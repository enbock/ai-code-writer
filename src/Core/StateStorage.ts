export default interface StateStorage {
    getPauseFlag(): boolean;

    setPauseFlag(isPaused: boolean): void;
}
