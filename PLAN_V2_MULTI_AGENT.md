
# 🎬 Advanced AI Video Generation Plan (V2)

## 🎯 Objective
Create a sophisticated, 10-minute animated video titled **"신비한 숲속의 모험" (Adventure in the Mysterious Forest)** using a Multi-Agent System. The goal is to surpass previous limitations (repetitive images, static camera) by introducing dynamic direction, unique character designs, and a continuous narrative flow.

## 🏗️ Architecture: Multi-Agent Squads

We have reorganized the production pipeline into specialized "Squads" of AI Agents, orchestrated by the `MultiAgentDirector`:

### Squad 1: Creative (Pre-Production)
- **👤 Character Designer Agent**: 
  - Generates detailed visual traits (colors, accessories) and personalities for 3 unique characters.
  - Assigns distinct TTS voice parameters (pitch, speed) to each character to avoid monotony.
- **✍️ Storyteller Agent (Scriptwriter)**:
  - Writes a 10-minute script (approx. 60 scenes).
  - output includes **Director's Notes**:
    - `camera`: Camera angles (Pan, Zoom, Wide, Close-up).
    - `visualPrompt`: Detailed instructions for the background artist.
    - `actionDescription`: Animations for characters (e.g., "walking left", "jumping").

### Squad 2: Production (Asset Generation)
- **🎨 Background Artist Agent**:
  - Uses **Gemini 2.5 Flash** (latest model) to generate high-fidelity SVG vector art.
  - Creates extensive `linearGradient` definitions for atmospheric lighting (sunsets, mystical fogs).
  - Ensures no text placeholders, only pure art.
- **🏃 Character Animator Agent**:
  - Generates character sprites matching the "Visual Traits" from Phase 1.
  - Creates specific poses based on the script's action description.
- **🎙️ Sound Engineer Agent**:
  - Synthesis narration using Google Cloud TTS (Neural2 voices).
  - (Future) Background music generation.

### Squad 3: Post-Production (Editing)
- **✂️ Editor Agent (Remotion)**:
  - Compiles all assets into a React-based video.
  - **Dynamic Camera System**: Translates script `camera` tags into Remotion animations:
    - `pan-left` -> `translateX(0 to -100)`
    - `zoom-in` -> `scale(1 to 1.2)`
    - `walking` -> `translateY(sine_wave)` (Bobbing animation).
  - **Continuous Flow**: Sequences scenes seamlessly using `<Sequence>` components.

## 🛠️ Technology Stack (V2)
- **Core Intelligence**: Google Gemini 2.5 Flash (via `models/gemini-2.5-flash`).
- **Image Engine**: Procedural SVG Generation (Resolution Independent).
- **Video Engine**: Remotion (React-based).
- **Audio**: Google Cloud TTS (Neural2).

## 📅 Execution Plan
1. **Initialize**: Run `create-movie` command.
2. **Design**: Generate characters and script (done).
3. **Asset Production**: Loop through 20+ scenes generating SVGs and Audio (in progress).
4. **Render**: Compile `StoryVideoV2.tsx` to MP4.

## 🚀 Future Upgrades
- **Imagen 4.0 Integration**: Once SDK signatures are confirmed, switch from SVG to GenAI Raster Images for photorealism.
- **VEO Video Generation**: Integrate `models/veo-2.0` for 3-second animated clips per scene.
