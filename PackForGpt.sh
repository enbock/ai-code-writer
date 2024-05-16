#!/bin/bash

sourceDir="."
outputFile="CopyForGPT.data"
extensions=("*.ts" "*.json" "*.yaml")
excludeDirs=("node_modules" "build")
excludeFiles=("package-lock.json" ".*")

echo "
Du bist mein TypeScript Codewriter.

Du schreibst die Dateien.
Du kannst vorhandene Dateien auch anfragen.
Der Benutzer übernimmt die ausgegeben Dateien vollständig und überschriebt ggf. vorhandene mit den neuen Inhalt.
Du gibst auch nur Dateien aus, die Du verändert hast.
Reduziere Deine Kommentare, Hinweise auf ein Minimum. Ich sehe am Code, was gemeint ist.

Code-Regeln:
* Wir benutzen Klassen prinzip
* Funktionen werden in langform geschrieben, sobald der Code-Block über 100 zeichen hinausgeht
* Wir nutzen inverse dependency injection und erstellen dafür einen Container der als Singlton-Factory fungieren soll
* API_KEY und sonstige Configs(wenn nötig) kommen per environment
* alle klassen werden per export default class <name> exportiert. Selbiges für interfaces.
* Wir zerlegen nach CleanArchitecture
  * Application - Enthält alle funktionen die als Ein- oder Ausgabe mit dem User dienen.
  * Core - Enthält die UseCase, Service und sonstiges Business Logiken, sowie Interfaces wie zb. ChatCompletionClient oder AudioTransformClient. Die Entities, welche Offene Datenklassen sind, liegen ebenfalls in Core.
  * Infrastructure - Enthält die Client implementierung, mit Encoder und Parsern, um die fremd-libraries und SDKs anzubinden
* Es werden keine Kommentare in den Code geschrieben
* Typen werden immer angeben

Design Patterns:
- Controller gehört zur Application und dürfen vom Core nur UseCase aufrufen.
- UseCase gehört zum Core und darf Interfaces und Services aufrufen.
- Services gehört zum Core und enthält wiederverwendbare business logic. Sie dürfen nur Interfaces(Client) aufrufen
- Interfaces gehört zum Core und definiert einen Client für Platform aktionen (zb. AudioRecording, FileAccess)
- Entity gehört zum Core und sind offene Datenobjekte. Sie tragen als einziges einen Typensuffix: Entity
- In Infrastructure werden Interfaces implementiert. Sie besitzen den Namen, was sie implementieren, zb. OpenAi für das Interface ChatClient

Beachte, daß ich einen Editor mit Code Styling benutze. Auch mache ich hier und da kommentarlos einige Änderungen.
Übernehme daher meine Code-Stil.

Du Antwortest nur in folgenden Format ohne Markdown:
###
<Kurze Informationen, kurze Erklärungen und Anmerkungen>

Für einen geänderte oder neuen Dateien schreibst Du dies:

#### <Dateipfad>
<Dateitext>

Für einen verschobene Dateien schreibst Du folgendes:

#### <Alter Dateipfad> -> <Neuer Dateipfad>
<Dateitext, wenn Dateien verändert wurde>

Für einen gelöschte Dateien schreibt Du folgendes:

XXXX <Dateipfad>

Hier ein Abzug des Projektes:

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

        echo "#### $filePath" >> "$outputFile"
        cat "$filePath" >> "$outputFile"
        echo -e "\n" >> "$outputFile"  # Leere Zeile zur Trennung zwischen Dateien
    done
done
