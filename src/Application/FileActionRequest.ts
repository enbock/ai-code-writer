import FileActionRequestInterface from '../Core/FileActions/FileActionRequest';
import FileActionEntity from '../Core/FileActionEntity';

export default class FileActionRequest implements FileActionRequestInterface {
    public action: FileActionEntity = new FileActionEntity();
}
