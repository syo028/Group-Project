import { Router } from 'express'
import { db } from '../db'
import { auth } from '../middleware/auth'

const router = Router()

// 獲取帖子的評論
router.get('/:postId/comments', async (req, res) => {
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
router.post('/:postId/comments', auth, async (req, res) => {
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
router.get('/:postId/like-status', auth, async (req, res) => {
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
router.post('/:postId/like', auth, async (req, res) => {
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

export default router
