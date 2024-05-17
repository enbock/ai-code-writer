import Container from './DependencyInjection/Container';

class App {
    public static async run(): Promise<void> {
        try {
            await Container.startController.start();
        } catch (error) {
            console.error('Error starting AI Code Writer:', error);
        }
    }
}

App.run().then();
