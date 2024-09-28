import FileActionRequestInterface from '../Core/FileActions/FileActionRequest';
import ActionEntity from '../Core/ActionEntity';

export default class FileActionRequest implements FileActionRequestInterface {
    public action: ActionEntity = new ActionEntity();
}
