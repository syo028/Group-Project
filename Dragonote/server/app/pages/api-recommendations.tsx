import { o } from '../jsx/jsx.js'
import { Routes } from '../routes.js'
import { apiEndpointTitle } from '../../config.js'
import { DynamicContext, ExpressContext } from '../context.js'
import { getAuthUser, getAuthUserId } from '../auth/user.js'
import { RecommendationEngine } from '../recommendation/recommendation-engine.js'
import { ajaxRoute } from '../routes.js'

/**
 * 獲取用戶推薦貼文 API
 */
const getUserRecommendations = ajaxRoute({
  description: '獲取用戶個人化推薦',
  api: (context: ExpressContext) => {
    const user = getAuthUser(context)
    if (!user) {
      throw new Error('需要登入才能獲取推薦')
    }

    const userId = user.id!
    const limit = parseInt((context.req.query?.limit as string) || '10')

    const recommendations = RecommendationEngine.getRecommendationsForUser(
      userId,
      limit,
    )

    return {
      success: true,
      data: recommendations,
      user_id: userId,
    }
  },
})

/**
 * 獲取相似貼文 API
 */
const getSimilarPosts = ajaxRoute({
  description: '獲取相似貼文',
  api: (context: ExpressContext) => {
    const postId = parseInt(context.req.params?.postId || '0')
    if (!postId) {
      throw new Error('需要提供貼文 ID')
    }

    const limit = parseInt((context.req.query?.limit as string) || '5')
    const recommendations = RecommendationEngine.getSimilarPosts(postId, limit)

    return {
      success: true,
      data: recommendations,
      post_id: postId,
    }
  },
})

/**
 * 獲取用戶點讚歷史 API
 */
const getUserLikeHistory = ajaxRoute({
  description: '獲取用戶點讚歷史',
  api: (context: ExpressContext) => {
    const user = getAuthUser(context)
    if (!user) {
      throw new Error('需要登入才能獲取點讚歷史')
    }

    const userId = user.id!
    const likeHistory = RecommendationEngine.getUserLikeHistory(userId)

    return {
      success: true,
      data: likeHistory,
      user_id: userId,
      total_likes: likeHistory.length,
    }
  },
})

/**
 * 獲取熱門貼文 API
 */
const getPopularPosts = ajaxRoute({
  description: '獲取熱門貼文',
  api: (context: ExpressContext) => {
    const limit = parseInt((context.req.query?.limit as string) || '10')

    const popularPosts = RecommendationEngine.getPopularPosts(limit)

    return {
      success: true,
      data: popularPosts,
      limit: limit,
    }
  },
})

let routes = {
  '/api/recommendations/user': getUserRecommendations,
  '/api/recommendations/similar/:postId': getSimilarPosts,
  '/api/recommendations/like-history': getUserLikeHistory,
  '/api/recommendations/popular': getPopularPosts,
} satisfies Routes

export default { routes }
