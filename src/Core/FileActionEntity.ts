import FileActionType from './FileActionType';

export default class FileActionEntity {
    public actionType: FileActionType = FileActionType.READ;
    public filePath: string = '';
    public content: string = '';
    public targetFilePath: string = '';
    public id: string = '';
    public name: string = '';
}
