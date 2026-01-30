/**
 * StoryReviewerAgent - 스토리 검증 및 보충 담당 (Claude)
 */

import { BaseAgent, AgentContext, AgentResult } from './BaseAgent';
import { ClaudeProvider } from '../providers/claude';
import { AIProviderConfig } from '../providers/types';
import { StoryOutput, Scene } from './StoryWriterAgent';

export interface ReviewInput {
  story: StoryOutput;
  focusAreas?: ('plot' | 'character' | 'emotion' | 'pacing' | 'dialogue')[];
  strictness?: 'lenient' | 'normal' | 'strict';
}

export interface ReviewIssue {
  sceneId: number;
  type: 'logic' | 'character' | 'emotion' | 'pacing' | 'dialogue' | 'visual';
  severity: 'minor' | 'major' | 'critical';
  description: string;
  suggestion: string;
}

export interface ReviewOutput {
  overallScore: number;
  approved: boolean;
  analysis: {
    plotCoherence: { score: number; notes: string };
    characterConsistency: { score: number; notes: string };
    emotionalFlow: { score: number; notes: string };
    pacing: { score: number; notes: string };
    visualClarity: { score: number; notes: string };
  };
  issues: ReviewIssue[];
  improvements: Array<{ sceneId: number; suggestion: string }>;
  summary: string;
}

export class StoryReviewerAgent extends BaseAgent {
  private strictnessThreshold = {
    lenient: 60,
    normal: 75,
    strict: 85,
  };

  constructor(providerConfig?: Partial<AIProviderConfig>) {
    // Claude Provider는 API 키가 있을 때만 생성
    let claudeProvider: ClaudeProvider | undefined;
    try {
      if (process.env.ANTHROPIC_API_KEY) {
        claudeProvider = new ClaudeProvider({
          model: providerConfig?.model || 'claude-sonnet-4-20250514',
          ...providerConfig,
        });
      }
    } catch (e) {
      // Claude not available
    }

    super({
      name: 'StoryReviewer',
      role: 'story_reviewer',
      capabilities: {
        taskTypes: ['story:review'],
        provider: 'claude',
        skills: ['review_story', 'suggest_improvements', 'validate_continuity'],
        maxConcurrent: 1,
      },
      provider: claudeProvider,
      systemPrompt: STORY_REVIEWER_SYSTEM_PROMPT,
    });

    this.initSkills();
  }

  private initSkills(): void {
    this.registerSkill('review_story', this.reviewStory.bind(this) as (...args: unknown[]) => Promise<unknown>);
    this.registerSkill('suggest_improvements', this.suggestImprovements.bind(this) as (...args: unknown[]) => Promise<unknown>);
    this.registerSkill('validate_continuity', this.validateContinuity.bind(this) as (...args: unknown[]) => Promise<unknown>);
  }

  async execute(context: AgentContext): Promise<AgentResult> {
    this.assignTask(context.taskId);

    try {
      const input = context.input as ReviewInput;
      const review = await this.reviewStory(input);

      this.releaseTask();
      return {
        success: true,
        output: review,
        metadata: {
          score: review.overallScore,
          approved: review.approved,
          issueCount: review.issues.length,
        },
      };
    } catch (error) {
      this.releaseTask();
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * 스토리 검토
   */
  private async reviewStory(input: ReviewInput): Promise<ReviewOutput> {
    const { story, focusAreas, strictness = 'normal' } = input;

    const prompt = this.buildReviewPrompt(story, focusAreas);
    const response = await this.chat(prompt);

    const review = this.parseReviewResponse(response.content);

    // 승인 여부 결정
    review.approved = review.overallScore >= this.strictnessThreshold[strictness];

    this.log('info', `Review complete: ${review.overallScore}/100 (${review.approved ? 'APPROVED' : 'NEEDS REVISION'})`);

    return review;
  }

  /**
   * 개선 제안
   */
  private async suggestImprovements(story: StoryOutput, issues: ReviewIssue[]): Promise<Scene[]> {
    const criticalIssues = issues.filter(i => i.severity === 'critical' || i.severity === 'major');

    if (criticalIssues.length === 0) {
      return story.scenes;
    }

    const prompt = `다음 스토리의 문제점을 수정한 개선된 씬들을 제공해주세요.

원본 스토리:
${JSON.stringify(story, null, 2)}

수정이 필요한 문제점:
${JSON.stringify(criticalIssues, null, 2)}

수정된 씬들만 JSON 배열로 출력하세요.`;

    const response = await this.chat(prompt);
    return this.parseScenesResponse(response.content);
  }

  /**
   * 연속성 검증
   */
  private async validateContinuity(scenes: Scene[]): Promise<ReviewIssue[]> {
    const prompt = `다음 씬들의 연속성을 검증해주세요.

씬 목록:
${JSON.stringify(scenes, null, 2)}

검토 항목:
1. 시간 순서의 논리성
2. 캐릭터 위치/상태의 일관성
3. 감정 변화의 자연스러움
4. 대화 맥락의 연결성

발견된 연속성 문제만 JSON 배열로 출력하세요.`;

    const response = await this.chat(prompt);
    return this.parseIssuesResponse(response.content);
  }

  private buildReviewPrompt(story: StoryOutput, focusAreas?: string[]): string {
    let prompt = `다음 애니메이션 스토리를 상세히 검토해주세요.

스토리:
${JSON.stringify(story, null, 2)}

`;

    if (focusAreas?.length) {
      prompt += `특히 다음 영역에 집중해주세요: ${focusAreas.join(', ')}\n\n`;
    }

    prompt += `출력 형식 (JSON):
{
  "overallScore": 0-100,
  "approved": true/false,
  "analysis": {
    "plotCoherence": { "score": 0-100, "notes": "분석 내용" },
    "characterConsistency": { "score": 0-100, "notes": "분석 내용" },
    "emotionalFlow": { "score": 0-100, "notes": "분석 내용" },
    "pacing": { "score": 0-100, "notes": "분석 내용" },
    "visualClarity": { "score": 0-100, "notes": "분석 내용" }
  },
  "issues": [
    {
      "sceneId": 1,
      "type": "logic|character|emotion|pacing|dialogue|visual",
      "severity": "minor|major|critical",
      "description": "문제 설명",
      "suggestion": "개선 제안"
    }
  ],
  "improvements": [
    { "sceneId": 1, "suggestion": "개선 제안" }
  ],
  "summary": "전체 요약"
}`;

    return prompt;
  }

  private parseReviewResponse(content: string): ReviewOutput {
    try {
      const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/) ||
                       content.match(/\{[\s\S]*"overallScore"[\s\S]*\}/);
      const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : content;
      return JSON.parse(jsonStr);
    } catch (error) {
      this.log('error', `Failed to parse review: ${error}`);
      throw new Error('리뷰 파싱 실패');
    }
  }

  private parseScenesResponse(content: string): Scene[] {
    try {
      const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/) ||
                       content.match(/\[[\s\S]*\]/);
      const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : content;
      return JSON.parse(jsonStr);
    } catch {
      return [];
    }
  }

  private parseIssuesResponse(content: string): ReviewIssue[] {
    try {
      const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/) ||
                       content.match(/\[[\s\S]*\]/);
      const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : content;
      return JSON.parse(jsonStr);
    } catch {
      return [];
    }
  }
}

const STORY_REVIEWER_SYSTEM_PROMPT = `당신은 애니메이션 스토리 검증 전문가입니다.

핵심 역할:
- 스토리의 논리적 일관성 검토
- 캐릭터 동기와 행동의 설득력 평가
- 감정선 흐름과 완급 조절 분석
- 시각화 가능성 검토
- 구체적이고 실행 가능한 개선안 제시

평가 기준:
1. 플롯 일관성 (Plot Coherence): 논리적 흐름, 복선 처리, 결말의 타당성
2. 캐릭터 일관성 (Character Consistency): 성격 유지, 동기 명확성, 성장 아크
3. 감정 흐름 (Emotional Flow): 감정 전달력, 공감대 형성, 카타르시스
4. 페이싱 (Pacing): 긴장과 이완, 씬 길이 배분, 전개 속도
5. 시각적 명확성 (Visual Clarity): visualPrompt의 구체성과 실현 가능성

점수 기준:
- 90-100: 출판/방영 수준
- 80-89: 약간의 수정으로 완성 가능
- 70-79: 주요 수정 필요
- 60-69: 상당한 재작업 필요
- 60 미만: 전면 재작성 권장

출력은 항상 유효한 JSON 형식으로 제공하세요.`;
