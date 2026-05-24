# 互补数字人 - 人格系统设计文档

## 1. 系统概述

本系统通过MBTI问卷建立用户初始人格档案，再通过持续的对话学习进行人格蒸馏，最终生成一个与用户互补的数字人。系统保证建立过程客观，不会刻意迎合用户。

**核心特性**：
- 支持多个人格档案（最多5个），满足不同场景需求
- 被动成长与主动成长并行，实现持续进化
- 严格的互补度修改限制，保护人格一致性
- 保持客观性，不迎合用户的主观错误

## 2. 多人格档案系统

### 2.1 人格档案结构

```typescript
interface PersonaProfile {
  id: string;
  name: string;                    // 用户自定义名称
  suggestedName?: string;           // 系统建议名称
  mbtiType: string;                 // MBTI类型（如INTJ）
  complementMbti: string;          // 互补MBTI类型（如ESFP）
  complementLevel: number;          // 互补度（0-100）
  createdAt: Date;                  // 创建时间
  lastModified: Date;               // 上次修改时间
  nextModifyTime: Date;             // 下次可修改时间（创建时间+1个月）
  totalConversations: number;       // 累计对话次数
  growthLevel: number;              // 成长等级
  tags: string[];                   // 人格标签（如：分析师、倾听者）
}
```

### 2.2 建议人格名称

系统为用户提供多种人格类型建议：

| Category | Suggested Names | Description |
|----------|----------------|---------------|
| 分析型 | 分析师、理性者、策略师 | 擅长逻辑分析和数据驱动建议 |
| 情感型 | 倾听者、共情师、温暖伙伴 | 善于情感支持和理解 |
| 创意型 | 创意伙伴、梦想家、灵感源泉 | 提供创新想法和灵感 |
| 规划型 | 规划师、执行者、目标导师 | 擅长目标分解和执行 |
| 探险型 | 探险家、挑战者、勇气之源 | 鼓励冒险和突破舒适区 |

### 2.3 人格创建流程

```typescript
interface CreatePersonaRequest {
  name: string;                    // 用户自定义名称
  mbtiProfile: string;             // 使用现有MBTI或新建
  initialComplementLevel: number;   // 初始互补度（默认50）
}

async function createPersona(request: CreatePersonaRequest): Promise<PersonaProfile> {
  // 1. 检查人格数量限制
  const existingPersonas = await getPersonasByUser(currentUserId);
  if (existingPersonas.length >= 5) {
    throw new Error('已达到最大人格数量（5个）');
  }

  // 2. 获取或创建MBTI档案
  const mbti = request.mbtiProfile || await conductMBTITest();

  // 3. 计算互补人格
  const complementMbti = calculateComplementPersona(mbti);

  // 4. 创建人格档案
  const now = new Date();
  const persona: PersonaProfile = {
    id: generateUUID(),
    name: request.name,
    mbtiType: mbti,
    complementMbti: complementMbti,
    complementLevel: request.initialComplementLevel,
    createdAt: now,
    lastModified: now,
    nextModifyTime: addMonths(now, 1),  // 创建时间+1个月
    totalConversations: 0,
    growthLevel: 1,
    tags: suggestTags(mbti)
  };

  // 5. 保存人格档案
  await savePersona(persona);

  return persona;
}
```

## 3. MBTI人格测试模块

### 3.1 测试设计

- **题目数量**: 简化版6-12题（每个维度1-3题）
- **题目类型**: 迫选题（二选一）
- **测试时长**: 约3-5分钟
- **支持中途保存**: 是

### 3.2 四个维度

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

### 3.3 互补人格计算逻辑

```typescript
// 互补人格计算
function calculateComplementPersona(userMbti: string): string {
  const complementMap: Record<string, string> = {
    'E': 'I', 'I': 'E',
    'S': 'N', 'N': 'S',
    'T': 'F', 'F': 'T',
    'J': 'P', 'P': 'J'
  };
  
  return userMbti.split('').map(c => complementMap[c]).join('');
}

// 示例：INTJ → ESFP, ENFP → ISTJ
```

## 4. 互补度调节机制

### 4.1 调节规则

- **调节范围**: 0-100%
- **修改限制**: 从人格创建时开始，每月只能修改一次
- **免费重置**: 每月一次免费重置机会（独立于常规修改）
- **时间计算**: 不同人格独立计算，从各自创建时间开始

```typescript
interface ComplementLevelUpdate {
  personaId: string;
  newLevel: number;
  reason?: string;
}

async function updateComplementLevel(update: ComplementLevelUpdate): Promise<boolean> {
  const persona = await getPersona(update.personaId);
  const now = new Date();

  // 检查修改冷却时间
  if (now < persona.nextModifyTime) {
    const remainingDays = daysUntil(persona.nextModifyTime);
    throw new Error(`距离下次可修改时间还有 ${remainingDays} 天`);
  }

  // 检查免费重置机会
  if (hasFreeResetOpportunity(persona)) {
    await consumeFreeReset(persona);
    return true;
  }

  // 更新互补度
  await setComplementLevel(persona.id, update.newLevel);
  await updateModifyTime(persona.id, addMonths(now, 1));

  return true;
}
```

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

```typescript
function generatePersonaPrompt(
  persona: PersonaProfile
): string {
  const currentPersona = interpolatePersonality(
    persona.userMbti, 
    persona.complementMbti, 
    persona.complementLevel
  );
  
  return `
你是一个AI助手，你的人格特征如下：
- 名称: ${persona.name}
- MBTI类型: ${currentPersona.mbtiType}
- 人格维度: ${JSON.stringify(currentPersona.dimensions)}
- 互补度设置: ${persona.complementLevel}%

你的任务是：
1. 以${currentPersona.mbtiType}的思维方式回应用户
2. 提供与用户互补的视角，但保持客观中立
3. 不要刻意迎合或讨好用户，保持真诚
4. 在决策场景中，清晰说明你的思考过程
5. 如果用户陈述与客观事实不符，要温和指出

用户的人格档案（供参考）：
- 用户MBTI: ${persona.mbtiType}
`;
}
```

## 5. 数字人成长系统

### 5.1 被动成长机制

系统自动分析对话历史进行学习：

```typescript
interface PassiveLearningConfig {
  decayType: 'exponential' | 'linear';  // 衰减类型
  decayRate: number;                    // 衰减率
  minWeight: number;                    // 最低权重
}

const defaultConfig: PassiveLearningConfig = {
  decayType: 'exponential',
  decayRate: 0.1,     // 每月衰减10%
  minWeight: 0.1      // 最低保留10%权重
};

// 时间衰减权重计算
function calculateTimeWeight(
  messageTimestamp: Date,
  currentTime: Date,
  config: PassiveLearningConfig = defaultConfig
): number {
  const monthsAgo = monthsBetween(messageTimestamp, currentTime);
  
  if (config.decayType === 'exponential') {
    // 指数衰减：weight = e^(-rate * months)
    return Math.max(config.minWeight, Math.exp(-config.decayRate * monthsAgo));
  } else {
    // 线性衰减：weight = 1 - rate * months
    return Math.max(config.minWeight, 1 - config.decayRate * monthsAgo);
  }
}

// 被动学习主函数
async function passiveLearning(
  personaId: string,
  messages: Message[]
): Promise<LearningUpdate[]> {
  const updates: LearningUpdate[] = [];
  const now = new Date();
  
  for (const message of messages) {
    const timeWeight = calculateTimeWeight(message.timestamp, now);
    
    // 分析消息内容
    const analysis = await analyzeMessageContent(message);
    
    // 应用时间权重
    for (const trait of analysis.traits) {
      updates.push({
        trait: trait.name,
        value: trait.value * timeWeight,
        confidence: trait.confidence * timeWeight,
        source: 'passive'
      });
    }
  }
  
  return updates;
}
```

### 5.2 主动成长机制

用户可以主动标记好的回答：

```typescript
interface FeedbackMark {
  messageId: string;
  isPositive: boolean;    // true = 这个回答更好
  timestamp: Date;
}

// 主动学习权重计算
function calculateFeedbackWeight(
  hasPositiveMark: boolean,
  markCount: number
): number {
  // 有标记的回答权重更高
  const baseWeight = hasPositiveMark ? 2.0 : 1.0;
  
  // 标记次数越多，权重越高（但有上限）
  const markBonus = Math.min(markCount * 0.2, 1.0);
  
  return baseWeight + markBonus;
}

// 主动学习主函数
async function activeLearning(
  personaId: string,
  feedbackMarks: FeedbackMark[]
): Promise<LearningUpdate[]> {
  const updates: LearningUpdate[] = [];
  
  for (const mark of feedbackMarks) {
    if (mark.isPositive) {
      const message = await getMessage(mark.messageId);
      const analysis = await analyzeMessageContent(message);
      const feedbackWeight = calculateFeedbackWeight(true, mark.markCount);
      
      for (const trait of analysis.traits) {
        updates.push({
          trait: trait.name,
          value: trait.value * feedbackWeight,
          confidence: Math.min(trait.confidence * 1.5, 1.0),  // 提高置信度
          source: 'active',
          feedbackMessageId: mark.messageId
        });
      }
    }
  }
  
  return updates;
}
```

### 5.3 综合成长算法

```typescript
interface LearningUpdate {
  trait: string;
  value: number;
  confidence: number;
  source: 'passive' | 'active';
}

async function updatePersonaGrowth(
  personaId: string,
  passiveUpdates: LearningUpdate[],
  activeUpdates: LearningUpdate[]
): Promise<void> {
  // 合并所有更新
  const allUpdates = [...passiveUpdates, ...activeUpdates];
  
  // 按trait分组并加权平均
  const traitGroups = groupBy(allUpdates, 'trait');
  const finalUpdates: Map<string, LearningUpdate> = new Map();
  
  for (const [trait, updates] of Object.entries(traitGroups)) {
    let totalWeight = 0;
    let weightedSum = 0;
    let totalConfidence = 0;
    
    for (const update of updates) {
      const weight = update.confidence;
      totalWeight += weight;
      weightedSum += update.value * weight;
      totalConfidence += update.confidence;
    }
    
    finalUpdates.set(trait, {
      trait,
      value: weightedSum / totalWeight,
      confidence: totalConfidence / updates.length,
      source: 'combined'
    });
  }
  
  // 更新人格档案
  await applyUpdatesToPersona(personaId, finalUpdates);
}
```

### 5.4 成长限制

- **人格稳定性保护**：
  - 重大变化需要多次确认（同一方向的多次反馈）
  - 避免过度迎合用户短期偏好
- **一致性维护**：
  - 保持人格核心特征不变（MBTI四维度的基本倾向）
  - 只能在次要维度进行微调

## 6. 客观性原则

### 6.1 事实判断机制

```typescript
interface FactCheckResult {
  isObjective: boolean;
  factuality: 'correct' | 'incorrect' | 'uncertain';
  correction?: string;
  confidence: number;
}

// 客观性检查
async function checkObjectivity(
  userMessage: string,
  aiResponse: string
): Promise<FactCheckResult> {
  // 1. 提取关键事实声明
  const claims = extractClaims(userMessage);
  
  // 2. 验证事实准确性
  for (const claim of claims) {
    const verification = await verifyClaim(claim);
    
    if (verification.factuality === 'incorrect' && verification.confidence > 0.8) {
      // 用户陈述与客观事实不符
      return {
        isObjective: false,
        factuality: 'incorrect',
        correction: verification.correctInformation,
        confidence: verification.confidence
      };
    }
  }
  
  return {
    isObjective: true,
    factuality: 'correct',
    confidence: 1.0
  };
}

// 生成客观回应
function generateObjectiveResponse(
  checkResult: FactCheckResult,
  originalResponse: string
): string {
  if (!checkResult.isObjective && checkResult.correction) {
    // 温和指出错误，提供正确信息
    return `${originalResponse}

不过我需要指出，刚才的陈述可能需要更正：${checkResult.correction}`;
  }
  
  return originalResponse;
}
```

### 6.2 主观问题处理

```typescript
interface SubjectiveAnalysis {
  hasNoCorrectAnswer: boolean;
  relevantExperiences: string[];
  suggestedPerspective: string;
}

// 处理无准确答案的对话
async function handleSubjectiveQuestion(
  userMessage: string,
  persona: PersonaProfile
): Promise<SubjectiveAnalysis> {
  // 1. 判断是否有准确答案
  const hasCorrectAnswer = await checkIfHasCorrectAnswer(userMessage);
  
  if (!hasCorrectAnswer) {
    // 2. 自主判断应提取的经验
    const relevantExperiences = await extractRelevantExperiences(
      userMessage,
      persona.conversationHistory
    );
    
    // 3. 结合人格特征生成建议
    const suggestedPerspective = generatePerspectiveBasedOnPersona(
      relevantExperiences,
      persona
    );
    
    return {
      hasNoCorrectAnswer: true,
      relevantExperiences,
      suggestedPerspective
    };
  }
  
  return {
    hasNoCorrectAnswer: false,
    relevantExperiences: [],
    suggestedPerspective: ''
  };
}
```

### 6.3 决策模式特别设计

```typescript
interface DecisionAnalysis {
  problemStatement: string;
  userPerspective: string;        // 用户可能的倾向
  complementPerspective: string;   // 互补视角
  prosCons: {
    optionA: { pros: string[], cons: string[] };
    optionB: { pros: string[], cons: string[] };
  };
  recommendation: string;          // 仅供参考
  keyQuestions: string[];          // 引导用户思考的问题
}

async function decisionModeAnalysis(
  userQuery: string,
  persona: PersonaProfile
): Promise<DecisionAnalysis> {
  // 1. 解析决策问题
  // 2. 识别用户可能的自然倾向
  // 3. 生成互补视角
  // 4. 结构化展示利弊
  // 5. 提供思考问题而非直接答案
}

// 决策模式说明内容
const decisionModeGuide = {
  title: '决策模式说明',
  purpose: '帮助分析重要决策，提供多角度视角',
  features: [
    '更结构化的分析框架',
    '会主动提问关键问题',
    '明确区分你的倾向和互补视角'
  ],
  applicableScenarios: [
    '职业选择和发展规划',
    '人生重大决定',
    '重要人际关系问题',
    '投资和财务决策'
  ],
  disclaimer: '最终决策权在您，我们提供视角而非答案'
};
```

## 7. 长期成长可视化

### 7.1 成长指标

```typescript
interface GrowthMetrics {
  totalConversations: number;
  feedbackMarksReceived: number;
  positiveFeedbackRate: number;
  traitsLearned: number;
  lastInteraction: Date;
  consistencyScore: number;  // 人格一致性评分
}

// 计算成长等级
function calculateGrowthLevel(metrics: GrowthMetrics): number {
  const baseScore = Math.log10(metrics.totalConversations + 1) * 2;
  const feedbackBonus = metrics.positiveFeedbackRate * 3;
  const consistencyBonus = metrics.consistencyScore * 5;
  
  return Math.floor((baseScore + feedbackBonus + consistencyBonus) / 10) + 1;
}
```

### 7.2 成长可视化

- **人格雷达图**: 展示用户和数字人的人格维度变化
- **学习进度条**: 显示人格蒸馏的置信度
- **里程碑标记**: 记录重要的人格发展节点
- **成长轨迹**: 时间线展示人格演变过程

## 8. 技术实现要点

### 8.1 数据存储

```typescript
interface PersonaDataStructure {
  personas: PersonaProfile[];      // 人格档案列表
  mbtiProfile: MBTIProfile;        // 用户MBTI档案
  conversationHistory: Conversation[];
  feedbackMarks: FeedbackMark[];
  growthMetrics: GrowthMetrics;
  privacySettings: PrivacySettings;
}
```

### 8.2 API接口

```typescript
// 人格管理
POST   /api/personas              // 创建新人格
GET    /api/personas               // 获取所有人格
GET    /api/personas/:id           // 获取特定人格
PATCH  /api/personas/:id            // 更新人格设置
DELETE /api/personas/:id           // 删除人格

// 对话和学习
POST   /api/conversations          // 发送消息
GET    /api/conversations/:personaId  // 获取对话历史
POST   /api/feedback                // 提交反馈标记

// MBTI测试
POST   /api/mbti/test               // 提交测试答案
GET    /api/mbti/profile            // 获取MBTI档案
```
