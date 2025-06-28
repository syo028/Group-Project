import { proxy } from '../../../db/proxy.js'
import { filter } from 'better-sqlite3-proxy'

export interface RecommendationResult {
  post_id: number
  score: number
  reason: string
}

export class RecommendationEngine {
  /**
   * 基於用戶點讚的貼文推薦相似貼文
   */
  static getRecommendationsForUser(
    userId: number,
    limit: number = 10,
  ): RecommendationResult[] {
    // 獲取用戶點讚的貼文
    const userLikes = filter(proxy.like, { user_id: userId })
    const likedPostIds = userLikes.map(like => like.post_id!)

    if (likedPostIds.length === 0) {
      // 如果用戶沒有點讚任何貼文，返回熱門貼文
      return this.getPopularPosts(limit)
    }

    // 獲取用戶點讚的貼文詳情
    const likedPosts = likedPostIds
      .map(id => proxy.post.find(p => p.id === id))
      .filter(Boolean)

    // 計算推薦分數
    const recommendations = new Map<
      number,
      { score: number; reasons: string[] }
    >()

    // 遍歷所有貼文
    for (const post of proxy.post) {
      if (!post.id || likedPostIds.includes(post.id)) {
        continue // 跳過已點讚的貼文
      }

      let totalScore = 0
      const reasons: string[] = []

      // 與每個點讚的貼文比較
      for (const likedPost of likedPosts) {
        if (!likedPost) continue

        // 標籤相似度
        const tagScore = this.calculateTagSimilarity(post.tags, likedPost.tags)
        if (tagScore > 0) {
          totalScore += tagScore * 0.6 // 標籤權重 60%
          reasons.push(`標籤相似度: ${(tagScore * 100).toFixed(1)}%`)
        }

        // 內容相似度
        const contentScore = this.calculateContentSimilarity(
          post.content,
          likedPost.content,
        )
        if (contentScore > 0) {
          totalScore += contentScore * 0.4 // 內容權重 40%
          reasons.push(`內容相似度: ${(contentScore * 100).toFixed(1)}%`)
        }
      }

      if (totalScore > 0) {
        recommendations.set(post.id, {
          score: totalScore / likedPosts.length, // 平均分數
          reasons: reasons.slice(0, 2), // 只保留前兩個原因
        })
      }
    }

    // 排序並返回結果
    return Array.from(recommendations.entries())
      .map(([postId, data]) => ({
        post_id: postId,
        score: data.score,
        reason: data.reasons.join(', '),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
  }

  /**
   * 基於標籤相似度計算分數
   */
  private static calculateTagSimilarity(tags1: string, tags2: string): number {
    if (!tags1 || !tags2) return 0

    const tags1Set = new Set(
      tags1
        .toLowerCase()
        .split(',')
        .map(t => t.trim()),
    )
    const tags2Set = new Set(
      tags2
        .toLowerCase()
        .split(',')
        .map(t => t.trim()),
    )

    if (tags1Set.size === 0 || tags2Set.size === 0) return 0

    const intersection = new Set([...tags1Set].filter(tag => tags2Set.has(tag)))
    const union = new Set([...tags1Set, ...tags2Set])

    return intersection.size / union.size // Jaccard 相似度
  }

  /**
   * 基於內容相似度計算分數（簡單的關鍵字匹配）
   */
  private static calculateContentSimilarity(
    content1: string,
    content2: string,
  ): number {
    if (!content1 || !content2) return 0

    const words1 = new Set(
      content1
        .toLowerCase()
        .split(/\s+/)
        .filter(w => w.length > 2),
    )
    const words2 = new Set(
      content2
        .toLowerCase()
        .split(/\s+/)
        .filter(w => w.length > 2),
    )

    if (words1.size === 0 || words2.size === 0) return 0

    const intersection = new Set([...words1].filter(word => words2.has(word)))
    const union = new Set([...words1, ...words2])

    return intersection.size / union.size // Jaccard 相似度
  }

  /**
   * 獲取熱門貼文（基於點讚數）
   */
  static getPopularPosts(limit: number): RecommendationResult[] {
    return proxy.post
      .filter(post => post.id)
      .sort((a, b) => (b.like_count || 0) - (a.like_count || 0))
      .slice(0, limit)
      .map(post => ({
        post_id: post.id!,
        score: (post.like_count || 0) / 100, // 標準化分數
        reason: `熱門貼文 (${post.like_count} 個讚)`,
      }))
  }

  /**
   * 基於特定貼文推薦相似貼文
   */
  static getSimilarPosts(
    postId: number,
    limit: number = 5,
  ): RecommendationResult[] {
    const targetPost = proxy.post.find(p => p.id === postId)
    if (!targetPost) return []

    const recommendations: RecommendationResult[] = []

    for (const post of proxy.post) {
      if (!post.id || post.id === postId) continue

      const tagScore = this.calculateTagSimilarity(post.tags, targetPost.tags)
      const contentScore = this.calculateContentSimilarity(
        post.content,
        targetPost.content,
      )

      const totalScore = tagScore * 0.6 + contentScore * 0.4

      if (totalScore > 0.1) {
        // 只推薦相似度超過 10% 的貼文
        recommendations.push({
          post_id: post.id,
          score: totalScore,
          reason: `標籤相似度: ${(tagScore * 100).toFixed(1)}%, 內容相似度: ${(contentScore * 100).toFixed(1)}%`,
        })
      }
    }

    return recommendations.sort((a, b) => b.score - a.score).slice(0, limit)
  }

  /**
   * 獲取用戶的點讚歷史
   */
  static getUserLikeHistory(userId: number): any[] {
    const userLikes = filter(proxy.like, { user_id: userId })
    return userLikes
      .map(like => {
        const post = proxy.post.find(p => p.id === like.post_id)
        return {
          like_id: like.id,
          post_id: like.post_id,
          created_at: like.created_at,
          post: post
            ? {
                id: post.id,
                title: post.title,
                content: post.content,
                tags: post.tags,
                like_count: post.like_count,
                user: post.user,
              }
            : null,
        }
      })
      .filter(item => item.post !== null)
  }
}
