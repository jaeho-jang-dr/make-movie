🎬 Google AI 어린이 동영상 자동 생성 시스템
완전 자동화 패키지

📦 이 패키지 내용:
====================

00-설치가이드.md           - 상세 설치 가이드
01-package.json            - npm 설정 파일
02-tsconfig.json          - TypeScript 설정
03-.env.example           - 환경 변수 예시
04-src-index.ts           - Remotion 엔트리
05-src-automation-types.ts            - 타입 정의
06-src-automation-GoogleStoryGenerator.ts  - 핵심 엔진 (400줄)
07-src-automation-cli.ts              - CLI 스크립트 (150줄)
08-stories.json           - 배치 처리 예시
09-빠른시작.md            - 5분 빠른 시작 가이드
10-.gitignore            - Git 제외 파일 목록
완전통합가이드.md         - 모든 내용 통합 가이드
완전마스터가이드.md       - 최종 마스터 문서


🚀 빠른 시작:
====================

1. 이 패키지를 다운로드
2. Google IDX 또는 로컬에서 프로젝트 생성
3. 각 파일을 해당 위치에 복사
4. npm install
5. .env 파일에 API 키 입력
6. npm run create -- -t "테스트" -d 5


📌 가장 중요한 파일:
====================

- 완전마스터가이드.md → 모든 내용이 여기 있습니다!
- 06-src-automation-GoogleStoryGenerator.ts → 핵심 코드
- 07-src-automation-cli.ts → 실행 스크립트


💡 팁:
====================

Claude Code CLI를 사용하면 더 쉽습니다:
1. claude-code 실행
2. "이 패키지의 파일들을 모두 생성해줘" 요청
3. API 키만 입력하면 끝!


📞 도움말:
====================

문제가 있으면:
1. 완전마스터가이드.md의 "문제 해결" 섹션 확인
2. .env 파일의 API 키 재확인
3. gcloud auth 재인증


성공을 기원합니다! 🎉
