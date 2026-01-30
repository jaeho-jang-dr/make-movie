// 씬별 캐릭터와 소품 매핑
export interface SceneMapping {
    sceneNumber: number;
    narration: string;
    characters: {
        name: string;
        pose: string;
        props?: {
            propName: string;
            position: 'left-hand' | 'right-hand' | 'both-hands';
        }[];
    }[];
    backgroundProps?: string[]; // 배경 소품들
    duration: number; // 프레임 수
}

export function getSceneMappings(): SceneMapping[] {
    return [
        {
            sceneNumber: 1,
            duration: 405, // 13.5초 (오디오 여유 1.5초 추가)
            narration: '민수는 작은 마을에서 늘 혼자 놀곤 했어요. 친구가 없어서 외로웠지만, 누군가와 함께하는 게 무서웠죠. 어느 날, 민수는 뒷산에서 이상한 소리를 들었어요.',
            characters: [
                {
                    name: '민수',
                    pose: '민수_앞모습_서있기',
                    props: [
                        { propName: '빨간_야구모자', position: 'right-hand' },
                        { propName: '작은_배낭', position: 'left-hand' }
                    ]
                }
            ],
            backgroundProps: ['마을_집들', '높은_나무들']
        },
        {
            sceneNumber: 2,
            duration: 435, // 14.5초
            narration: '소리를 따라가던 민수는 덤불 속에서 지영이를 만났어요. 지영이는 \'내 보물 지도를 훔친 도둑을 잡아야 해!\'라며 민수를 끌어당겼죠. 민수는 망설였지만, 지영의 눈빛이 너무 강렬했어요.',
            characters: [
                {
                    name: '민수',
                    pose: '민수_삼사분면_겁먹음'
                },
                {
                    name: '지영',
                    pose: '지영_앞모습_서있기',
                    props: [
                        { propName: '보물_지도', position: 'both-hands' },
                        { propName: '초록_운동화', position: 'right-hand' }
                    ]
                }
            ],
            backgroundProps: ['숲_길']
        },
        {
            sceneNumber: 3,
            duration: 405, // 13.5초
            narration: '두 아이는 숲 속 깊은 곳으로 들어갔어요. 갑자기 깜깜이라는 검은 고양이가 나타나더니, \'나를 따라오면 보물을 찾을 수 있어. 하지만 용기가 필요해!\'라고 말했어요.',
            characters: [
                {
                    name: '민수',
                    pose: '민수_삼사분면_놀람'
                },
                {
                    name: '지영',
                    pose: '지영_삼사분면_놀람'
                },
                {
                    name: '깜깜이',
                    pose: '깜깜이_앞모습_말하기'
                }
            ],
            backgroundProps: ['어두운_형체']
        },
        {
            sceneNumber: 4,
            duration: 405, // 13.5초
            narration: '깜깜이는 아이들을 깊은 동굴로 안내했어요. 민수는 어둠이 무서워 떨었지만, 지영이는 \'걱정 마! 내가 랩스타처럼 빛나는 플래시를 켤게!\'라며 장난스럽게 웃었죠.',
            characters: [
                {
                    name: '민수',
                    pose: '민수_앞모습_겁먹음'
                },
                {
                    name: '지영',
                    pose: '지영_삼사분면_손전등_들기',
                    props: [{ propName: '손전등', position: 'right-hand' }]
                },
                {
                    name: '깜깜이',
                    pose: '깜깜이_옆모습_걷기'
                }
            ]
        },
        {
            sceneNumber: 5,
            duration: 375, // 12.5초
            narration: '동굴 안에서 거대한 거미줄이 길을 막고 있었어요. 민수는 도망치고 싶었지만, 지영이가 \'함께 힘을 합치면 뚫을 수 있어!\'라고 용기를 북돋아줬어요.',
            characters: [
                {
                    name: '민수',
                    pose: '민수_옆모습_구부리기'
                },
                {
                    name: '지영',
                    pose: '지영_옆모습_가리키기'
                },
                {
                    name: '깜깜이',
                    pose: '깜깜이_옆모습_숨기'
                }
            ],
            backgroundProps: ['거대한_거미줄']
        },
        {
            sceneNumber: 6,
            duration: 405, // 13.5초
            narration: '아이들은 거미줄을 뚫고 나왔지만, 갑자기 바닥이 흔들리며 함정이 발동했어요! 지영이가 민수의 손을 잡고 \'점프!\'라고 외쳤고, 둘은 가까스로 함정을 피했죠.',
            characters: [
                {
                    name: '민수',
                    pose: '민수_뒷모습_달리기'
                },
                {
                    name: '지영',
                    pose: '지영_뒷모습_달리기'
                },
                {
                    name: '깜깜이',
                    pose: '깜깜이_뒷모습_점프'
                }
            ],
            backgroundProps: ['가시_함정', '떨어지는_바위들']
        },
        {
            sceneNumber: 7,
            duration: 405, // 13.5초
            narration: '드디어 보물 상자를 발견했지만, 상자는 자물쇠로 잠겨 있었어요. 깜깜이가 말했죠. \'자물쇠를 열 열쇠는 네 마음 속 용기야.\' 민수는 눈을 감고 용기를 내어 손을 뻗었어요.',
            characters: [
                {
                    name: '민수',
                    pose: '민수_삼사분면_지시하기'
                },
                {
                    name: '지영',
                    pose: '지영_옆모습_구부리기'
                },
                {
                    name: '깜깜이',
                    pose: '깜깜이_앞모습_말하기'
                }
            ],
            backgroundProps: ['보물_상자', '도구_와_기어']
        },
        {
            sceneNumber: 8,
            duration: 465, // 15.5초
            narration: '상자가 열리자, 안에는 반짝이는 보석이 아니라 낡은 편지 한 통이 들어 있었어요. 편지에는 \'진정한 보물은 우정과 용기\'라고 적혀 있었죠.',
            characters: [
                {
                    name: '민수',
                    pose: '민수_앞모습_넘어지기'
                },
                {
                    name: '지영',
                    pose: '지영_앞모습_장난기'
                },
                {
                    name: '깜깜이',
                    pose: '깜깜이_앞모습_미소'
                }
            ],
            backgroundProps: ['낡은_편지']
        },
        {
            sceneNumber: 9,
            duration: 375, // 12.5초
            narration: '동굴을 빠져나오며 민수는 더 이상 혼자가 아니라는 걸 느꼈어요. 지영이와 함께라면 어떤 무서운 것도 이겨낼 수 있을 것 같았죠. 깜깜이는 미소를 지으며 사라졌어요.',
            characters: [
                {
                    name: '민수',
                    pose: '민수_옆모습_걷기'
                },
                {
                    name: '지영',
                    pose: '지영_옆모습_걷기'
                },
                {
                    name: '깜깜이',
                    pose: '깜깜이_앞모습_사라짐'
                }
            ]
        },
        {
            sceneNumber: 10,
            duration: 375, // 12.5초
            narration: '마을로 돌아온 민수와 지영이는 매일 함께 모험을 꿈꿨어요. 민수는 이제 용기를 내어 새로운 친구들도 사귀기 시작했답니다. 진정한 보물은 바로 곁에 있었어요.',
            characters: [
                {
                    name: '민수',
                    pose: '민수_옆모습_행복'
                },
                {
                    name: '지영',
                    pose: '지영_앞모습_웃음'
                }
            ]
        }
    ];
}
