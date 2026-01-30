
import { promises as fs } from 'fs';
import * as path from 'path';

async function parseHtmlToStory() {
  const htmlPath = path.join(process.cwd(), 'public/storybooks/숲속-친구들의-하루/index.html');
  
  try {
    const html = await fs.readFile(htmlPath, 'utf-8');
    
    // Extract Title
    const titleMatch = html.match(/<h1>(.*?)<\/h1>/);
    const title = titleMatch ? titleMatch[1] : 'Unknown Story';
    
    // Extract Scenes
    const sceneRegex = /<div class="scene-card" id="scene-(\d+)">[\s\S]*?<p>(.*?)<\/p>/g;
    let match;
    const scenes: Array<{
      sceneNumber: number;
      duration: number;
      narration: string;
      backgroundDescription: string;
      characters: string[];
      actions: string[];
    }> = [];
    
    while ((match = sceneRegex.exec(html)) !== null) {
      const sceneNum = parseInt(match[1]);
      const narration = match[2];
      
      scenes.push({
        sceneNumber: sceneNum,
        duration: 10, // Default 10 seconds per scene
        narration: narration,
        backgroundDescription: `Scene ${sceneNum} background for ${title}`,
        characters: [`Character for Scene ${sceneNum}`],
        actions: [`Action for Scene ${sceneNum}`]
      });
    }

    if (scenes.length === 0) {
      console.error('No scenes found matches regex');
      return;
    }

    const story = {
      title: title,
      duration: Math.ceil(scenes.length * 10 / 60), // Calculate minutes
      targetAge: '5-7세',
      theme: 'Nature',
      scenes: scenes
    };

    // Output keys compatible with the Generator's 'generateStory' result (which returns scene array)
    // But 'batch' command expects an array of stories, where each story is input config.
    // However, the Generator.generateStory creates the scenes.
    // If we already HAVE scenes, we want to bypass generateStory.
    // The current cli.ts 'batch' command CALLS generateStory.
    // We need to modify cli.ts to accept PRE-GENERATED scenes or we need to modify Generator to accept existing scenes.

    // Let's create a 'forest_friends.json' that conforms to the *output* of generateStory?
    // No, CLI 'batch' iterates inputs and *calls* generateStory.
    
    // Hack: We will save this as 'forest_friends_scenes.json' and modify CLI to read it directly?
    // Or better, modify GoogleStoryGenerator to allow "skipping" generation if scenes are provided.
    
    await fs.writeFile('forest_friends_scenes.json', JSON.stringify(scenes, null, 2));
    console.log(`Parsed ${scenes.length} scenes. Saved to forest_friends_scenes.json`);

  } catch (error) {
    console.error('Error parsing HTML:', error);
  }
}

parseHtmlToStory();
