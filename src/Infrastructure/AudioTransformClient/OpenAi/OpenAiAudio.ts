import AudioTransformClient from '../../../Core/Audio/AudioTransformClient';
import {OpenAI} from 'openai';
import FallbackAudio from './FallbackAudio';
import {Transcription} from 'openai/resources/audio';
import LoggerService from '../../../Core/Logger/LoggerService';

export default class OpenAiAudio implements AudioTransformClient {
    static FALLBACK: string = FallbackAudio;

    constructor(
        private apiUrl: string,
        private openApiKey: string,
        private openAi: OpenAI,
        private temperature: number,
        private logger: LoggerService
    ) {
    }

    public async transformAudioToText(audioBuffer: Buffer): Promise<string> {
        const file: File = new File([audioBuffer], 'audio.wav', {type: 'audio/wav'});
        const dataSize: number = audioBuffer.length;

        try {
            const responsePromise: Promise<Transcription> = this.openAi.audio.transcriptions.create({
                file: file,
                model: 'whisper-1',
                response_format: 'json',
                temperature: this.temperature
            });

            return await this.showProgress(responsePromise, dataSize);
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
        const dataSize: number = text.length;

        try {
            const responsePromise: Promise<Response> = fetch(this.apiUrl, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(data)
            });

            return await this.showProgressForAudio(responsePromise, dataSize);
        } catch (error) {
            return Buffer.from(OpenAiAudio.FALLBACK, 'base64');
        }
    }

    private async showProgress(responsePromise: Promise<Transcription>, dataSize: number): Promise<string> {
        let progress: number = 0;
        const interval: number = this.calculateInterval(dataSize);

        const progressInterval = setInterval(() => {
            this.logger.logProgress(`Progress: ${'.'.repeat(progress % 10 + 1)}\r`);
            progress++;
        }, interval);

        try {
            const response: Transcription = await responsePromise;
            clearInterval(progressInterval);
            this.logger.log('Progress: Done               \n');
            return response.text;
        } catch (error) {
            clearInterval(progressInterval);
            this.logger.logError('Progress: Failed\n');
            throw error;
        }
    }

    private async showProgressForAudio(responsePromise: Promise<Response>, dataSize: number): Promise<Buffer> {
        let progress: number = 0;
        const interval: number = this.calculateInterval(dataSize);

        const progressInterval = setInterval(() => {
            this.logger.logProgress(`Progress: ${'.'.repeat(progress % 10 + 1)}\r`);
            progress++;
        }, interval);

        try {
            const response: Response = await responsePromise;
            clearInterval(progressInterval);
            this.logger.log('Progress: Done               \n');
            if (response.ok == false) {
                return Buffer.from(OpenAiAudio.FALLBACK, 'base64');
            }
            return await this.convertAudio(response);
        } catch (error) {
            clearInterval(progressInterval);
            this.logger.logError('Progress: Failed\n');
            return Buffer.from(OpenAiAudio.FALLBACK, 'base64');
        }
    }

    private async convertAudio(response: Response): Promise<Buffer> {
        const audioBuffer: ArrayBuffer = await response.arrayBuffer();

        return Buffer.from(audioBuffer);
    }

    private calculateInterval(dataSize: number): number {
        const baseInterval: number = 500;
        const sizeFactor: number = Math.log2(dataSize / 1024);
        return baseInterval * (1 + sizeFactor / 10);
    }
}
