import AudioTransformClient from '../../../Core/Audio/AudioTransformClient';
import {OpenAI} from 'openai';
import FallbackAudio from './FallbackAudio';
import {Transcription} from 'openai/resources/audio';

export default class OpenAiAudio implements AudioTransformClient {
    static FALLBACK: string = FallbackAudio;

    constructor(
        private apiUrl: string,
        private openApiKey: string,
        private openAi: OpenAI
    ) {
    }

    public async transformAudioToText(audioBuffer: Buffer): Promise<string> {
        const file: File = new File([audioBuffer], 'audio.wav', {type: 'audio/wav'});

        try {
            const transcription: Transcription = await this.openAi.audio.transcriptions.create({
                file: file,
                model: 'whisper-1',
                response_format: 'json',
                temperature: 1
            });
            return transcription.text;
        } catch (error) {
            return '';
        }
    }

    public async transformTextToAudio(text: string): Promise<Buffer> {
        const headers: Record<string, string> = {
            'Authorization': 'Bearer ' + this.openApiKey,
            'Content-Type': 'application/json'
        };

        const data: Object = {
            model: 'tts-1',
            input: text,
            voice: 'nova',
            speed: 1
        };

        try {
            const response: Response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(data)
            });

            if (response.ok == false) {
                return Buffer.from(OpenAiAudio.FALLBACK, 'base64');
            }
            return await this.convertAudio(response);
        } catch (error) {
            return Buffer.from(OpenAiAudio.FALLBACK, 'base64');
        }
    }

    private async convertAudio(response: Response): Promise<Buffer> {
        const audioBuffer: ArrayBuffer = await response.arrayBuffer();

        return Buffer.from(audioBuffer);
    }
}

