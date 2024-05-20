import FileSystemHandler from '../../Core/FileActions/FileSystemHandler';
import * as fs from 'fs/promises';
import * as path from 'path';
import LoggerService from '../../Core/Logger/LoggerService';

export default class FileSystemActionHandler implements FileSystemHandler {
    constructor(private logger: LoggerService) {}

    public async handleWriteFile(filePath: string, content: string): Promise<void> {
        try {
            this.logger.log(`Write file: ${filePath}`);
            await fs.mkdir(path.dirname(filePath), {recursive: true});
            await fs.writeFile(filePath, content, 'utf8');
        } catch {
            this.logger.logError(`Failed to write file: ${filePath}`);
        }
    }

    public async handleMoveFile(source: string, destination: string): Promise<void> {
        try {
            this.logger.log(`Move file: ${source} to ${destination}`);
            await fs.mkdir(path.dirname(destination), {recursive: true});
            await fs.rename(source, destination);
        } catch {
            this.logger.logError(`Failed to move file: ${source} to ${destination}`);
        }
    }

    public async handleDeleteFile(filePath: string): Promise<void> {
        try {
            this.logger.log(`Delete file: ${filePath}`);
            await fs.unlink(filePath);
        } catch {
            this.logger.logError(`Failed to delete file: ${filePath}`);
        }
    }
}
