import React, { useState, useEffect, useRef } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { zhTW } from 'date-fns/locale'
import Chart from 'chart.js/auto'

interface Comment {
  id: number
  content: string
  user_id: number
  created_at: number
  updated_at: number
  username: string
}

interface CommentSectionProps {
  postId: number
  onCommentCountChange: (count: number) => void
}

export const CommentSection: React.FC<CommentSectionProps> = ({
  postId,
  onCommentCountChange,
}) => {
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isInitialLoading, setIsInitialLoading] = useState(true)
  const chartRef = useRef<HTMLCanvasElement>(null)
  const [sentimentStats, setSentimentStats] = useState({ positive: 0, neutral: 0, negative: 0 })

  const fetchComments = async () => {
    try {
      const response = await fetch(`/api/posts/${postId}/comments`)
      if (!response.ok) {
        throw new Error('Failed to fetch comments')
      }
      const data = await response.json()
      setComments(data)
      onCommentCountChange(data.length)
    } catch (error) {
      console.error('Error fetching comments:', error)
    } finally {
      setIsInitialLoading(false)
    }
  }

  useEffect(() => {
    fetchComments()
  }, [postId])

  // 取得所有留言的情感分析
  useEffect(() => {
    if (comments.length === 0) return
    let isMounted = true
    async function analyzeAll() {
      let pos = 0, neu = 0, neg = 0
      for (const comment of comments) {
        // 呼叫後端情感分析 API
        const res = await fetch('/api/sentiment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content: comment.content })
        })
        if (res.ok) {
          const data = await res.json()
          if (data.vote === 'positive') pos++
          else if (data.vote === 'negative') neg++
          else neu++
        }
      }
      if (isMounted) setSentimentStats({ positive: pos, neutral: neu, negative: neg })
    }
    analyzeAll()
    return () => { isMounted = false }
  }, [comments])

  // 畫圖表
  useEffect(() => {
    if (!chartRef.current) return
    const ctx = chartRef.current.getContext('2d')
    if (!ctx) return
    // 清除舊圖表
    if ((window as any).sentimentChart) {
      (window as any).sentimentChart.destroy()
    }
    ;(window as any).sentimentChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['正面', '中性', '負面'],
        datasets: [{
          label: '情感分佈',
          data: [sentimentStats.positive, sentimentStats.neutral, sentimentStats.negative],
          backgroundColor: ['#4caf50', '#ffc107', '#f44336']
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false },
        },
        scales: {
          y: { beginAtZero: true, precision: 0 }
        }
      }
    })
  }, [sentimentStats])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim()) return

    setIsLoading(true)
    try {
      const response = await fetch(`/api/posts/${postId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: newComment }),
      })

      if (!response.ok) {
        throw new Error('Failed to post comment')
      }

      setNewComment('')
      await fetchComments() // 重新獲取評論列表
    } catch (error) {
      console.error('Error posting comment:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isInitialLoading) {
    return <div className="comment-section">載入評論中...</div>
  }

  return (
    <div className="comment-section">
      <h3>評論 ({comments.length})</h3>

      <form onSubmit={handleSubmit} className="comment-form">
        <textarea
          value={newComment}
          onChange={e => setNewComment(e.target.value)}
          placeholder="寫下你的評論..."
          disabled={isLoading}
        />
        <button type="submit" disabled={isLoading}>
          {isLoading ? '發送中...' : '發送評論'}
        </button>
      </form>

      <div className="comments-list">
        {comments.map(comment => (
          <div key={comment.id} className="comment">
            <div className="comment-header">
              <span className="username">{comment.username}</span>
              <span className="time">
                {formatDistanceToNow(comment.created_at * 1000, {
                  addSuffix: true,
                  locale: zhTW,
                })}
              </span>
            </div>
            <div className="comment-content">{comment.content}</div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 32, marginBottom: 16 }}>
        <h4>情感分析統計</h4>
        <canvas ref={chartRef} width={400} height={200} />
        <div style={{ fontSize: '0.9em', color: '#888', marginTop: 8 }}>
          正面：{sentimentStats.positive}　中性：{sentimentStats.neutral}　負面：{sentimentStats.negative}
        </div>
      </div>

      <style jsx>{`
        .comment-section {
          margin-top: 20px;
          padding: 20px;
          background: #f8f9fa;
          border-radius: 8px;
        }

        .comment-form {
          margin-bottom: 20px;
        }

        .comment-form textarea {
          width: 100%;
          min-height: 100px;
          padding: 10px;
          margin-bottom: 10px;
          border: 1px solid #ddd;
          border-radius: 4px;
          resize: vertical;
        }

        .comment-form button {
          padding: 8px 16px;
          background: #007bff;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }

        .comment-form button:disabled {
          background: #ccc;
        }

        .comments-list {
          margin-top: 20px;
        }

        .comment {
          padding: 15px;
          margin-bottom: 15px;
          background: white;
          border-radius: 4px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .comment-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
          color: #666;
          font-size: 0.9em;
        }

        .username {
          font-weight: bold;
          color: #333;
        }

        .comment-content {
          line-height: 1.5;
        }
      `}</style>
    </div>
  )
}
