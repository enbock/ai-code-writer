export default interface FileSystemHandler {
    handleReadFile(filePath: string): Promise<string>;

    handleWriteFile(filePath: string, content: string): Promise<void>;

    handleMoveFile(source: string, destination: string): Promise<void>;

    handleDeleteFile(filePath: string): Promise<void>;
}
