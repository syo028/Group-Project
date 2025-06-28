import * as tf from '@tensorflow/tfjs'

// 情感分析結果類型
export interface SentimentResult {
  sentiment: 'positive' | 'negative' | 'neutral'
  confidence: number
  scores: {
    positive: number
    negative: number
    neutral: number
  }
}

// 簡單的中文情感分析模型（基於關鍵詞）
class SimpleChineseSentimentAnalyzer {
  private positiveWords: Set<string>
  private negativeWords: Set<string>
  private intensifiers: Set<string>

  constructor() {
    // 正面詞彙
    this.positiveWords = new Set([
      '好',
      '棒',
      '讚',
      '優秀',
      '完美',
      '喜歡',
      '愛',
      '開心',
      '快樂',
      '高興',
      '滿意',
      '推薦',
      '支持',
      '感謝',
      '謝謝',
      '很棒',
      '非常好',
      '太棒了',
      '厲害',
      '強大',
      '精彩',
      '出色',
      '優秀',
      '美好',
      '溫暖',
      '友善',
      '有趣',
      '好玩',
      '刺激',
      '興奮',
      '激動',
      '感動',
      '溫馨',
      '可愛',
    ])

    // 負面詞彙
    this.negativeWords = new Set([
      '壞',
      '糟',
      '爛',
      '差',
      '討厭',
      '恨',
      '生氣',
      '憤怒',
      '傷心',
      '難過',
      '失望',
      '不滿',
      '討厭',
      '噁心',
      '可怕',
      '恐怖',
      '糟糕',
      '太差了',
      '無聊',
      '煩人',
      '討厭',
      '厭惡',
      '憎恨',
      '憤怒',
      '暴躁',
      '痛苦',
      '悲傷',
      '絕望',
      '沮喪',
      '焦慮',
      '緊張',
      '害怕',
      '恐懼',
      '擔心',
    ])

    // 程度副詞
    this.intensifiers = new Set([
      '非常',
      '很',
      '太',
      '極',
      '超級',
      '特別',
      '十分',
      '相當',
      '比較',
      '有點',
      '稍微',
      '一點',
      '些許',
      '略微',
      '幾乎',
      '完全',
      '絕對',
    ])
  }

  // 分析文本情感
  async analyzeSentiment(text: string): Promise<SentimentResult> {
    const words = this.tokenize(text)
    let positiveScore = 0
    let negativeScore = 0
    let neutralScore = 0

    for (let i = 0; i < words.length; i++) {
      const word = words[i]
      let intensity = 1

      // 檢查是否有程度副詞
      if (i > 0 && this.intensifiers.has(words[i - 1])) {
        intensity = 1.5
      }

      if (this.positiveWords.has(word)) {
        positiveScore += intensity
      } else if (this.negativeWords.has(word)) {
        negativeScore += intensity
      } else {
        neutralScore += 0.1
      }
    }

    // 計算總分
    const total = positiveScore + negativeScore + neutralScore
    if (total === 0) {
      return {
        sentiment: 'neutral',
        confidence: 1.0,
        scores: { positive: 0.33, negative: 0.33, neutral: 0.34 },
      }
    }

    const scores = {
      positive: positiveScore / total,
      negative: negativeScore / total,
      neutral: neutralScore / total,
    }

    // 確定情感類別
    let sentiment: 'positive' | 'negative' | 'neutral'
    let confidence: number

    if (scores.positive > scores.negative && scores.positive > scores.neutral) {
      sentiment = 'positive'
      confidence = scores.positive
    } else if (
      scores.negative > scores.positive &&
      scores.negative > scores.neutral
    ) {
      sentiment = 'negative'
      confidence = scores.negative
    } else {
      sentiment = 'neutral'
      confidence = scores.neutral
    }

    return { sentiment, confidence, scores }
  }

  // 簡單的中文分詞
  private tokenize(text: string): string[] {
    // 移除標點符號和空格
    const cleanText = text.replace(/[^\u4e00-\u9fa5a-zA-Z0-9]/g, ' ')

    // 按空格分割並過濾空字串
    return cleanText.split(/\s+/).filter(word => word.length > 0)
  }
}

// 使用 TensorFlow.js 的進階情感分析模型
class TensorFlowSentimentAnalyzer {
  private model: tf.LayersModel | null = null
  private tokenizer: any = null

  constructor() {
    this.initializeModel()
  }

  private async initializeModel() {
    try {
      // 這裡可以載入預訓練的模型
      // 由於我們沒有預訓練模型，我們使用簡單的關鍵詞分析
      console.log('TensorFlow.js 模型初始化完成')
    } catch (error) {
      console.error('模型載入失敗:', error)
    }
  }

  async analyzeSentiment(text: string): Promise<SentimentResult> {
    // 如果模型未載入，使用簡單分析
    if (!this.model) {
      const simpleAnalyzer = new SimpleChineseSentimentAnalyzer()
      return await simpleAnalyzer.analyzeSentiment(text)
    }

    // 這裡可以實現真正的 TensorFlow.js 模型推理
    // 目前返回簡單分析的結果
    const simpleAnalyzer = new SimpleChineseSentimentAnalyzer()
    return await simpleAnalyzer.analyzeSentiment(text)
  }
}

// 全域情感分析器實例
let sentimentAnalyzer: TensorFlowSentimentAnalyzer | null = null

// 初始化情感分析器
export async function initializeSentimentAnalyzer() {
  if (!sentimentAnalyzer) {
    sentimentAnalyzer = new TensorFlowSentimentAnalyzer()
  }
  return sentimentAnalyzer
}

// 分析文本情感
export async function analyzeTextSentiment(
  text: string,
): Promise<SentimentResult> {
  const analyzer = await initializeSentimentAnalyzer()
  return await analyzer.analyzeSentiment(text)
}

// 獲取情感圖標
export function getSentimentIcon(sentiment: string): string {
  switch (sentiment) {
    case 'positive':
      return '😊'
    case 'negative':
      return '😞'
    case 'neutral':
      return '😐'
    default:
      return '😐'
  }
}

// 獲取情感顏色
export function getSentimentColor(sentiment: string): string {
  switch (sentiment) {
    case 'positive':
      return '#4CAF50'
    case 'negative':
      return '#F44336'
    case 'neutral':
      return '#FF9800'
    default:
      return '#9E9E9E'
  }
}

// 獲取情感文字
export function getSentimentText(sentiment: string): string {
  switch (sentiment) {
    case 'positive':
      return '正面'
    case 'negative':
      return '負面'
    case 'neutral':
      return '中性'
    default:
      return '未知'
  }
}
