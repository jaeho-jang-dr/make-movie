
# Usage Guide

## Automatic Video Generation

You can generate videos using the CLI.

### 1. Create from Scratch (requires working Google AI API)
```bash
npm run create -- --title "My Story" --duration 10 --theme "Adventure"
```

### 2. Create from Existing Story (Parsed from HTML or JSON)
If you have a story structure (e.g. parsed from an existing storybook), you can generate a video directly, skipping the AI Story Generation step.

1. **Parse HTML Storybook**:
   ```bash
   npx ts-node src/automation/parse-html.ts
   ```
   This creates `forest_friends_scenes.json`.

2. **Generate Video from JSON**:
   ```bash
   npx ts-node src/automation/cli.ts from-json forest_friends_scenes.json --title "Forest Friends Day"
   ```

## Configuration
- **API Keys**: Set `GOOGLE_AI_API_KEY` in `.env.local`.
- **Image Generator**: Default is `imagen` (Google Imagen 3). If you lack access, it falls back to placeholders. To use Hugging Face, set `IMAGE_GENERATOR=huggingface` and providing `HUGGING_FACE_API_KEY`.

## Troubleshooting
- **404 Errors**: Use `node check-models.js` to verify model availability. `gemini-1.5-flash` is the default text model.
- **Quota Exceeded**: The system executes generation sequentially to avoid rate limits.
