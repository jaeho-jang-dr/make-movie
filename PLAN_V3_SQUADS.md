
# 🎬 V3 Blockbuster Squad Architecture

## 🌟 Objective
Construct a high-fidelity **Multi-Agent Creation System** where specialized AI agents collaborate in distinct squads to produce rich, layered animated stories.

## 👥 Squad Structure

### 📜 Squad 1: The Writers' Room (Story Squad)
*Goal: Combine classic depth with modern creativity.*
1.  **👵 Story Grandma (Classic Agent)**:
    - Specialist in folklore, fables, and eternal themes (Grimm, Aesop, Korean legends).
    - Provides: Wisdom, moral structure, archetypes.
2.  **👦 Story Kid (Modern Agent)**:
    - Specialist in twist, humor, and "wild" modern imagination.
    - Provides: Fresh plot devices, funny dialogue, unexpected turns.
3.  **✍️ Chief Editor (Synthesis Agent)**:
    - Takes inputs from Grandma and Kid.
    - Output: Final coherent script with perfect pacing and emotional arcs.

### 🎨 Squad 2: The Art Department (Graphics Squad)
*Goal: Visual consistency with distinct specialization.*
1.  **🎨 Art Director**:
    - **The Boss**. Does NOT draw.
    - Output: `StyleGuide.json` (Color Palette hex codes, Line weights, Mood board).
2.  **🔺 Shape & Form Specialist**:
    - Defines the "geometry language" (e.g., "Villains are triangles, Heroes are soft circles").
3.  **🏞️ Background Artist**:
    - Draws strictly using the `Color Palette` + `Shape Language`.
    - Focus: Atmosphere, lighting, depth (Parallax layers).
4.  **🦸 Main Character Designer**:
    - Focus: Expressions (Joy, Angry, Sad sprites) for the protagonists.
5.  **🍄 Prop & Extra Designer**:
    - Detailed items (magic wands, stones, trees) and background characters.

### 🎙️ Squad 3: The Audio Lab (Sound Squad)
1.  **casting Director**: Allows distinct voice acting for every single character.
2.  **Dubbing Engineer**: Generates TTS with specific pitch/speed variations to simulate acting.

## 🛠 File Structure Plan
- `src/agents/StorySquad.ts`
- `src/agents/ArtSquad.ts`
- `src/agents/SoundSquad.ts`
- `src/DirectorV3.ts` (The Orchestrator)

## 🔄 Workflow
1. **Story Squad** holds a debate -> Produces `MasterScript.json`.
2. **Art Director** analyzes `MasterScript` -> Produces `StyleGuide.json`.
3. **Graphics Squad** (Agents 3,4,5) execute parallel generation using `StyleGuide` + `MasterScript`.
4. **Director** compiles into Remotion.
