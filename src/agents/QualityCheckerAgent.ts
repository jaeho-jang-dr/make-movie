/**
 * QualityCheckerAgent - 품질 검증 담당 (Claude)
 */

import { BaseAgent, AgentContext, AgentResult } from './BaseAgent';
import { ClaudeProvider } from '../providers/claude';
import { StoryOutput } from './StoryWriterAgent';

export interface QAInput {
  type: 'story' | 'video' | 'audio' | 'final';
  content: unknown;
  criteria?: string[];
}

export interface QAIssue {
  id: string;
  severity: 'critical' | 'major' | 'minor' | 'suggestion';
  category: string;
  description: string;
  location?: string;
  suggestion: string;
}

export interface QAOutput {
  passed: boolean;
  score: number;
  issues: QAIssue[];
  summary: string;
  recommendations: string[];
}

export class QualityCheckerAgent extends BaseAgent {
  constructor() {
    // Claude Provider는 API 키가 있을 때만 생성
    let claudeProvider: ClaudeProvider | undefined;
    try {
      if (process.env.ANTHROPIC_API_KEY) {
        claudeProvider = new ClaudeProvider({ model: 'claude-sonnet-4-20250514' });
      }
    } catch (e) {
      // Claude not available
    }

    super({
      name: 'QualityChecker',
      role: 'story_reviewer',
      capabilities: {
        taskTypes: ['story:review', 'export:preview'],
        provider: 'claude',
        skills: ['check_quality', 'detect_issues', 'generate_report'],
        maxConcurrent: 1,
      },
      provider: claudeProvider,
      systemPrompt: QA_CHECKER_PROMPT,
    });
  }

  async execute(context: AgentContext): Promise<AgentResult> {
    this.assignTask(context.taskId);

    try {
      const input = context.input as QAInput;
      const report = await this.checkQuality(input);

      this.releaseTask();
      return { success: true, output: report };
    } catch (error) {
      this.releaseTask();
      return { success: false, error: String(error) };
    }
  }

  private async checkQuality(input: QAInput): Promise<QAOutput> {
    const prompt = this.buildQAPrompt(input);
    const response = await this.chat(prompt);
    return this.parseQAResponse(response.content);
  }

  private buildQAPrompt(input: QAInput): string {
    let prompt = `다음 ${input.type} 콘텐츠의 품질을 검사해주세요.\n\n`;

    switch (input.type) {
      case 'story':
        const story = input.content as StoryOutput;
        prompt += `스토리 제목: ${story.title}\n`;
        prompt += `씬 수: ${story.scenes?.length || 0}\n`;
        prompt += `내용:\n${JSON.stringify(story, null, 2)}\n`;
        break;

      case 'video':
        prompt += `비디오 정보:\n${JSON.stringify(input.content, null, 2)}\n`;
        break;

      case 'audio':
        prompt += `오디오 정보:\n${JSON.stringify(input.content, null, 2)}\n`;
        break;

      case 'final':
        prompt += `최종 프로젝트:\n${JSON.stringify(input.content, null, 2)}\n`;
        break;
    }

    if (input.criteria?.length) {
      prompt += `\n특별 검사 기준:\n${input.criteria.map(c => `- ${c}`).join('\n')}\n`;
    }

    prompt += `\n출력 형식 (JSON):
{
  "passed": true/false,
  "score": 0-100,
  "issues": [
    {
      "id": "issue-1",
      "severity": "critical|major|minor|suggestion",
      "category": "카테고리",
      "description": "설명",
      "location": "위치 (선택)",
      "suggestion": "개선 제안"
    }
  ],
  "summary": "전체 요약",
  "recommendations": ["권장사항1", "권장사항2"]
}`;

    return prompt;
  }

  private parseQAResponse(content: string): QAOutput {
    try {
      const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/) ||
                       content.match(/\{[\s\S]*"passed"[\s\S]*\}/);
      const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : content;
      return JSON.parse(jsonStr);
    } catch {
      return {
        passed: false,
        score: 0,
        issues: [{ id: 'parse-error', severity: 'critical', category: 'system', description: 'QA 응답 파싱 실패', suggestion: '다시 시도' }],
        summary: 'QA 검사 실패',
        recommendations: [],
      };
    }
  }
}

const QA_CHECKER_PROMPT = `당신은 애니메이션 프로젝트 품질 검증 전문가입니다.

역할:
- 콘텐츠 품질 종합 평가
- 문제점 발견 및 분류
- 구체적인 개선 방안 제시

평가 기준:
1. 기술적 품질: 해상도, 프레임레이트, 오디오 품질
2. 콘텐츠 품질: 스토리 일관성, 캐릭터 일관성
3. 사용자 경험: 몰입도, 흐름, 완성도

심각도 분류:
- critical: 출시 불가, 즉시 수정 필요
- major: 사용자 경험에 영향, 수정 권장
- minor: 개선하면 좋음
- suggestion: 향후 고려사항

점수 기준:
- 90+: 출시 가능
- 80-89: 경미한 수정 후 출시
- 70-79: 주요 수정 필요
- 70 미만: 상당한 재작업 필요`;
