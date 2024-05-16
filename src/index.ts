import Container from './DependencyInjection/Container';

class App {
    public static async run(): Promise<void> {
        try {
            console.log('Starting AI Code Writer...');
            await Container.startController.start();
        } catch (error) {
            console.error('Error starting AI Code Writer:', error);
        }
    }
}

App.run().then();
