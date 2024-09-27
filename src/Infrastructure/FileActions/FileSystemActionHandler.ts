import FileSystemHandler from '../../Core/FileActions/FileSystemHandler';
import * as fs from 'fs/promises';
import * as path from 'path';
import LoggerService from '../../Core/Logger/LoggerService';

export default class FileSystemActionHandler implements FileSystemHandler {
    constructor(private logger: LoggerService) {
    }

    public async handleReadFile(filePath: string): Promise<string> {
        const absoluteFilePath: string = path.resolve(filePath);
        try {
            return (await fs.readFile(absoluteFilePath)).toString('utf8');
        } catch {
            const message: string = `Failed to read file: ${absoluteFilePath}`;
            this.logger.logError(message);
            return message;
        }
    }

    public async handleWriteFile(filePath: string, content: string): Promise<void> {
        const absoluteFilePath: string = path.resolve(filePath);
        try {
            await fs.mkdir(path.dirname(absoluteFilePath), {recursive: true});
            await fs.writeFile(absoluteFilePath, content, 'utf8');
        } catch {
            const message: string = `Failed to write file: ${absoluteFilePath}`;
            this.logger.logError(message);
        }
    }

    public async handleMoveFile(source: string, destination: string): Promise<void> {
        const absoluteSource: string = path.resolve(source);
        const absoluteDestination: string = path.resolve(destination);
        try {
            await fs.mkdir(path.dirname(absoluteDestination), {recursive: true});
            await fs.rename(absoluteSource, absoluteDestination);
        } catch {
            const message: string = `Failed to move file: ${absoluteSource} to ${absoluteDestination}`;
            this.logger.logError(message);
        }
    }

    public async handleDeleteFile(filePath: string): Promise<void> {
        try {
            const absoluteFilePath = path.resolve(filePath);
            await fs.unlink(absoluteFilePath);
        } catch {
            this.logger.logError(`Failed to delete file: ${filePath}`);
        }
    }
}
