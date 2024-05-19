import DirectoryWatcher from '../../Core/FileActions/DirectoryWatcher';
import * as fs from 'fs';
import * as path from 'path';

export default class FsDirectoryWatcher implements DirectoryWatcher {
    private watchers: Array<fs.FSWatcher> = [];
    private callback: (action: string) => void = () => {};
    private watching: boolean = true;

    constructor(
        private directory: string,
        private includePatterns: Array<string>,
        private excludeDirs: Array<string>,
        private excludeFiles: Array<string>
    ) {}

    public startWatching(): void {
        this.watchDirectory(this.directory);
    }

    public stopWatching(): void {
        this.watchers.forEach(watcher => watcher.close());
        this.watchers = [];
    }

    public pauseWatching(): void {
        this.watching = false;
    }

    public resumeWatching(): void {
        this.watching = true;
    }

    public onChange(callback: (action: string) => void): void {
        this.callback = callback;
    }

    private async isExcluded(filePath: string): Promise<boolean> {
        for (const excludeDir of this.excludeDirs) {
            if (filePath.includes(path.sep + excludeDir + path.sep)) return true;
        }

        for (const excludeFile of this.excludeFiles) {
            if (filePath.endsWith(excludeFile)) return true;
        }

        return false;
    }

    private matchPattern(fileName: string, pattern: string): boolean {
        const regexPattern = pattern
            .replace(/\./g, '\\.')
            .replace(/\*/g, '.*');
        const regex = new RegExp(`^${regexPattern}$`);
        return regex.test(fileName);
    }

    private async isIncluded(filePath: string): Promise<boolean> {
        for (const pattern of this.includePatterns) {
            if (this.matchPattern(path.basename(filePath), pattern)) return true;
        }
        return false;
    }

    private watchDirectory(directory: string): void {
        const watcher = fs.watch(directory, {recursive: true}, async (eventType, filename) => {
            if (!this.watching || !filename) return;
            const filePath = path.resolve(directory, filename);

            if (await this.isExcluded(filePath) || !(await this.isIncluded(filePath))) return;

            if (eventType === 'rename') {
                fs.stat(filePath, (err, stats) => {
                    if (err) {
                        this.callback(`--- ${filePath}`);
                    } else if (stats.isFile()) {
                        this.callback(`<<< ${filePath}\n${fs.readFileSync(filePath, 'utf8')}`);
                    }
                });
            } else if (eventType === 'change') {
                this.callback(`<<< ${filePath}\n${fs.readFileSync(filePath, 'utf8')}`);
            }
        });

        this.watchers.push(watcher);
    }
}