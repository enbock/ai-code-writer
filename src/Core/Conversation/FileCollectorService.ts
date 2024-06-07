export interface FileData {
    filePath: string;
    content: string;
}

export default interface FileCollectorService {
    collectFiles(): Promise<Array<FileData>>;
}

