import Container from './DependencyInjection/Container';

class App {
    public static async run(): Promise<void> {
        try {
            if (!process.env.OPENAI_API_KEY) {
                console.error('OPENAI_API_KEY is not set in environment variables.');
                console.error('Please set it directly in your shell before running the command:');
                console.error('export OPENAI_API_KEY=your_openai_api_key_here');
                console.error('Then run the application using npx:');
                console.error('npx ts-node src/index.ts');
                // noinspection ExceptionCaughtLocallyJS
                throw new Error('OPENAI_API_KEY is not set in environment variables');
            }
            await Container.startController.start();
        } catch (error) {
            console.error('Error starting AI Code Writer:', error);
        }
    }
}

App.run().then();
