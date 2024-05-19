export default interface FileCollectorService {
    collectFiles(): Promise<string>;
}
