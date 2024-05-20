export default interface LoggerService {
    log(message: string): void;

    logProgress(message: string): void;

    logError(message: string): void;
}
