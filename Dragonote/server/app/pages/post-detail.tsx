import { o } from '../jsx/jsx.js'
import { Routes } from '../routes.js'
import { apiEndpointTitle, title } from '../../config.js'
import Style from '../components/style.js'
import {
  Context,
  DynamicContext,
  getContextFormBody,
  throwIfInAPI,
} from '../context.js'
import { mapArray } from '../components/fragment.js'
import { IonBackButton } from '../components/ion-back-button.js'
import { object, string } from 'cast.ts'
import { Link, Redirect } from '../components/router.js'
import { renderError } from '../components/error.js'
import { getAuthUser, getAuthUserId } from '../auth/user.js'
import { evalLocale, Locale } from '../components/locale.js'
import { Post, proxy } from '../../../db/proxy.js'
import { Page } from '../components/page.js'
import PostCard, {
  PostCardScript,
  PostCardStyle,
} from '../components/post-card.js'
import { validateUsername } from '../validate/user.js'
// import { CommentSection } from '../components/CommentSection.js'
// import { LikeButton } from '../components/like-button.js'
import { EarlyTerminate, MessageException } from '../../exception.js'
import { IonButton } from '../components/ion-button.js'
import { toRouteUrl } from '../../url.js'
import { filter, getTimes, fromSqliteTimestamp } from 'better-sqlite3-proxy'

let pageTitle = (
  <Locale en="Post Detail" zh_hk="Post Detail" zh_cn="Post Detail" />
)
let addPageTitle = (
  <Locale
    en="Add Post Detail"
    zh_hk="添加Post Detail"
    zh_cn="添加Post Detail"
  />
)

let style = Style(/* css */ `
#PostDetail {
  .text-xl {
    font-size: 1.25rem;
    line-height: 1.75rem;
  }
}

.interaction-section {
  margin: 20px 0;
  padding: 16px;
  background: var(--ion-color-light);
  border-radius: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.comments-section {
  margin-top: 30px;
  padding: 16px;
  background: var(--ion-color-light);
  border-radius: 8px;
}

.comments-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  color: var(--ion-color-primary);
  font-size: 1.2rem;
  font-weight: 500;
}

.comments-header ion-icon {
  font-size: 1.4rem;
}
`)

let items = [
  { title: 'Android', slug: 'md' },
  { title: 'iOS', slug: 'ios' },
]

function Main(attrs: {}, context: DynamicContext) {
  let post_id = context.routerMatch?.params.id
  let post = proxy.post[post_id]
  let user = getAuthUser(context)
  let response = proxy.response[post_id]
  if (!post) {
    return (
      <Page id="PostDetail" title={'Post not found'}>
        <p>The post may be deleted or not found.</p>
        <Link href="/" tagName="ion-button">
          Back to Home
        </Link>
      </Page>
    )
  }

  const handleLikeCountChange = (newCount: number) => {
    post.like_count = newCount
  }

  const handleCommentCountChange = (newCount: number) => {
    post.comment_count = newCount
  }

  return (
    <>
      {PostCardStyle}
      {style}
      <Page id="PostDetail" title={post.title}>
        <PostCard post={post} />
        <ion-content>
          <ion-list>
            <br />
            <p></p>
            <div style="color: var(--ion-color-primary)">Description:</div>
            {post.content}
            <p></p>

            <div class="interaction-section">
              {/* <LikeButton
                postId={post.id}
                initialLikeCount={post.like_count}
                onLikeCountChange={handleLikeCountChange}
              /> */}
              <ion-buttons>
                <IonButton
                  class="like-button"
                  data-post-id={post.id}
                  no-history
                  url={toRouteUrl(routes, '/post/:id/like', {
                    params: { id: post.id! },
                  })}
                >
                  <ion-icon
                    class="like-button--icon"
                    name="heart-outline"
                    slot="start"
                  ></ion-icon>
                  <span class="like-button--count">{post.like_count}</span>
                </IonButton>
              </ion-buttons>
            </div>

            <div class="comments-section">
              <div class="comments-header">
                <ion-icon name="chatbubble-outline"></ion-icon>
                <span>Comments</span>
              </div>
              {/* <CommentSection
                postId={post.id}
                onCommentCountChange={handleCommentCountChange}
              /> */}

              <CommentSection post={post} />
            </div>
          </ion-list>
        </ion-content>
      </Page>

      {PostCardScript}
    </>
  )
}

function CommentSection(attrs: { post: Post }, context: DynamicContext) {
  let post = attrs.post
  let comments = filter(proxy.comment, { post_id: post.id! })
  return (
    <div class="comment-section">
      <h3>評論 ({comments.length})</h3>
      <form method="POST" action={toRouteUrl(routes, '/post/comment/submit')}>
        <input hidden name="post_id" value={post.id} />
        <p>
          <textarea placeholder="寫下你的評論..." name="content" />
        </p>
        <ion-button type="submit">發送評論</ion-button>
      </form>
      <div class="comments-list">
        {mapArray(comments, comment => {
          let times = getTimes(comment as any)
          return (
            <div class="comments-item">
              <h4>{comment.user?.username}</h4>
              <div>{times.created_at ? new Date(Number(times.created_at) * 1000).toLocaleString('zh-HK', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false }) : ''}</div>
              <p>{comment.content}</p>
          
              <div class="sentiment-analysis" data-comment-id={comment.id}>

              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// 添加情感分析相關的樣式
let sentimentStyle = Style(/* css */ `
.sentiment-analysis {
  margin-top: 8px;
  padding: 4px 8px;
  background: #f5f5f5;
  border-radius: 4px;
  display: inline-block;
}

.sentiment-loading {
  color: #666;
  font-size: 12px;
}

.sentiment-display {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.sentiment-positive {
  color: #4CAF50;
}

.sentiment-negative {
  color: #F44336;
}

.sentiment-neutral {
  color: #FF9800;
}

.comment-sentiment-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 6px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 500;
  background: rgba(0,0,0,0.05);
}
`)

let addPage = (
  <>
    {Style(/* css */ `
#AddPostDetail .hint {
  margin-inline-start: 1rem;
  margin-block: 0.25rem;
}
`)}
    <ion-header>
      <ion-toolbar>
        <IonBackButton href="/post-detail" backText={pageTitle} />
        <ion-title role="heading" aria-level="1">
          {addPageTitle}
        </ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content id="AddPostDetail" class="ion-padding">
      <form
        method="POST"
        action="/post-detail/add/submit"
        onsubmit="emitForm(event)"
      >
        <ion-list>
          <ion-item>
            <ion-input
              name="title"
              label="Title*:"
              label-placement="floating"
              required
              minlength="3"
              maxlength="50"
            />
          </ion-item>
          <p class="hint">(3-50 characters)</p>
          <ion-item>
            <ion-input
              name="slug"
              label="Slug*: (unique url)"
              label-placement="floating"
              required
              pattern="(\w|-|\.){1,32}"
            />
          </ion-item>
          <p class="hint">
            (1-32 characters of: <code>a-z A-Z 0-9 - _ .</code>)
          </p>
        </ion-list>
        <div style="margin-inline-start: 1rem">
          <ion-button type="submit">Submit</ion-button>
        </div>
        <p>
          Remark:
          <br />
          *: mandatory fields
        </p>
        <p id="add-message"></p>
      </form>
    </ion-content>
  </>
)

function CommentList() {
  return (
    <div id="commentList">
      {mapArray(proxy.response, response => (
        <ion-item>
          <ion-list>
            {response.user?.username}:<ion-label>{response.content}</ion-label>
          </ion-list>
        </ion-item>
      ))}
    </div>
  )
}

function AddPage(attrs: {}, context: DynamicContext) {
  let user = getAuthUser(context)
  if (!user) return <Redirect href="/login" />
  return addPage
}

let submitParser = object({
  title: string({ minLength: 3, maxLength: 50 }),
  slug: string({ match: /^[\w-]{1,32}$/ }),
})

function Submit(attrs: {}, context: DynamicContext) {
  try {
    let user = getAuthUser(context)
    if (!user) throw 'You must be logged in to submit ' + pageTitle
    let body = getContextFormBody(context)
    let input = submitParser.parse(body)
    let id = items.push({
      title: input.title,
      slug: input.slug,
    })
    return <Redirect href={`/post-detail/result?id=${id}`} />
  } catch (error) {
    throwIfInAPI(error, '#add-message', context)
    return (
      <Redirect
        href={
          '/post-detail/result?' + new URLSearchParams({ error: String(error) })
        }
      />
    )
  }
}

function SubmitResult(attrs: {}, context: DynamicContext) {
  let params = new URLSearchParams(context.routerMatch?.search)
  let error = params.get('error')
  let id = params.get('id')
  return (
    <>
      <ion-header>
        <ion-toolbar>
          <IonBackButton href="/post-detail/add" backText="Form" />
          <ion-title role="heading" aria-level="1">
            Submitted {pageTitle}
          </ion-title>
        </ion-toolbar>
      </ion-header>
      <ion-content id="AddPostDetail" class="ion-padding">
        {error ? (
          renderError(error, context)
        ) : (
          <>
            <p>Your submission is received (#{id}).</p>
            <Link href="/post-detail" tagName="ion-button">
              Back to {pageTitle}
            </Link>
          </>
        )}
      </ion-content>
    </>
  )
}

function SubmitLikePost(attrs: {}, context: DynamicContext) {
  let post_id = context.routerMatch?.params.id
  let post = proxy.post[post_id]
  post.like_count++
  throw new MessageException([
    'batch',
    [
      /* update post header */
      [
        'update-text',
        `.post-header .like-button[data-post-id="${post_id}"] .like-button--count`,
        post.like_count.toString(),
      ],
      [
        'update-attrs',
        `.post-header .like-button[data-post-id="${post_id}"] .like-button--icon`,
        { name: 'heart' },
      ],

      /* update interactive section */
      [
        'update-text',
        `.interaction-section .like-button[data-post-id="${post_id}"] .like-button--count`,
        post.like_count.toString(),
      ],
      [
        'update-attrs',
        `.interaction-section .like-button[data-post-id="${post_id}"] .like-button--icon`,
        { name: 'heart' },
      ],
    ],
  ])
}

function SubmitPostComment(attrs: {}, context: DynamicContext) {
  let { post_id, content } = getContextFormBody(context) as any
  let user_id = getAuthUserId(context)
  if (!user_id) {
    throw new Error('You must be logged in to comment on posts.')
  }
  proxy.comment.push({
    post_id,
    content,
    user_id,
    created_at: Math.floor(Date.now() / 1000),
    updated_at: Math.floor(Date.now() / 1000),
  })
  // throw EarlyTerminate
  return (
    <Redirect
      href={toRouteUrl(routes, '/post/:id', { params: { id: post_id } })}
    />
  )
}

let routes = {
  '/post/:id': {
    resolve(context) {
      let t = evalLocale(pageTitle, context)
      return {
        title: title(t),
        description: 'TODO',
        node: <Main />,
      }
    },
  },
  '/post/:id/like': {
    title: apiEndpointTitle,
    description: 'increase post like count',
    node: <SubmitLikePost />,
  },
  '/post/comment/submit': {
    title: apiEndpointTitle,
    description: 'submit post comment',
    node: <SubmitPostComment />,
  },
  '/post-detail/add': {
    title: title(addPageTitle),
    description: 'TODO',
    node: <AddPage />,
    streaming: false,
  },
  '/post-detail/add/submit': {
    title: apiEndpointTitle,
    description: 'TODO',
    node: <Submit />,
    streaming: false,
  },
  '/post-detail/result': {
    title: apiEndpointTitle,
    description: 'TODO',
    node: <SubmitResult />,
    streaming: false,
  },
} satisfies Routes

export default { routes }
