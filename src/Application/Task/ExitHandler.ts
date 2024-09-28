export default class ExitHandler {
    public exitProgramm(): void {
        console.log('Programm beendet');
        process.exit(0);
    }
}
