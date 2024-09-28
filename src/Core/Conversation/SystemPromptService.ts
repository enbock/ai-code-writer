export default interface SystemPromptService {
    getSystemPrompt(magicWord: string): string;

    getSuspendModePrompt(magicWord: string): string;
}
