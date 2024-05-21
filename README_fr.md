# AI Code Writer

## Description

Une application de rédaction de code AI utilisant les API d'OpenAI pour la transcription audio et la complétion de chat.

## Avis Important

Lors de l'exécution de cette application, les fichiers et répertoires dans le répertoire de travail actuel seront
envoyés à OpenAI pour traitement. Voir plus dans la section des filtres pour savoir quels fichiers sont impliqués.

## Filtres

L'application utilise les filtres suivants pour la collecte et la surveillance des fichiers, qui peuvent être configurés
via des variables d'environnement :

- **Modèles d'inclusion** : `INCLUDE_PATTERNS` (par défaut : `*.ts,*.json,*.yml,*.yaml,*.md,*.js,.env.dist`)
- **Répertoires exclus** : `EXCLUDE_DIRS` (par défaut : `node_modules,build,dist,.git`)
- **Fichiers exclus** : `EXCLUDE_FILES` (par défaut : `package-lock.json,.*`)

## Variables d'environnement optionnelles

En plus de la variable obligatoire `OPENAI_API_KEY`, l'application prend en charge plusieurs variables d'environnement
optionnelles :

- **OPENAI_API_ORG** : Votre identifiant d'organisation OpenAI (le cas échéant).
- **OPENAI_AUDIO_TEMPERATURE** : Réglage de la température pour les transformations audio (par défaut : `0.1`).
- **OPENAI_CHAT_TEMPERATURE** : Réglage de la température pour les complétions de chat (par défaut : `0.75`).
- **INCLUDE_PATTERNS** : Modèles pour les fichiers à inclure dans le traitement (par
  défaut : `*.ts,*.json,*.yml,*.yaml,*.md,*.js,.env.dist`).
- **EXCLUDE_DIRS** : Répertoires à exclure du traitement (par défaut : `node_modules,build,dist,.git`).
- **EXCLUDE_FILES** : Fichiers à exclure du traitement (par défaut : `package-lock.json,.*`).

## Prérequis

- **SOX (Sound eXchange)** : Cette application nécessite SOX pour l'enregistrement audio. Installez SOX via votre
  gestionnaire de paquets :
  - **macOS** : `brew install sox`
  - **Windows** : Téléchargez l'installateur depuis le [site officiel](http://sox.sourceforge.net/)
  - **Linux** : Utilisez le gestionnaire de paquets de votre distribution, par exemple, `apt-get install sox`

## Utilisation

```sh
npx ai-code-writer
```

### Guide de l'utilisateur

1. **Démarrer l'application** :
    - Assurez-vous que la variable d'environnement `OPENAI_API_KEY` est définie.
    - Facultativement, définissez les variables d'environnement des filtres comme décrit dans la section "Variables
      d'environnement optionnelles".
    - Démarrez l'application avec la commande `npx ai-code-writer`.

2. **Interaction** :
    - Après avoir démarré l'application, un message de bienvenue sera joué : "Le rédacteur de code AI est prêt."
    - Parlez votre entrée dans le microphone. L'application enregistrera votre discours et le convertira en texte.

3. **Conversation** :
    - L'entrée transcrite sera envoyée à l'API d'OpenAI pour obtenir une réponse.
    - La réponse de l'AI sera lue à haute voix et affichée sur la console.
    - Si la réponse contient des tâches de fichiers (par exemple, créer, déplacer, supprimer des fichiers), elles seront
      exécutées automatiquement.

4. **Surveillance des fichiers** :
    - Les modifications des fichiers surveillés seront détectées et enregistrées dans l'historique des conversations.
    - Ces modifications peuvent influencer les réponses de l'AI.

5. **Arrêter l'application** :
    - L'application fonctionne dans une boucle infinie en attendant l'entrée de l'utilisateur.
    - Pour arrêter l'application, utilisez les méthodes habituelles pour arrêter un processus Node.js (par
      exemple, `Ctrl+C` dans la console).

## Licence

MIT - [LICENSE](./LICENSE)

## Auteur

Endre Bock <dev@itbock.de>

## Langues

- [Read in English](./README.md)
- [Auf Deutsch lesen](./README_de.md)
- [Leer en español](./README_es.md)
- [阅读中文](./README_zh.md)
