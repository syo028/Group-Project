import React, { useState, useEffect } from 'react'

interface LikeButtonProps {
  postId: number
  initialLikeCount: number
  onLikeCountChange: (count: number) => void
}

export const LikeButton: React.FC<LikeButtonProps> = ({
  postId,
  initialLikeCount,
  onLikeCountChange,
}) => {
  const [isLiked, setIsLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(initialLikeCount)
  const [isLoading, setIsLoading] = useState(false)
  const [isInitialLoading, setIsInitialLoading] = useState(true)

  useEffect(() => {
    // 檢查用戶是否已經點讚
    const checkLikeStatus = async () => {
      try {
        const response = await fetch(`/api/posts/${postId}/like-status`)
        if (!response.ok) {
          throw new Error('Failed to fetch like status')
        }
        const data = await response.json()
        setIsLiked(data.isLiked)
      } catch (error) {
        console.error('Error checking like status:', error)
      } finally {
        setIsInitialLoading(false)
      }
    }

    checkLikeStatus()
  }, [postId])

  const handleLike = async () => {
    if (isLoading) return

    setIsLoading(true)
    try {
      const response = await fetch(`/api/posts/${postId}/like`, {
        method: isLiked ? 'DELETE' : 'POST',
      })

      if (!response.ok) {
        throw new Error('Failed to toggle like')
      }

      const newLikeCount = isLiked ? likeCount - 1 : likeCount + 1
      setLikeCount(newLikeCount)
      setIsLiked(!isLiked)
      onLikeCountChange(newLikeCount)
    } catch (error) {
      console.error('Error toggling like:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isInitialLoading) {
    return <div className="like-button loading">載入中...</div>
  }

  return (
    <button
      className={`like-button ${isLiked ? 'liked' : ''}`}
      onClick={handleLike}
      disabled={isLoading}
    >
      <span className="like-icon">❤</span>
      <span className="like-count">{likeCount}</span>

      <style jsx>{`
        .like-button {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          border: 1px solid #ddd;
          border-radius: 20px;
          background: white;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .like-button.loading {
          opacity: 0.7;
          cursor: wait;
        }

        .like-button:hover {
          background: #f8f9fa;
        }

        .like-button.liked {
          background: #ffebee;
          border-color: #ffcdd2;
          color: #e53935;
        }

        .like-button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .like-icon {
          font-size: 1.2em;
        }

        .like-count {
          font-weight: 500;
        }
      `}</style>
    </button>
  )
}
