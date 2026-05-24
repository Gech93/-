
# 互补数字人 - 人格系统设计文档

## 1. 系统概述

本系统通过MBTI问卷建立用户初始人格档案，再通过持续的对话学习进行人格蒸馏，最终生成一个与用户互补的数字人。系统保证建立过程客观，不会刻意迎合用户。

## 2. MBTI人格测试模块

### 2.1 测试设计
- **题目数量**: 60题（每个维度15题）
- **题目类型**: 迫选题（二选一）
- **测试时长**: 约10-15分钟
- **支持中途保存**: 是

### 2.2 四个维度
| 维度 | 倾向 | 描述 |
|------|------|------|
| 能量来源 | E (外向) | 从与他人互动中获得能量 |
| | I (内向) | 从独处中获得能量 |
| 信息获取 | S (实感) | 关注具体事实和细节 |
| | N (直觉) | 关注模式和可能性 |
| 决策方式 | T (思考) | 基于逻辑和分析做决定 |
| | F (情感) | 基于价值观和他人感受做决定 |
| 生活方式 | J (判断) | 有条理、喜欢计划 |
| | P (感知) | 灵活、适应变化 |

### 2.3 互补人格计算逻辑
```typescript
// 互补人格计算
function calculateComplementPersona(userMbti: string): string {
  const complementMap: Record&lt;string, string&gt; = {
    'E': 'I', 'I': 'E',
    'S': 'N', 'N': 'S',
    'T': 'F', 'F': 'T',
    'J': 'P', 'P': 'J'
  };
  
  return userMbti.split('').map(c =&gt; complementMap[c]).join('');
}

// 示例：INTJ → ESFP
```

## 3. 人格蒸馏系统

### 3.1 学习维度
除了MBTI，系统还会从对话中学习以下维度：
- **语言风格**: 正式/随意、简洁/详细、情绪化/理性
- **价值观**: 优先级排序（家庭、事业、自由、稳定等）
- **决策模式**: 快速/慎重、直觉/分析、个人/集体
- **兴趣领域**: 自动识别用户关注的话题
- **沟通习惯**: 回应速度、提问频率、倾听模式

### 3.2 蒸馏算法
```typescript
interface PersonalityUpdate {
  trait: string;
  value: number;  // 0-100
  confidence: number;  // 学习置信度
}

// 人格蒸馏主函数
async function distillPersonality(
  userId: string,
  newMessages: Message[]
): Promise&lt;PersonalityUpdate[]&gt; {
  const updates: PersonalityUpdate[] = [];
  
  // 1. 分析语言风格
  const styleAnalysis = await analyzeLanguageStyle(newMessages);
  updates.push(...styleAnalysis);
  
  // 2. 识别价值观表达
  const valueSignals = await detectValues(newMessages);
  updates.push(...valueSignals);
  
  // 3. 观察决策模式
  const decisionPatterns = await analyzeDecisionMaking(newMessages);
  updates.push(...decisionPatterns);
  
  // 4. 更新用户人格档案（带权重衰减）
  await updatePersonaProfile(userId, updates);
  
  return updates;
}
```

### 3.3 学习速率控制
- **初期**: 快速学习，每次对话更新权重较高（0.3）
- **中期**: 平稳学习，更新权重中等（0.15）
- **后期**: 缓慢微调，更新权重较低（0.05）
- **遗忘机制**: 90天前的数据权重自动衰减50%

## 4. 互补度调节机制

### 4.1 调节范围
- **0%**: 完全像用户（镜像模式）
- **50%**: 适度互补（默认）
- **100%**: 完全相反（极端互补）

### 4.2 插值算法
```typescript
// 人格插值计算
function interpolatePersonality(
  userPersona: Persona,
  complementPersona: Persona,
  complementLevel: number  // 0-100
): Persona {
  const t = complementLevel / 100;
  const result: Persona = {} as Persona;
  
  // 对每个维度进行线性插值
  for (const trait in userPersona) {
    result[trait] = userPersona[trait] * (1 - t) + complementPersona[trait] * t;
  }
  
  return result;
}
```

### 4.3 提示词生成策略
根据互补度动态生成提示词：

```typescript
function generatePersonaPrompt(
  userPersona: PersonaProfile,
  complementLevel: number
): string {
  const complementPersona = calculateComplementPersona(userPersona);
  const currentPersona = interpolatePersonality(userPersona, complementPersona, complementLevel);
  
  return `
你是一个AI助手，你的人格特征如下：
- MBTI类型: ${currentPersona.mbtiType}
- 人格维度: ${JSON.stringify(currentPersona.dimensions)}
- 互补度设置: ${complementLevel}%

你的任务是：
1. 以${currentPersona.mbtiType}的思维方式回应用户
2. 提供与用户互补的视角，但保持客观中立
3. 不要刻意迎合或讨好用户，保持真诚
4. 在决策场景中，清晰说明你的思考过程

用户的人格档案（供参考，不要直接提及）：
- 用户MBTI: ${userPersona.mbtiType}
- 用户特质: ${JSON.stringify(userPersona.additionalTraits)}
`;
}
```

## 5. 决策模式特别设计

### 5.1 决策分析框架
当用户需要决策参考时，系统启动结构化分析：

```typescript
interface DecisionAnalysis {
  problemStatement: string;
  userPerspective: string;      // 用户可能的倾向
  complementPerspective: string; // 互补视角
  prosCons: {
    optionA: { pros: string[], cons: string[] };
    optionB: { pros: string[], cons: string[] };
  };
  recommendation: string;       // 仅供参考
  keyQuestions: string[];       // 引导用户思考的问题
}

async function decisionModeAnalysis(
  userQuery: string,
  userPersona: PersonaProfile,
  complementLevel: number
): Promise&lt;DecisionAnalysis&gt; {
  // 1. 解析决策问题
  // 2. 识别用户可能的自然倾向
  // 3. 生成互补视角
  // 4. 结构化展示利弊
  // 5. 提供思考问题而非直接答案
}
```

### 5.2 客观性保证机制
- **避免引导性语言**: 不用"你应该..."，而是"从另一个角度看..."
- **明确标注视角**: 区分"你的倾向"和"互补视角"
- **提供思考框架**: 苏格拉底式提问，而非给出答案
- **记录历史一致性**: 确保数字人观点在相似情境下保持一致

## 6. 长期成长机制

### 6.1 成长可视化
- **人格雷达图**: 展示用户和数字人的人格维度变化
- **学习进度条**: 显示人格蒸馏的置信度
- **里程碑标记**: 记录重要的人格发展节点

### 6.2 自适应调整
- **情境感知**: 在不同场景下微调互补度（如职业规划vs情感支持）
- **反馈循环**: 用户可对回复评分，系统据此优化
- **周期性重校准**: 每3个月可重新进行MBTI测试，更新基线
