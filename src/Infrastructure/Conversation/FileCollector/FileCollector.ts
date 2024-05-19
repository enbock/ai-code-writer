import FileCollectorService from '../../../Core/Conversation/FileCollectorService';
import * as fs from 'fs';
import * as path from 'path';

export default class FileCollector implements FileCollectorService {
    constructor(
        private sourceDir: string,
        private patterns: Array<string>,
        private excludeDirs: Array<string>,
        private excludeFiles: Array<string>
    ) {
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

    public async collectFiles(): Promise<string> {
        let collectedContent: string = '';

        const files: Array<string> = await this.findFiles(this.sourceDir);
        for (const filePath of files) {
            if (await this.isExcluded(filePath)) continue;
            console.log('<<<', filePath);
            const fileContent: string = await this.readFileStream(filePath);
            collectedContent += `<<< ${filePath}\n${fileContent}\n\n`;
        }

        return collectedContent;
    }

    private async findFiles(dir: string): Promise<Array<string>> {
        const entries: Array<fs.Dirent> = await fs.promises.readdir(dir, {withFileTypes: true});
        const files: Array<string> = [];

        for (const entry of entries) {
            const fullPath: string = path.resolve(dir, entry.name);
            if (entry.isDirectory()) {
                files.push(...await this.findFiles(fullPath));
            } else {
                for (const pattern of this.patterns) {
                    if (this.matchPattern(entry.name, pattern)) {
                        files.push(fullPath);
                        break;
                    }
                }
            }
        }

        return files;
    }

    private matchPattern(fileName: string, pattern: string): boolean {
        const regexPattern: string = pattern
            .replace(/\./g, '\\.')
            .replace(/\*/g, '.*');
        const regex: RegExp = new RegExp(`^${regexPattern}$`);
        return regex.test(fileName);
    }

    private async readFileStream(filePath: string): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            let content: string = '';
            const stream: fs.ReadStream = fs.createReadStream(filePath, {encoding: 'utf8'});

            stream.on('data', (chunk: string) => {
                content += chunk;
            });

            stream.on('end', () => {
                resolve(content);
            });

            stream.on('error', (error: Error) => {
                reject(error);
            });
        });
    }
}
