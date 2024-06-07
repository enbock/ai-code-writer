import ActionType from '../ActionType';

export default interface DirectoryWatcher {
    startWatching(): void;

    stopWatching(): void;

    pauseWatching(): void;

    resumeWatching(): void;

    onChange(callback: (action: ActionType, filePath: string, content: string) => void): void;
}

