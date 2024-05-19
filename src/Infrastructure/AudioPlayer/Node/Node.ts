import AudioPlayer from '../../../Core/Audio/AudioPlayer';
import AudioFilePlayer from './AudioFilePlayer';

export default class Node implements AudioPlayer {
    public async play(audioBuffer: Buffer): Promise<void> {
        const player: AudioFilePlayer = new AudioFilePlayer();
        player.src = audioBuffer;
        await new Promise<void>((resolve) => {
            player.onended = resolve;
            player.play();
        });
    }
}
