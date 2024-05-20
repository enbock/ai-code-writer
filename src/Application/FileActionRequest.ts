import FileActionRequestInterface from '../Core/FileActions/FileActionRequest';
import FileActionEntity from '../Core/Entities/FileActionEntity';

export default class FileActionRequest implements FileActionRequestInterface {
    public actions: Array<FileActionEntity> = [];
}
