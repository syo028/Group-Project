import { o } from '../jsx/jsx.js'
import { Locale } from './locale.js'

interface SentimentDisplayProps {
  sentiment: 'positive' | 'negative' | 'neutral'
  confidence: number
  showDetails?: boolean
}

export function SentimentDisplay(attrs: SentimentDisplayProps) {
  const { sentiment, confidence, showDetails = false } = attrs

  const getSentimentIcon = (sentiment: string) => {
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

  const getSentimentColor = (sentiment: string) => {
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

  const getSentimentText = (sentiment: string) => {
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

  const confidencePercent = Math.round(confidence * 100)

  return (
    <div
      class="sentiment-display"
      style={`display: inline-flex; align-items: center; gap: 4px;`}
    >
      <span style={`font-size: 16px;`}>{getSentimentIcon(sentiment)}</span>
      <span
        style={`color: ${getSentimentColor(sentiment)}; font-weight: 500; font-size: 12px;`}
      >
        {getSentimentText(sentiment)}
      </span>
      {showDetails && (
        <span style={`color: #666; font-size: 10px;`}>
          ({confidencePercent}%)
        </span>
      )}
    </div>
  )
}

export default SentimentDisplay
