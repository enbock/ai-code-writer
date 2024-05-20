# AI Code Writer

## Descripción

Una aplicación de escritura de código AI que utiliza las API de OpenAI para la transcripción de audio y la finalización
de chat.

## Aviso Importante

Al ejecutar esta aplicación, los archivos y directorios en el directorio de trabajo actual se enviarán a OpenAI para su
procesamiento. Consulte más en la sección de filtros para saber qué archivos están involucrados.

## Filtros

La aplicación utiliza los siguientes filtros para la recopilación y supervisión de archivos, que se pueden configurar a
través de variables de entorno:

- **Patrones de inclusión**: `INCLUDE_PATTERNS` (predeterminado: `*.ts,*.json,*.yaml,*.md,.env.dist`)
- **Directorios excluidos**: `EXCLUDE_DIRS` (predeterminado: `node_modules,build,.git`)
- **Archivos excluidos**: `EXCLUDE_FILES` (predeterminado: `package-lock.json,.*`)

## Variables de entorno opcionales

Además de la variable obligatoria `OPENAI_API_KEY`, la aplicación admite varias variables de entorno opcionales:

- **OPENAI_API_ORG**: Su ID de organización de OpenAI (si corresponde).
- **OPENAI_AUDIO_TEMPERATURE**: Configuración de temperatura para transformaciones de audio (predeterminado: `0.1`).
- **OPENAI_CHAT_TEMPERATURE**: Configuración de temperatura para finalizaciones de chat (predeterminado: `0.75`).
- **INCLUDE_PATTERNS**: Patrones para los archivos que se incluirán en el procesamiento (
  predeterminado: `*.ts,*.json,*.yaml,*.md,.env.dist`).
- **EXCLUDE_DIRS**: Directorios que se excluirán del procesamiento (predeterminado: `node_modules,build,.git`).
- **EXCLUDE_FILES**: Archivos que se excluirán del procesamiento (predeterminado: `package-lock.json,.*`).

## Uso

```sh
npx ai-code-writer
```

### Guía del usuario

1. **Iniciar la aplicación**:
    - Asegúrese de que la variable de entorno `OPENAI_API_KEY` esté configurada.
    - Opcionalmente, configure las variables de entorno de los filtros como se describe en la sección "Variables de
      entorno opcionales".
    - Inicie la aplicación con el comando `npx ai-code-writer`.

2. **Interacción**:
    - Después de iniciar la aplicación, se reproducirá un mensaje de bienvenida: "El AI Code Writer está listo."
    - Hable su entrada en el micrófono. La aplicación grabará su discurso y lo convertirá en texto.

3. **Conversación**:
    - La entrada transcrita se enviará a la API de OpenAI para obtener una respuesta.
    - La respuesta de la AI se leerá en voz alta y se mostrará en la consola.
    - Si la respuesta contiene tareas de archivos (por ejemplo, crear, mover, eliminar archivos), se ejecutarán
      automáticamente.

4. **Monitoreo de archivos**:
    - Se detectarán los cambios en los archivos monitoreados y se registrarán en el historial de conversación.
    - Estos cambios pueden influir en las respuestas de la AI.

5. **Finalizar la aplicación**:
    - La aplicación se ejecuta en un bucle infinito esperando la entrada del usuario.
    - Para finalizar la aplicación, use los métodos habituales para detener un proceso de Node.js (por ejemplo, `Ctrl+C`
      en la consola).

## Licencia

MIT - [LICENSE](./LICENSE)

## Autor

Endre Bock <dev@itbock.de>

## Idiomas

- [Leer en inglés](./README.md)
- [Leer en alemán](./README_de.md)
- [阅读中文](./README_zh.md)
- [Lire en français](./README_fr.md)

