# Google AI Story Video Generator

## Project Overview
This project automates the creation of 10-minute children's story videos using:
- **Google Gemini 2.0**: For story generation.
- **Google Imagen 3**: For image generation.
- **Google Cloud TTS**: For voiceover generation.
- **Remotion**: For programmatic video editing and rendering.

## Commands
- **Install Dependencies**: `npm install`
- **Create Video**: `npm run create -- -t "Title" -d 10`
  - Arguments: `-t` (title), `-d` (duration in minutes), `-a` (target age), `--theme` (theme)
- **Batch Create**: `npm run batch -- -f stories.json`
- **Preview Video**: `npm run preview`
- **Render Video**: `npm run render`

## Setup Requirements
1.  **Node.js**: v18 or higher.
2.  **Google Cloud Project**: Enable TTS API, create Service Account.
3.  **Authentication**:
    - `gcloud auth application-default login`
    - Set `GOOGLE_AI_API_KEY` in `.env`
    - Set `GOOGLE_APPLICATION_CREDENTIALS` in `.env`

## Key Files
- `src/automation/GoogleStoryGenerator.ts`: Main logic for calling AI APIs and generating assets.
- `src/automation/cli.ts`: CLI entry point.
- `src/index.ts`: Remotion entry point.
- `stories.json`: Batch processing configuration.
