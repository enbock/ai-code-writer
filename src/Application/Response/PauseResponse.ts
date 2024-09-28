import GetStateResponse from '../../Core/Conversation/ModeUseCase/GetStateResponse';

export default class PauseResponse implements GetStateResponse {
    public isPaused: boolean = false;
    public isSuspended: boolean = false;
}
