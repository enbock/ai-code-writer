# AI Code Writer

## Beschreibung

Eine AI-Code-Writer-Anwendung, die OpenAI-APIs für Audio-Transkription und Chat-Vervollständigung verwendet.

## Wichtiger Hinweis

Beim Ausführen dieser Anwendung werden die Dateien und Verzeichnisse im aktuellen Arbeitsverzeichnis zur Verarbeitung an
OpenAI gesendet. Siehe mehr bei den Filtern, welche Dateien involviert werden.

## Filter

Die Anwendung verwendet die folgenden Filter für die Dateisammlung und -überwachung, die über Umgebungsvariablen
konfiguriert werden können:

- **Einschlussmuster**: `INCLUDE_PATTERNS` (Standard: `*.ts,*.json,*.yml,*.yaml,*.md,*.js,.env.dist`)
- **Auszuschließende Verzeichnisse**: `EXCLUDE_DIRS` (Standard: `node_modules,build,dist,.git`)
- **Auszuschließende Dateien**: `EXCLUDE_FILES` (Standard: `package-lock.json,.*`)

## Optionale Umgebungsvariablen

Zusätzlich zur obligatorischen Variable `OPENAI_API_KEY` unterstützt die Anwendung mehrere optionale Umgebungsvariablen:

- **OPENAI_API_ORG**: Ihre OpenAI-Organisations-ID (falls zutreffend).
- **OPENAI_AUDIO_TEMPERATURE**: Die Temperatureinstellung für Audio-Transformationen (Standard: `0.1`).
- **OPENAI_CHAT_TEMPERATURE**: Die Temperatureinstellung für Chat-Vervollständigungen (Standard: `0.75`).
- **INCLUDE_PATTERNS**: Muster für Dateien, die in die Verarbeitung einbezogen werden sollen (
  Standard: `*.ts,*.json,*.yml,*.yaml,*.md,*.js,.env.dist`).
- **EXCLUDE_DIRS**: Verzeichnisse, die von der Verarbeitung ausgeschlossen werden sollen (
  Standard: `node_modules,build,dist,.git`).
- **EXCLUDE_FILES**: Dateien, die von der Verarbeitung ausgeschlossen werden sollen (Standard: `package-lock.json,.*`).

## Verwendung

```sh
npx ai-code-writer
```

### Benutzungshandbuch

1. **Starten der Anwendung**:
    - Stellen Sie sicher, dass die Umgebungsvariable `OPENAI_API_KEY` gesetzt ist.
    - Optional können die Filter-Umgebungsvariablen wie im Abschnitt "Optionale Umgebungsvariablen" beschrieben gesetzt
      werden.
    - Starten Sie die Anwendung mit dem Befehl `npx ai-code-writer`.

2. **Interaktion**:
    - Nach dem Start der Anwendung wird eine Begrüßungsnachricht abgespielt: "Der KI Code Writer ist bereit."
    - Sprechen Sie Ihre Eingabe in das Mikrofon. Die Anwendung wird Ihre Sprache aufnehmen und in Text umwandeln.

3. **Konversation**:
    - Die transkribierte Eingabe wird an die OpenAI-API gesendet, um eine Antwort zu erhalten.
    - Die Antwort der KI wird laut vorgelesen und auf der Konsole angezeigt.
    - Falls die Antwort Dateiaufgaben enthält (z.B. Datei erstellen, verschieben, löschen), werden diese automatisch
      ausgeführt.

4. **Dateiüberwachung**:
    - Änderungen an den überwachten Dateien werden erkannt und in die Konversationshistorie aufgenommen.
    - Diese Änderungen können wiederum die Antworten der KI beeinflussen.

5. **Beenden der Anwendung**:
    - Die Anwendung läuft in einer Endlosschleife und wartet auf Benutzereingaben.
    - Um die Anwendung zu beenden, verwenden Sie die üblichen Methoden zum Beenden eines Node.js-Prozesses (
      z.B. `Ctrl+C` in der Konsole).

## Lizenz

MIT - [LICENSE](./LICENSE)

## Autor

Endre Bock <dev@itbock.de>

## Sprachen

- [Read in English](./README.md)
- [Leer en español](./README_es.md)
- [阅读中文](./README_zh.md)
- [Lire en français](./README_fr.md)

