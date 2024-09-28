import GetStateResponse from '../../Core/Conversation/ModeUseCase/GetStateResponse';

export default class StateResponse implements GetStateResponse {
    public isPaused: boolean = false;
    public isSuspended: boolean = false;
}
