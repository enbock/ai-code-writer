import FileCollectorService, {FileData} from '../../../Core/Conversation/FileCollectorService';
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

    public async collectFiles(): Promise<Array<FileData>> {
        const collectedFiles: Array<FileData> = [];

        const files: Array<string> = await this.findFiles(this.sourceDir);
        for (const filePath of files) {
            const relativeFilePath: string = path.relative(process.cwd(), filePath);
            if (this.isExcluded(relativeFilePath)) continue;
            const excludedByPart: boolean = relativeFilePath.split(path.sep)
                .find((p) => this.isExcluded(p)) !== undefined
            ;
            if (excludedByPart) continue;

            const fileContent: string = await this.readFileStream(filePath);

            collectedFiles.push({filePath: relativeFilePath, content: fileContent});
        }

        return collectedFiles;
    }

    private isExcluded(filePath: string): boolean {
        for (const excludeDir of this.excludeDirs) {
            if (filePath.includes(path.normalize(excludeDir) + path.sep)) return true;
        }

        for (const excludeFile of this.excludeFiles) {
            if (this.matchPattern(filePath, excludeFile)) return true;
        }

        return false;
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

    private matchPattern(filePath: string, pattern: string): boolean {
        const regexPattern: string = pattern
            .replace(/\./g, '\\.')
            .replace(/\*/g, '.*')
            .replace(/\?/g, '.');
        const regex: RegExp = new RegExp(`^${regexPattern}$`);
        return regex.test(filePath);
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
