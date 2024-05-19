import FileSystemHandler from '../../Core/FileActions/FileSystemHandler';
import * as fs from 'fs/promises';
import * as path from 'path';

export default class FileSystemActionHandler implements FileSystemHandler {
    public async handleWriteFile(filePath: string, content: string): Promise<void> {
        console.log('Write file:', filePath);
        await fs.mkdir(path.dirname(filePath), {recursive: true});
        await fs.writeFile(filePath, content, 'utf8');
    }

    public async handleMoveFile(source: string, destination: string): Promise<void> {
        console.log('Move file:', source, destination);
        await fs.mkdir(path.dirname(destination), {recursive: true});
        await fs.rename(source, destination);
    }

    public async handleDeleteFile(filePath: string): Promise<void> {
        console.log('Delete file:', filePath);
        await fs.unlink(filePath);
    }
}

