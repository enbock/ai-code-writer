import FileCollectorService from '../../../Core/Conversation/FileCollectorService';
import * as fs from 'fs/promises';
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
        let collectedContent = '';

        const files = await this.findFiles(this.sourceDir);
        for (const filePath of files) {
            if (await this.isExcluded(filePath)) continue;
            console.log('<<<', filePath);
            const fileContent = await fs.readFile(filePath, 'utf8');
            collectedContent += `<<< ${filePath}\n${fileContent}\n\n`;
        }

        return collectedContent;
    }

    private async findFiles(dir: string): Promise<Array<string>> {
        const entries = await fs.readdir(dir, {withFileTypes: true});
        const files: Array<string> = [];

        for (const entry of entries) {
            const fullPath = path.resolve(dir, entry.name);
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
        const regexPattern = pattern
            .replace(/\./g, '\\.')
            .replace(/\*/g, '.*');
        const regex = new RegExp(`^${regexPattern}$`);
        return regex.test(fileName);
    }
}
