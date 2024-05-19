import FileActionRequestInterface from '../Core/FileActions/FileActionRequest';

export default class FileActionRequest implements FileActionRequestInterface {
    public actions: Array<string> = [];
}
