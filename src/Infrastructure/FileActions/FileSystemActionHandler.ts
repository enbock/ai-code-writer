import FileSystemHandler from '../../Core/FileActions/FileSystemHandler';
import * as fs from 'fs/promises';
import * as path from 'path';
import LoggerService from '../../Core/Logger/LoggerService';

export default class FileSystemActionHandler implements FileSystemHandler {
    constructor(private logger: LoggerService) {
    }

    public async handleWriteFile(filePath: string, content: string): Promise<void> {
        const absoluteFilePath: string = path.resolve(filePath);
        try {
            this.logger.log(`Write file: ${filePath}`);
            await fs.mkdir(path.dirname(absoluteFilePath), {recursive: true});
            await fs.writeFile(absoluteFilePath, content, 'utf8');
        } catch {
            this.logger.logError(`Failed to write file: ${absoluteFilePath}`);
        }
    }

    public async handleMoveFile(source: string, destination: string): Promise<void> {
        const absoluteSource: string = path.resolve(source);
        const absoluteDestination: string = path.resolve(destination);
        try {
            this.logger.log(`Move file: ${source} to ${destination}`);
            await fs.mkdir(path.dirname(absoluteDestination), {recursive: true});
            await fs.rename(absoluteSource, absoluteDestination);
        } catch {
            this.logger.logError(`Failed to move file: ${absoluteSource} to ${absoluteDestination}`);
        }
    }

    public async handleDeleteFile(filePath: string): Promise<void> {
        try {
            const absoluteFilePath = path.resolve(filePath);
            this.logger.log(`Delete file: ${absoluteFilePath}`);
            await fs.unlink(absoluteFilePath);
        } catch {
            this.logger.logError(`Failed to delete file: ${filePath}`);
        }
    }
}
