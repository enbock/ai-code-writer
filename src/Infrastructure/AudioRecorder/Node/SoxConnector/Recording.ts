import assert from 'assert';
import {ChildProcessWithoutNullStreams, spawn, SpawnOptions} from 'child_process';
import {Readable} from 'node:stream';

const debug = require('debug')('record');

export interface Options {
    bitRate: number;
    sampleRate: number;       // audio sample rate
    channels: number;         // number of channels
    threshold: number;        // silence threshold (rec only)
    endOnSilence: boolean;    // automatically end on silence (if supported)
    thresholdStart?: number | null;  // silence threshold to start recording, overrides threshold (rec only)
    thresholdEnd?: number | null;    // silence threshold to end recording, overrides threshold (rec only)
    silence: string;          // seconds of silence before ending
    audioType: string;        // audio type to record
}


export class Recording {
    private readonly options: Options;
    private readonly cmd: string = '';
    private readonly args: Array<string>;
    private readonly cmdOptions: SpawnOptions;
    private process?: ChildProcessWithoutNullStreams;
    private _stream?: Readable;

    constructor(options: Options) {
        const defaults: Options = {
            sampleRate: 16000,
            bitRate: 16,
            channels: 1,
            threshold: 0.5,
            thresholdStart: null,
            thresholdEnd: null,
            silence: '1.0',
            endOnSilence: false,
            audioType: 'wav'
        };

        this.options = Object.assign(defaults, options);

        this.cmd = 'sox';
        this.args = [
            '--default-device',
            '--no-show-progress',
            '--rate', String(options.sampleRate),
            '--channels', String(options.channels),
            '--encoding', 'signed-integer', // sample encoding
            '--bits', String(options.bitRate),
            '--type', String(options.audioType),
            '-',
            'silence', '1', '0.1', String(options.thresholdStart || options.threshold) + '%',
            '1', String(options.silence), String(options.thresholdEnd || options.threshold) + '%'
        ];
        // noinspection SpellCheckingInspection
        this.cmdOptions = <SpawnOptions>{
            encoding: 'binary',
            stdio: 'pipe',
            env: {
                ...process.env,
                AUDIODRIVER: 'waveaudio'
            }
        };

        debug(`Started recording`);
        debug(this.options);
        debug(` ${this.cmd} ${this.args.join(' ')}`);

        return this.start();
    }

    start() {
        const cp: any = spawn(this.cmd, this.args, this.cmdOptions);
        const rec: Readable = cp.stdout;
        const err: Readable = cp.stderr;

        this.process = cp; // expose the child process
        this._stream = rec; // expose output stream

        cp.on('close', (code: number) => {
            if (code === 0) return;
            rec.emit('error', `${this.cmd} has exited with error code ${code}.

Enable debugging with the environment variable DEBUG=record.`
            );
        });

        err.on('data', (chunk: any) => {
            debug(`STDERR: ${chunk}`);
        });

        rec.on('data', (chunk: any) => {
            debug(`Recording ${chunk.length} bytes`);
        });

        rec.on('end', () => {
            debug('Recording ended');
        });

        return this;
    }

    stop(): void {
        assert(this.process, 'Recording not yet started');

        this.process.kill();
    }

    pause(): void {
        assert(this.process, 'Recording not yet started');

        this.process.kill('SIGSTOP');
        this._stream!.pause();
        debug('Paused recording');
    }

    resume(): void {
        assert(this.process, 'Recording not yet started');

        this.process.kill('SIGCONT');
        this._stream!.resume();
        debug('Resumed recording');
    }

    isPaused(): boolean {
        assert(this.process, 'Recording not yet started');

        return this._stream!.isPaused();
    }

    stream(): Readable {
        assert(this._stream, 'Recording not yet started');

        return this._stream;
    }
}

export function SoxRecordingFactory(options: Options): Recording {
    return new Recording(options);
}
