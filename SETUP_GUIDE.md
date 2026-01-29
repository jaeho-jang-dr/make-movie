# Setup Guide - Google AI Story Video Generator

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Get Hugging Face API Key (Free!)

1. **Visit**: https://huggingface.co/settings/tokens
2. **Sign up** for a free account (if you don't have one)
3. **Click** "New token"
4. **Name** it: `video-generator`
5. **Role**: Select "Read"
6. **Copy** the generated token (starts with `hf_...`)

### 3. Configure Environment Variables

Edit `.env` file and replace the placeholder:

```env
# Replace this line:
HUGGING_FACE_API_KEY=your_huggingface_api_key_here

# With your actual key:
HUGGING_FACE_API_KEY=hf_YourActualKeyHere
```

**Complete `.env` Example:**
```env
# Google AI Studio API Key
GOOGLE_AI_API_KEY=YOUR_GOOGLE_AI_API_KEY

# Google Cloud 서비스 계정 키 경로 (TTS용)
GOOGLE_APPLICATION_CREDENTIALS=./service-account.json

# Hugging Face API Key (이미지 생성용)
HUGGING_FACE_API_KEY=hf_abc123def456ghi789...

# 이미지 생성 방식 선택 (huggingface 또는 imagen)
IMAGE_GENERATOR=huggingface

# 선택 사항
TTS_LANGUAGE_CODE=ko-KR
TTS_VOICE_NAME=ko-KR-Neural2-A
REMOTION_CONCURRENCY=4
```

### 4. Test with 1-Minute Video

```bash
npm run create -- -t "작은 곰의 모험" -d 1 -a 5
```

**Expected Output:**
- ✅ 5 scenes generated
- ✅ Real illustrations (PNG images) created
- ✅ Google TTS narration (MP3) created
- ✅ Remotion components auto-generated
- ✅ Final video: `output/작은-곰의-모험.mp4`

### 5. Preview in Browser

```bash
npm run preview
```

Visit: http://localhost:3000

---

## 🎨 What's Changed?

### Before (Old System)
- ❌ Simple colored SVG placeholders (blue background, orange rectangles)
- ❌ Gemini 2.0 API quota errors
- ❌ Imagen 3 code present but never called
- ❌ Basic fade/scale animations only

### After (New System)
- ✅ **Real illustrations** using Hugging Face FLUX.1
- ✅ **Free solution** (Gemini 1.5 Flash + HF free tier)
- ✅ **Stable API** with retry logic + fallback placeholders
- ✅ **Advanced animations**: Spring bounce, typing effect, shadows
- ✅ **Auto-fallback**: Enhanced SVG gradients if API fails

---

## 📊 Image Generation Comparison

| Feature | Placeholder (Free) | Hugging Face (Free) | Imagen 3 (Paid) |
|---------|-------------------|---------------------|-----------------|
| Cost | $0 | $0 | ~$20/month |
| Quality | SVG gradients | Watercolor illustrations | High-quality AI art |
| Speed | Instant | 2-5 sec/image | 3-8 sec/image |
| Setup | None | API key only | Google Cloud billing |
| Best For | Testing | Production (small scale) | High-budget projects |

---

## 🎬 Animation Improvements

### 1. Spring Physics (Characters)
Characters bounce naturally when entering the scene.

```typescript
spring({
  frame: frame - startFrame,
  fps: 30,
  config: { damping: 12, stiffness: 80, mass: 0.8 }
})
```

### 2. Typing Effect (Text)
Narration text appears character-by-character.

```typescript
const textReveal = interpolate(frame, [30, 120], [0, 1]);
const visibleText = narrationText.substring(0, Math.floor(textReveal * narrationText.length));
```

### 3. Drop Shadow (Characters)
```css
filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.3))'
```

### 4. Backdrop Blur (Text Background)
```css
backdropFilter: 'blur(10px)'
```

### 5. Ken Burns Effect (Background)
Smooth background zoom from 1x to 1.12x over the scene duration.

---

## 🔧 Troubleshooting

### Problem 1: Hugging Face API Error
```
Error: 401 Unauthorized
```

**Solution:**
1. Check your API key in `.env`
2. Regenerate token at https://huggingface.co/settings/tokens
3. Make sure key starts with `hf_`

---

### Problem 2: Images Not Generating
```
⚠️ HUGGING_FACE_API_KEY가 설정되지 않았습니다
```

**Solution:**
1. Verify `.env` file exists in project root
2. API key should NOT be `your_huggingface_api_key_here`
3. Restart the script after editing `.env`

---

### Problem 3: Slow Image Generation
```
Timeout after 60 seconds
```

**Solutions:**
- **Increase sleep time**: Edit `GoogleStoryGenerator.ts` line with `sleep(2000)` → `sleep(5000)`
- **Use fewer scenes**: Generate 1-minute video first (`-d 1`)
- **Check HF status**: https://status.huggingface.co

---

### Problem 4: Remotion Rendering Fails
```
Error: Cannot find module './Story/Scene1'
```

**Solution:**
Run `npm run create` first to generate components, then `npm run render`.

---

### Problem 5: Korean Font Rendering Issues
```
텍스트가 네모로 표시됨
```

**Solutions:**
- Install Noto Sans KR font on your system
- Or change to system font in `generateSceneComponent()`:
  ```typescript
  fontFamily: "Arial, sans-serif"  // Instead of 'Noto Sans KR'
  ```

---

## 📁 File Structure

```
make_movie/
├── .env                          # ⚙️ Environment variables (API keys)
├── package.json                  # 📦 Dependencies
├── src/
│   ├── automation/
│   │   ├── GoogleStoryGenerator.ts  # 🧠 Main logic (MODIFIED)
│   │   └── cli.ts                   # 🖥️ CLI entry point
│   ├── Story/                    # 📂 Auto-generated components
│   │   ├── Scene1.tsx
│   │   ├── Scene2.tsx
│   │   └── ...
│   ├── StoryVideo.tsx           # 🎬 Main video composition
│   ├── Root.tsx                 # 🌳 Remotion root
│   └── index.ts                 # 🚀 Entry point
├── public/
│   ├── images/                  # 🖼️ Generated images (PNG/SVG)
│   └── audio/                   # 🎙️ Generated narration (MP3)
└── output/                      # 📤 Rendered videos (MP4)
```

---

## 💰 Cost Breakdown (10-minute video)

| Service | Usage | Cost |
|---------|-------|------|
| Gemini 1.5 Flash | ~50 story scenes | $0.15 |
| HF FLUX.1 Schnell | ~50 images | **$0** (free tier) |
| Google Cloud TTS | ~10 min audio | $0.10 |
| **Total** | | **$0.25** |

**Compare to Imagen 3:** ~$15-20/10-min video

---

## 🎯 Next Steps (Optional Enhancements)

1. **Background Music**: Add royalty-free music tracks
2. **Subtitles**: Display narration as subtitles
3. **Batch Processing**: Generate multiple videos from JSON
4. **Web UI**: Browser-based video generator
5. **Advanced Transitions**: Scene transition effects

---

## 📞 Support

- **Issues**: https://github.com/your-repo/issues
- **Hugging Face Docs**: https://huggingface.co/docs/api-inference
- **Remotion Docs**: https://remotion.dev/docs

---

## ✅ Validation Checklist

After setup, verify:

- [ ] `node -v` shows v18 or higher
- [ ] `.env` file contains valid `HUGGING_FACE_API_KEY`
- [ ] `npm install` completed without errors
- [ ] `npm run create -- -t "Test" -d 1 -a 5` generates files:
  - [ ] `public/images/scene1-background.png` (or .svg)
  - [ ] `public/audio/scene1-narration.mp3`
  - [ ] `src/Story/Scene1.tsx`
  - [ ] `output/Test.mp4`
- [ ] `npm run preview` opens browser at localhost:3000
- [ ] Video plays with:
  - [ ] Real illustrations (not plain colors)
  - [ ] Characters bounce when entering
  - [ ] Text types character-by-character
  - [ ] Audio narration plays

---

**Made with ❤️ using Google AI, Hugging Face, and Remotion**
