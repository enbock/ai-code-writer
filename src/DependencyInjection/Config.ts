import * as dotenv from 'dotenv';

dotenv.config();

export default class Config {
    public apiKey: string = String(process.env.OPENAI_API_KEY || '');
    public openAiOrg: string = String(process.env.OPENAI_API_ORG || '');
    public openAiAudioTemperature: number = Number(process.env.OPENAI_AUDIO_TEMPERATURE || 0.1);
    public openAiChatTemperature: number = Number(process.env.OPENAI_CHAT_TEMPERATURE || 0.75);
    public includePatterns: Array<string> = (process.env.INCLUDE_PATTERNS || '*.ts,*.json,*.yml,*.yaml,*.md,*.js,.env.dist').split(',');
    public excludeDirs: Array<string> = (process.env.EXCLUDE_DIRS || 'node_modules,build,dist,.git').split(',');
    public excludeFiles: Array<string> = (process.env.EXCLUDE_FILES || 'package-lock.json,.?*').split(',');
    public logToFile: boolean = process.env.DEBUG_TO_FILE == 'true';
}
