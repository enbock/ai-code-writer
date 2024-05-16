# AI Code Writer

## Übersicht

**AI Code Writer** ist ein Command-Line-Tool, das Sprachaufnahmen per Mikrofon aufnimmt, diese mittels der OpenAI
Whisper-API transkribiert und den Text an die OpenAI GPT-4 API sendet. Die erhaltene Antwort wird anschließend mit
OpenAI TTS-1-HD in eine Audiodatei umgewandelt und wiedergegeben.

## Features

- Sprachaufnahmen vom Mikrofon
- Transkription mittels OpenAI Whisper-API
- Kommunikation mit der OpenAI GPT-4 API
- Audioausgabe der Antwort mittels OpenAI TTS-1-HD
- Konfigurierbare Umgebungsvariablen (API-Keys)

## Projektstruktur

Nach dem Prinzip der Clean Architecture ist das Projekt in folgende Module unterteilt:

- **Application**: Hier befinden sich alle Funktionen, die als Ein- oder Ausgabe mit dem Benutzer dienen.
- **Core**: Enthält UseCases, Services und sonstige Business-Logiken sowie Interfaces (
  z.B. `ChatCompletionClient`, `AudioTransformClient`). Auch die Datenmodelle (Entities) liegen in diesem Modul.
- **Infrastructure**: Beinhaltet die Implementierungen der Clients, Encoder und Parser, um fremde Bibliotheken und SDKs
  anzubinden.

## Implementierungsansatz

- Klassenprinzip
- Funktionen werden in Langform geschrieben, sobald der Code-Block über 100 Zeichen hinausgeht.
- Inverse Dependency Injection mithilfe eines Containers, der als Singleton-Factory fungiert.
- Konfiguration (z.B. API_KEYS) erfolgt über Umgebungsvariablen.
- Alle Klassen und Interfaces werden standardmäßig exportiert.

## Abhängigkeiten

- Node.js
- Typescript
- OpenAI Whisper-API
- OpenAI GPT-4 API
- OpenAI TTS-1-HD API
- Mikrofon und Audioausgabe-Gerät
- SoX (Sound eXchange)

## Installation

### Installation von SoX (Sound eXchange)

**Windows:**

1. Laden Sie SoX von der offiziellen [SoX-Seite](http://sox.sourceforge.net/) herunter und installieren Sie es.
2. Fügen Sie das SoX Installationsverzeichnis zu Ihrer `PATH`-Umgebungsvariablen hinzu.

**Linux:**

```sh
sudo apt-get install sox
sudo apt-get install libsox-fmt-all
```

**macOS:**

```sh
brew install sox
```

### Konfiguration

Erstellen Sie eine `.env` Datei im Stammverzeichnis und fügen Sie die erforderlichen Konfigurationen hinzu:

```
OPENAI_API_KEY=<Ihr OpenAI API Schlüssel>
OPENAI_API_ORG=<Ihre OpenAI Organisation>
```

### Ausführen des Tools

1. **Installieren Sie die Abhängigkeiten:**

```sh
npm install
```

2. **Projekt kompilieren und ausführen:**

```sh
npm start
```

## Beitragende

- Endre Bock
- Open AI GPT-4o

## Lizenz

Dieses Projekt ist unter der MIT Lizenz lizenziert.
