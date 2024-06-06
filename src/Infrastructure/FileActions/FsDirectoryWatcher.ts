import DirectoryWatcher from '../../Core/FileActions/DirectoryWatcher';
import * as fs from 'fs';
import * as path from 'path';

export default class FsDirectoryWatcher implements DirectoryWatcher {
    private watchers: Array<fs.FSWatcher> = [];
    private watching: boolean = true;

    constructor(
        private directory: string,
        private includePatterns: Array<string>,
        private excludeDirs: Array<string>,
        private excludeFiles: Array<string>
    ) {
    }

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

    public onChange(callback: (action: string, fileName: string) => void): void {
        this.callback = callback;
    }

    private callback: (action: string, fileName: string) => void = () => {
    };

    private async isExcluded(filePath: string): Promise<boolean> {
        for (const excludeDir of this.excludeDirs) {
            if (filePath.includes(path.normalize(excludeDir) + path.sep)) return true;
        }

        for (const excludeFile of this.excludeFiles) {
            if (this.matchPattern(filePath, excludeFile)) return true;
        }

        return false;
    }

    private matchPattern(filePath: string, pattern: string): boolean {
        const regexPattern = pattern
            .replace(/\./g, '\\.')
            .replace(/\*/g, '.*')
            .replace(/\?/g, '.');
        const regex = new RegExp(`^${regexPattern}$`);
        return regex.test(filePath);
    }

    private async isIncluded(filePath: string): Promise<boolean> {
        if (await this.isExcluded(filePath)) return false;

        for (const pattern of this.includePatterns) {
            if (this.matchPattern(path.basename(filePath), pattern)) return true;
        }
        return false;
    }

    private watchDirectory(directory: string): void {
        const watcher = fs.watch(directory, {recursive: true}, async (eventType, filename) => {
            if (!this.watching || !filename) return;
            const filePath = path.resolve(directory, filename);
            const relativeFilePath = path.relative(process.cwd(), filePath);

            if (!(await this.isIncluded(filePath))) return;

            if (eventType === 'rename') {
                fs.stat(filePath, (err, stats) => {
                    if (err) {
                        this.callback(`--- ${relativeFilePath}`, relativeFilePath);
                    } else if (stats.isFile()) {
                        this.callback(`<<< ${relativeFilePath}\n${fs.readFileSync(filePath, 'utf8')}`, relativeFilePath);
                    }
                });
            } else if (eventType === 'change') {
                this.callback(`<<< ${relativeFilePath}\n${fs.readFileSync(filePath, 'utf8')}`, relativeFilePath);
            }
        });

        this.watchers.push(watcher);
    }
}
