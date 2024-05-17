import AudioResponseInterface from '../Core/Audio/AudioResponse';

export default class AudioResponse implements AudioResponseInterface {
    audio: Buffer = Buffer.from('');
    transcription: string = '';
}
