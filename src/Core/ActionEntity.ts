import FileActionType from './FileActionType';
import CommandActionType from './CommandActionType';

export type ActionType = 'file' | 'command';

export default class ActionEntity {
    public type: FileActionType | CommandActionType = CommandActionType.PAUSE;
    public actionType: ActionType = 'command';
    public filePath: string = '';
    public content: string = '';
    public targetFilePath: string = '';
    public id: string = '';
    public name: string = '';
}
