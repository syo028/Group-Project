import { Router } from 'express'
import { db } from '../db'
import { auth } from '../middleware/auth'
import { SentimentManager } from 'node-nlp'
import type { Request, Response } from 'express'

const router = Router()
const sentiment = new SentimentManager()

// 獲取帖子的評論
router.get('/posts/:postId/comments', async (req: Request, res: Response) => {
  try {
    const comments = await db('comment')
      .select('comment.*', 'user.username')
      .join('user', 'comment.user_id', 'user.id')
      .where('comment.post_id', req.params.postId)
      .orderBy('comment.created_at', 'desc')

    res.json(comments)
  } catch (error) {
    console.error('Error fetching comments:', error)
    res.status(500).json({ error: '獲取評論失敗' })
  }
})

// 添加評論
router.post('/posts/:postId/comments', auth, async (req: Request, res: Response) => {
  try {
    const { content } = req.body
    const postId = parseInt(req.params.postId)
    const userId = req.user.id

    const [comment] = await db('comment')
      .insert({
        post_id: postId,
        user_id: userId,
        content,
        created_at: Math.floor(Date.now() / 1000),
        updated_at: Math.floor(Date.now() / 1000),
      })
      .returning('*')

    // 更新帖子的評論數
    await db('post').where('id', postId).increment('comment_count', 1)

    res.json(comment)
  } catch (error) {
    console.error('Error adding comment:', error)
    res.status(500).json({ error: '添加評論失敗' })
  }
})

// 獲取點讚狀態
router.get('/posts/:postId/like-status', auth, async (req: Request, res: Response) => {
  try {
    const postId = parseInt(req.params.postId)
    const userId = req.user.id

    const like = await db('like')
      .where({
        post_id: postId,
        user_id: userId,
      })
      .first()

    res.json({ isLiked: !!like })
  } catch (error) {
    console.error('Error checking like status:', error)
    res.status(500).json({ error: '獲取點讚狀態失敗' })
  }
})

// 點讚/取消點讚
router.post('/posts/:postId/like', auth, async (req: Request, res: Response) => {
  try {
    const postId = parseInt(req.params.postId)
    const userId = req.user.id

    const like = await db('like')
      .where({
        post_id: postId,
        user_id: userId,
      })
      .first()

    if (like) {
      // 取消點讚
      await db('like')
        .where({
          post_id: postId,
          user_id: userId,
        })
        .delete()

      await db('post').where('id', postId).decrement('like_count', 1)
    } else {
      // 添加點讚
      await db('like').insert({
        post_id: postId,
        user_id: userId,
        created_at: Math.floor(Date.now() / 1000),
      })

      await db('post').where('id', postId).increment('like_count', 1)
    }

    res.json({ success: true })
  } catch (error) {
    console.error('Error toggling like:', error)
    res.status(500).json({ error: '操作點讚失敗' })
  }
})

// === 推薦系統 API ===
// 根據用戶點讚過的貼文 tags 推薦其他貼文
router.get('/recommendations', auth, async (req: Request, res: Response) => {
  try {
    const userId = req.user.id
    // 取得用戶點讚過的貼文 tags
    const likedPosts = await db('like')
      .join('post', 'like.post_id', 'post.id')
      .where('like.user_id', userId)
      .select('post.tags')

    if (!likedPosts.length) {
      return res.json([]) // 沒有點讚紀錄
    }

    // 收集所有 tag
    const tagSet = new Set<string>()
    likedPosts.forEach((post: { tags: string }) => {
      if (post.tags) {
        post.tags.split(',').map((tag: string) => tag.trim()).forEach((tag: string) => tagSet.add(tag))
      }
    })
    if (tagSet.size === 0) {
      return res.json([])
    }

    // 查詢用戶已點讚過的貼文 id
    const likedPostIds = await db('like')
      .where('user_id', userId)
      .pluck('post_id')

    // 推薦有相同 tag 的其他貼文（排除已點讚）
    const recommendations = await db('post')
      .whereNotIn('id', likedPostIds)
      .andWhere(function (this: any) {
        for (const tag of tagSet) {
          this.orWhere('tags', 'like', `%${tag}%`)
        }
      })
      .limit(10)
      .select('id', 'title', 'tags', 'like_count', 'comment_count', 'photo_url')

    res.json(recommendations)
  } catch (error) {
    console.error('Error generating recommendations:', error)
    res.status(500).json({ error: '獲取推薦失敗' })
  }
})

// === 情感分析 API ===
router.post('/sentiment', async (req: Request, res: Response) => {
  try {
    const { content } = req.body
    if (!content) return res.status(400).json({ error: '缺少內容' })
    const result = await sentiment.analyze(content, 'zh')
    res.json({
      score: result.score,
      comparative: result.comparative,
      vote: result.vote, // 'positive' | 'negative' | 'neutral'
    })
  } catch (error) {
    console.error('Error in sentiment analysis:', error)
    res.status(500).json({ error: '情感分析失敗' })
  }
})

export default router
