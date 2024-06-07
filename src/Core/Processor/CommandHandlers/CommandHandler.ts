import FileActionEntity from '../../FileActionEntity';

export default interface CommandHandler {
    canHandle(command: string): boolean;

    handle(section: Array<string>): Promise<{ comments: string[], actions: FileActionEntity[] }>;
}
