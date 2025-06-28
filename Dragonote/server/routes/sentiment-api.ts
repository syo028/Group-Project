import { Router } from 'express'
import { auth } from '../middleware/auth.js'

const router = Router()

// 簡單的中文情感分析函數
function analyzeSentiment(text: string) {
  const positiveWords = [
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
  ]

  const negativeWords = [
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
  ]

  const intensifiers = [
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
  ]

  // 簡單分詞
  const words = text
    .replace(/[^\u4e00-\u9fa5a-zA-Z0-9]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 0)

  let positiveScore = 0
  let negativeScore = 0
  let neutralScore = 0

  for (let i = 0; i < words.length; i++) {
    const word = words[i]
    let intensity = 1

    // 檢查程度副詞
    if (i > 0 && intensifiers.includes(words[i - 1])) {
      intensity = 1.5
    }

    if (positiveWords.includes(word)) {
      positiveScore += intensity
    } else if (negativeWords.includes(word)) {
      negativeScore += intensity
    } else {
      neutralScore += 0.1
    }
  }

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

// 分析文本情感
router.post('/analyze', auth, (req, res) => {
  try {
    const { text } = req.body

    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: '請提供有效的文本內容' })
    }

    const result = analyzeSentiment(text)
    res.json(result)
  } catch (error) {
    console.error('情感分析錯誤:', error)
    res.status(500).json({ error: '情感分析失敗' })
  }
})

// 批量分析評論情感
router.post('/analyze-comments', auth, (req, res) => {
  try {
    const { comments } = req.body

    if (!Array.isArray(comments)) {
      return res.status(400).json({ error: '請提供評論陣列' })
    }

    const results = comments.map(comment => ({
      id: comment.id,
      ...analyzeSentiment(comment.content),
    }))

    res.json(results)
  } catch (error) {
    console.error('批量情感分析錯誤:', error)
    res.status(500).json({ error: '批量情感分析失敗' })
  }
})

export default router
