import LoggerService from '../../Core/Logger/LoggerService';

export default class Logger implements LoggerService {
    public log(message: string): void {
        console.log(message);
    }

    public logProgress(message: string): void {
        process.stdout.write(message);
    }

    public logError(message: string): void {
        console.error(message);
    }
}
