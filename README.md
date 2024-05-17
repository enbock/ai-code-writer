# AI Code Writer

## Übersicht

Dies ist ein AI-basierter Code Writer, der Audio-Input empfängt, in Text umwandelt und basierend auf der Transkription
eine Konversation mit der OpenAI GPT-API führt. Anschließend wird die Antwort wieder in Audio umgewandelt und
abgespielt.

## Voraussetzungen

- Node.js (>= 20)
- Sox (falls nicht vorhanden: https://sox.sourceforge.net)

## Installation von SoX, Node.js und npm

Unter Debian-basierten Systemen (wie Ubuntu):

```sh
sudo apt-get update
sudo apt-get install sox
sudo apt-get install nodejs
sudo apt-get install npm
```

Unter MacOS (unter Verwendung von Homebrew):

```sh
brew install sox
brew install node
```

Unter Windows:

1. Laden Sie SoX von [https://sox.sourceforge.net](https://sox.sourceforge.net) herunter und installieren Sie es.
2. Laden Sie Node.js von [https://nodejs.org](https://nodejs.org) herunter und installieren Sie es. Dies wird auch npm
   installieren.

## Installation

1. Abhängigkeiten installieren:
    ```sh
    npm install
    ```
2. Environment-Datei einrichten:
   Erstellen Sie eine Datei `.env` im Wurzelverzeichnis und fügen Sie Ihre OpenAI-API-Schlüssel hinzu:

    ```
    OPENAI_API_KEY=your_openai_api_key
    OPENAI_API_ORG=your_openai_organization_id
    ```

## Verwendung

Das Projekt kann im Entwicklungsmodus gestartet werden:

```sh
npm run dev
```

Oder als build version:

```sh
npm start
```

## Projektstruktur

- `src/Application`: Enthält die Controller und Anfragedefinitionen, die als Schnittstelle zur Benutzerinteraktion
  dienen.
- `src/Core`: Enthält die Anwendungsfälle (UseCases), Services und Interfaces, welche die Geschäftslogik der Anwendung
  implementieren.
- `src/Infrastructure`: Enthält die Implementierungen der in Core definierten Interfaces und Anbindungen an externe
  Bibliotheken und SDKs.
- `src/index.ts`: Einstiegspunkt der Anwendung.

## Architektur

Das Projekt folgt dem Prinzip der Clean Architecture, was bedeutet, dass:

- Die Geschäftslogik und Anwendungsfälle (Use Cases) im Core-Modul definiert sind.
- Die Infrastruktur-Schicht Implementierungen für Schnittstellen im Core bereitstellt und die Interaktion mit externen
  Diensten und Bibliotheken abwickelt.
- Die Anwendungsschicht Controller und Request-Klassen enthält, die als Bindeglied zwischen der Benutzerinteraktion und
  der Geschäftslogik dienen.

## Lizenz

Dieses Projekt steht unter der MIT Lizenz. Details finden Sie in der LICENSE Datei.
