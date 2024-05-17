import {AudioBuffer, AudioBufferSourceNode, AudioContext, GainNode} from 'node-web-audio-api';

class NodeMp3Player {
    private buffer?: Buffer;
    private gainNode: any | typeof GainNode = null;
    private sourceNode: any | typeof AudioBufferSourceNode = null;
    private audioContext: AudioContext = new AudioContext();

    private endCallback: () => void = () => <never>false;

    public get onended() {
        return this.sourceNode.onended;
    }

    public set onended(callback: () => void) {
        this.endCallback = callback;
    }

    public get src(): Buffer {
        return this.buffer!;
    }

    public set src(buffer: Buffer) {
        void this.cleanAudio();
        this.audioContext = new AudioContext();
        this.gainNode = null;
        this.buffer = buffer;
    }

    public async play(): Promise<void> {
        if (!this.buffer) {
            return;
        }

        const audioBuffer: AudioBuffer | null = await this.getBuffer();
        if (!audioBuffer) return;

        if (this.gainNode) this.gainNode.disconnect();
        this.gainNode = new GainNode(this.audioContext, {gain: 1});
        this.gainNode.connect(this.audioContext.destination);
        const source: AudioBufferSourceNode = this.audioContext.createBufferSource();
        this.sourceNode = source;

        source.buffer = audioBuffer;
        source.connect(this.gainNode);
        source.start(this.audioContext.currentTime);
        // source.stop(this.audioContext.currentTime + audioBuffer.duration);

        await new Promise<void>((resolve) => {
            source.onended = (_: Event) => resolve();
        });
        await this.cleanAudio();
        this.endCallback();
    }

    public async stop(): Promise<void> {
        if (!this.sourceNode) return;

        this.sourceNode.stop(this.audioContext.currentTime);
        await this.cleanAudio();
    }

    private async cleanAudio(): Promise<void> {
        if (this.sourceNode) this.sourceNode.disconnect();
        this.sourceNode = null;

        if (this.gainNode) this.gainNode.disconnect();
        this.gainNode = null;

        await this.audioContext.close();
    }

    private async getBuffer(): Promise<AudioBuffer | null> {
        return new Promise((resolve) => {
            if (!this.buffer) {
                resolve(null);
                return;
            }

            this.audioContext.decodeAudioData(
                this.buffer.buffer.slice(this.buffer.byteOffset, this.buffer.byteOffset + this.buffer.byteLength),
                (audioBuffer: AudioBuffer) => {
                    resolve(audioBuffer);
                },
                (err: Error) => {
                    console.log(err.message);
                    resolve(null);
                }
            );
        });
    }
}

export default NodeMp3Player;