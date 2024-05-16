import RecordAndProcessResponseInterface from '../Core/Conversation/RecordAndProcessResponse';

export default class RecordAndProcessResponse implements RecordAndProcessResponseInterface {
    audio: Buffer = Buffer.from('');
    transcription: string = '';
}
