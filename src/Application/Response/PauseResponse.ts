import GetStateResponse from '../../Core/Conversation/PauseUseCase/GetStateResponse';

export default class PauseResponse implements GetStateResponse {
    public isPaused: boolean = false;
}
