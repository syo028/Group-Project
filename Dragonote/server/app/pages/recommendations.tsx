import { o } from '../jsx/jsx.js'
import { Routes } from '../routes.js'
import { apiEndpointTitle, title } from '../../config.js'
import Style from '../components/style.js'
import { Context, DynamicContext } from '../context.js'
import { mapArray } from '../components/fragment.js'
import { IonBackButton } from '../components/ion-back-button.js'
import { Link } from '../components/router.js'
import { getAuthUser, getAuthUserId } from '../auth/user.js'
import { evalLocale, Locale } from '../components/locale.js'
import { proxy } from '../../../db/proxy.js'
import { Page } from '../components/page.js'
import PostCard, { PostCardStyle } from '../components/post-card.js'
import { RecommendationEngine } from '../recommendation/recommendation-engine.js'
import { IonButton } from '../components/ion-button.js'
import { toRouteUrl } from '../../url.js'
import { filter } from 'better-sqlite3-proxy'

let pageTitle = (
  <Locale en="Recommendations" zh_hk="推薦貼文" zh_cn="推荐贴文" />
)

let style = Style(/* css */ `
#Recommendations {
  padding: 16px;
}

.recommendation-section {
  margin-bottom: 24px;
}

.section-title {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 12px;
  color: var(--ion-color-primary);
  display: flex;
  align-items: center;
  gap: 8px;
}

.recommendation-item {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 8px;
  border-left: 4px solid var(--ion-color-primary);
}

.recommendation-score {
  font-size: 12px;
  color: var(--ion-color-medium);
  margin-bottom: 4px;
}

.recommendation-reason {
  font-size: 12px;
  color: var(--ion-color-secondary);
  font-style: italic;
}

.like-history-item {
  background: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 8px;
}

.like-date {
  font-size: 12px;
  color: var(--ion-color-medium);
  margin-bottom: 4px;
}

.empty-state {
  text-align: center;
  padding: 32px 16px;
  color: var(--ion-color-medium);
}

.empty-state ion-icon {
  font-size: 48px;
  margin-bottom: 16px;
}
`)

function Main(attrs: {}, context: DynamicContext) {
  const user = getAuthUser(context)
  if (!user) {
    return (
      <div class="empty-state">
        <ion-icon name="person-outline"></ion-icon>
        <p>請先登入以查看個人化推薦</p>
        <Link href="/login" tagName="ion-button">
          登入
        </Link>
      </div>
    )
  }

  const userId = user.id!

  // 獲取推薦貼文（同步調用，因為在 JSX 中）
  const recommendations = RecommendationEngine.getRecommendationsForUser(
    userId,
    10,
  )
  const recommendedPosts = recommendations
    .map(rec => {
      const post = proxy.post.find(p => p.id === rec.post_id)
      return { ...rec, post }
    })
    .filter(item => item.post)

  // 獲取點讚歷史
  const likeHistory = RecommendationEngine.getUserLikeHistory(userId)

  return (
    <>
      {PostCardStyle}
      {style}
      <Page id="Recommendations" title="推薦貼文">
        <ion-content>
          {/* 推薦貼文區塊 */}
          <div class="recommendation-section">
            <div class="section-title">
              <ion-icon name="star-outline"></ion-icon>
              為您推薦
            </div>

            {recommendedPosts.length > 0 ? (
              <ion-list>
                {mapArray(recommendedPosts, item => (
                  <ion-item class="recommendation-item">
                    <div style="width: 100%;">
                      <div class="recommendation-score">
                        推薦分數: {(item.score * 100).toFixed(1)}%
                      </div>
                      <div class="recommendation-reason">{item.reason}</div>
                      {item.post && <PostCard post={item.post} />}
                    </div>
                  </ion-item>
                ))}
              </ion-list>
            ) : (
              <div class="empty-state">
                <ion-icon name="star-outline"></ion-icon>
                <p>還沒有足夠的點讚記錄來生成推薦</p>
                <p>多點讚一些貼文來獲得個人化推薦！</p>
              </div>
            )}
          </div>

          {/* 點讚歷史區塊 */}
          <div class="recommendation-section">
            <div class="section-title">
              <ion-icon name="heart-outline"></ion-icon>
              我的點讚歷史 ({likeHistory.length})
            </div>

            {likeHistory.length > 0 ? (
              <ion-list>
                {mapArray(likeHistory, item => (
                  <ion-item class="like-history-item">
                    <div style="width: 100%;">
                      <div class="like-date">
                        點讚時間:{' '}
                        {new Date(
                          (item.created_at || 0) * 1000,
                        ).toLocaleString()}
                      </div>
                      {item.post && <PostCard post={item.post} />}
                    </div>
                  </ion-item>
                ))}
              </ion-list>
            ) : (
              <div class="empty-state">
                <ion-icon name="heart-outline"></ion-icon>
                <p>還沒有點讚任何貼文</p>
                <p>開始點讚貼文來建立您的興趣檔案！</p>
              </div>
            )}
          </div>
        </ion-content>
      </Page>
    </>
  )
}

let routes = {
  '/recommendations': {
    resolve(context: DynamicContext) {
      let t = evalLocale(pageTitle, context)
      return {
        title: title(t),
        description: '個人化推薦貼文',
        node: <Main />,
      }
    },
  },
} satisfies Routes

export default { routes }
