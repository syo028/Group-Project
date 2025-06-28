// 情感分析客戶端功能
export class SentimentClient {
  private static instance: SentimentClient

  static getInstance(): SentimentClient {
    if (!SentimentClient.instance) {
      SentimentClient.instance = new SentimentClient()
    }
    return SentimentClient.instance
  }

  // 分析單個評論的情感
  async analyzeComment(commentId: number, content: string): Promise<void> {
    try {
      const response = await fetch('/api/sentiment/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: content }),
      })

      if (!response.ok) {
        throw new Error('情感分析請求失敗')
      }

      const result = await response.json()
      this.displaySentiment(commentId, result)
    } catch (error) {
      console.error('情感分析錯誤:', error)
      this.displayError(commentId)
    }
  }

  // 批量分析評論情感
  async analyzeComments(
    comments: Array<{ id: number; content: string }>,
  ): Promise<void> {
    try {
      const response = await fetch('/api/sentiment/analyze-comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ comments }),
      })

      if (!response.ok) {
        throw new Error('批量情感分析請求失敗')
      }

      const results = await response.json()
      results.forEach((result: any) => {
        this.displaySentiment(result.id, result)
      })
    } catch (error) {
      console.error('批量情感分析錯誤:', error)
      comments.forEach(comment => {
        this.displayError(comment.id)
      })
    }
  }

  // 顯示情感分析結果
  private displaySentiment(commentId: number, result: any): void {
    const sentimentElement = document.querySelector(
      `[data-comment-id="${commentId}"] .sentiment-analysis`,
    )
    if (!sentimentElement) return

    const icon = this.getSentimentIcon(result.sentiment)
    const color = this.getSentimentColor(result.sentiment)
    const text = this.getSentimentText(result.sentiment)
    const confidence = Math.round(result.confidence * 100)

    sentimentElement.innerHTML = `
      <div class="sentiment-display">
        <span style="font-size: 16px;">${icon}</span>
        <span style="color: ${color}; font-weight: 500; font-size: 12px;">${text}</span>
        <span style="color: #666; font-size: 10px;">(${confidence}%)</span>
      </div>
    `
  }

  // 顯示錯誤訊息
  private displayError(commentId: number): void {
    const sentimentElement = document.querySelector(
      `[data-comment-id="${commentId}"] .sentiment-analysis`,
    )
    if (!sentimentElement) return

    sentimentElement.innerHTML = `
      <span style="color: #999; font-size: 12px;">分析失敗</span>
    `
  }

  // 獲取情感圖標
  private getSentimentIcon(sentiment: string): string {
    switch (sentiment) {
      case 'positive':
        return '😊'
      case 'negative':
        return '😞'
      case 'neutral':
        return '😐'
      default:
        return '��'
    }
  }

  // 獲取情感顏色
  private getSentimentColor(sentiment: string): string {
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
  private getSentimentText(sentiment: string): string {
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

  // 初始化頁面上的情感分析
  initPageSentimentAnalysis(): void {
    // 分析所有現有評論
    const comments = document.querySelectorAll('.comments-item')
    const commentData: Array<{ id: number; content: string }> = []

    comments.forEach(commentElement => {
      const commentId = commentElement
        .querySelector('[data-comment-id]')
        ?.getAttribute('data-comment-id')
      const contentElement = commentElement.querySelector('p')

      if (commentId && contentElement) {
        commentData.push({
          id: parseInt(commentId),
          content: contentElement.textContent || '',
        })
      }
    })

    if (commentData.length > 0) {
      this.analyzeComments(commentData)
    }

    // 監聽新評論的添加
    this.observeNewComments()
  }

  // 監聽新評論
  private observeNewComments(): void {
    const observer = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        mutation.addedNodes.forEach(node => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as Element
            if (element.classList.contains('comments-item')) {
              const commentId = element
                .querySelector('[data-comment-id]')
                ?.getAttribute('data-comment-id')
              const contentElement = element.querySelector('p')

              if (commentId && contentElement) {
                this.analyzeComment(
                  parseInt(commentId),
                  contentElement.textContent || '',
                )
              }
            }
          }
        })
      })
    })

    const commentsList = document.querySelector('.comments-list')
    if (commentsList) {
      observer.observe(commentsList, { childList: true, subtree: true })
    }
  }
}

// 全域初始化函數
export function initSentimentAnalysis(): void {
  const sentimentClient = SentimentClient.getInstance()
  sentimentClient.initPageSentimentAnalysis()
}

// 當 DOM 載入完成後初始化
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initSentimentAnalysis)
} else {
  initSentimentAnalysis()
}
