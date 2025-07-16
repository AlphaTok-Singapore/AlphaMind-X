export const modelList = [
  'qwen2.5vl:7b',
  'llama3.2-vision:latest',
  'deepseek-r1:8b',
  'qwen3:8b',
  'gemma3:4b',
  'phi4:latest',
]

export const defaultSeoPrompt = `你是一个网页内容分析助手，请根据以下 HTML 提取：
1. 网页主题（Topic）一句话
2. 关键词（不超过5个）
3. Hashtags（格式如 #AI #自动化，最多10个）

请严格以以下 JSON 格式返回：
{
  "Topic": "...",
  "Keywords": ["...", "..."],
  "Hashtags": ["#...", "#..."]
}

网页内容如下：
{content}`

export const defaultPostPrompt = `请根据以下主题和关键词，写一篇适合社交媒体发布的文案。要求：

1. 开头要有吸引人的标题或开场白
2. 正文分2-3个段落，每段之间空行分隔
3. 内容要有实用价值和见解
4. 结尾要有鼓励互动的呼吁
5. 在文案末尾单独一行添加相关hashtags

主题: {topic}
关键词: {keywords}
建议hashtags: {hashtags}

请按以下格式输出社交媒体文案（不要包含"标题:"、"钩子:"、"CTA:"等标签）：

[吸引人的开场/标题]

[第一段内容 - 引入话题]

[第二段内容 - 核心观点或价值]

[第三段内容 - 互动呼吁]

[hashtags]`
