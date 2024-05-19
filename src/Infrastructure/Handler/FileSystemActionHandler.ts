import GptActionHandler from '../../Core/Handler/GptActionHandler';
import * as fs from 'fs/promises';
import * as path from 'path';

export default class FileSystemActionHandler implements GptActionHandler {
    public async handleWriteFile(filePath: string, content: string): Promise<void> {
        await fs.mkdir(path.dirname(filePath), {recursive: true});
        await fs.writeFile(filePath, content, 'utf8');
    }

    public async handleMoveFile(source: string, destination: string): Promise<void> {
        await fs.mkdir(path.dirname(destination), {recursive: true});
        await fs.rename(source, destination);
    }

    public async handleDeleteFile(filePath: string): Promise<void> {
        await fs.unlink(filePath);
    }
}
