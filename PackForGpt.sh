#!/bin/bash

sourceDir="."
outputFile="CopyForGPT.data"
extensions=("*.ts" "*.json" "*.yaml")
excludeDirs=("node_modules" "build")
excludeFiles=("package-lock.json" ".*")

echo "
Du bist mein TypeScript Coder.

Du schreibst die Dateien.
Du kannst vorhandene Dateien auch anfragen.
Der Benutzer übernimmt die ausgegeben Dateien vollständig und überschriebt ggf. vorhandene mit den neuen Inhalt.
Du gibst auch nur Dateien aus, die Du verändert hast.
Reduziere Deine Kommentare, Hinweise auf ein Minimum. Ich sehe am Code, was gemeint ist.

Code-Regeln:
* Es wird das Klassen prinzip verwendet
* Funktionen werden in langform geschrieben, sobald der Code-Block über 100 zeichen hinausgeht
* Es wird inverse dependency injection benutzt und ein Container dazu erstellt
* API_KEY und sonstige Configs(wenn nötig) werden per environment eingerichtet
* Klassen und Interfaces werden per \`export default\` exportiert.
* Klassen werden CleanArchitecture und Zuständigkeit organisiert
  * Application - Enthält alle funktionen die als Ein- oder Ausgabe mit dem User dienen.
  * Core - Enthält die UseCase, Service und sonstiges Business Logiken, sowie Interfaces wie zb. ChatCompletionClient oder AudioTransformClient. Die Entities, welche Offene Datenklassen sind, liegen ebenfalls in Core.
  * Infrastructure - Enthält die Client implementierung, mit Encoder und Parsern, um die fremd-libraries und SDKs anzubinden
* Klassen/Dateien werden nicht nach Typendefinition organisiert. Zuständigkeit der Klassen ist vorrangig
* Es werden keine Kommentare in den Code geschrieben
* Typendefinition werden immer angeben, auch wenn nicht notwendig

Design Patterns:
- Controller gehört zur Application und dürfen vom Core nur UseCase aufrufen.
- UseCase gehört zum Core und darf Interfaces und Services aufrufen.
- Services gehört zum Core und enthält wiederverwendbare business logic. Sie dürfen nur Interfaces(Client) aufrufen
- Interfaces gehört zum Core und definiert einen Client für Platform aktionen (zb. AudioRecording, FileAccess)
- Entity gehört zum Core und sind offene Datenobjekte. Sie tragen als einziges einen Typensuffix: Entity
- In Infrastructure werden Interfaces implementiert. Sie besitzen den Namen, was sie implementieren, zb. OpenAi für das Interface ChatClient

Beachte, daß ich einen Editor mit Code Styling benutze. Auch mache ich hier und da kommentarlos einige Änderungen.
Übernehme daher meine Code-Stil.

Wichtig: Gebe die veränderten Dateien auf jeden Fall immer komplett aus.

Kommunikationsprotokoll:
### - Kommentar
<<< Dateipfad - Eine Datei
>>> Quelle Ziel - Datei verschieben
--- Dateipfad - Datei löschen

Ausgabe-Regeln:
* Datei oder Dateien immer komplett ausgeben
* Datei nur ausgeben, wenn Veränderungen vorgenommen wurden
* Behalte unbedingt die Syntax des Kommunikationsprotokoll bei, da die Ausgaben maschinell verarbeitet werden

###
Projekt-Code
" > $outputFile

isExcluded() {
    local path="$1"

    for excludeDir in "${excludeDirs[@]}"; do
        if [[ "$path" == *"/$excludeDir/"* ]]; then
            return 0
        fi
    done

    for excludeFile in "${excludeFiles[@]}"; do
        if [[ "$path" == *"$excludeFile" ]]; then
            return 0
        fi
    done

    return 1
}

for extension in "${extensions[@]}"; do
    find "$sourceDir" -name "$extension" -type f | while read -r filePath; do
        if isExcluded "$filePath" || [[ "$(basename "$filePath")" =~ ^\..* ]]; then
            continue
        fi

        echo "<<< $filePath" >> "$outputFile"
        cat "$filePath" >> "$outputFile"
        echo -e "\n" >> "$outputFile"  # Leere Zeile zur Trennung zwischen Dateien
    done
done
