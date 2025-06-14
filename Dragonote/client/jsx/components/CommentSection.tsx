import React, { useState, useEffect } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { zhTW } from 'date-fns/locale'

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
