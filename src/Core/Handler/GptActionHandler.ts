export default interface GptActionHandler {
    handleWriteFile(filePath: string, content: string): Promise<void>;

    handleMoveFile(source: string, destination: string): Promise<void>;

    handleDeleteFile(filePath: string): Promise<void>;
}
