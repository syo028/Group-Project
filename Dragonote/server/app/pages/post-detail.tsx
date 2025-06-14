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
import { getAuthUser } from '../auth/user.js'
import { evalLocale, Locale } from '../components/locale.js'
import { proxy } from '../../../db/proxy.js'
import { Page } from '../components/page.js'
import PostCard, {
  PostCardScript,
  PostCardStyle,
} from '../components/post-card.js'
import { validateUsername } from '../validate/user.js'
import { CommentSection } from '../../client/jsx/components/CommentSection.js'
import { LikeButton } from '../../client/jsx/components/LikeButton.js'

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
  margin-top: 24px;
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
              <LikeButton
                postId={post.id}
                initialLikeCount={post.like_count}
                onLikeCountChange={handleLikeCountChange}
              />
            </div>

            <div class="comments-section">
              <div class="comments-header">
                <ion-icon name="chatbubble-outline"></ion-icon>
                <span>Comments</span>
              </div>
              <CommentSection
                postId={post.id}
                onCommentCountChange={handleCommentCountChange}
              />
            </div>
          </ion-list>
        </ion-content>
      </Page>

      {PostCardScript}
    </>
  )
}

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
