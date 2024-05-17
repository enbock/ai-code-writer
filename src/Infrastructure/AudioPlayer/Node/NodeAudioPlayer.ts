import AudioPlayer from '../../../Core/Audio/AudioPlayer';
import NodeMp3Player from './NodeMp3Player';

export default class NodeAudioPlayer implements AudioPlayer {
    public async play(audioBuffer: Buffer): Promise<void> {
        const player: NodeMp3Player = new NodeMp3Player();
        player.src = audioBuffer;
        await new Promise<void>((resolve) => {
            player.onended = resolve;
            player.play();
        });
    }
}
