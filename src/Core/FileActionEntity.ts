import FileActionType from './FileActionType';

export default class FileActionEntity {
    public actionType: FileActionType = FileActionType.WRITE;
    public filePath: string = '';
    public content: string = '';
    public targetFilePath: string = '';
}
