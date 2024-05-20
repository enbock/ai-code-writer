export default interface DirectoryWatcher {
    startWatching(): void;
    stopWatching(): void;
    pauseWatching(): void;
    resumeWatching(): void;
    onChange(callback: (action: string, fileName: string) => void): void;
}
