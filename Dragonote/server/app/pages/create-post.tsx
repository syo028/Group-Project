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

let pageTitle = <Locale en="Create Post" zh_hk="所有貼文" zh_cn="Create Post" />
let addPageTitle = (
  <Locale en="Add Create Post" zh_hk="添加貼文" zh_cn="添加貼文" />
)

let style = Style(/* css */ `
#CreatePost {

}
`)

let page = (context: DynamicContext) => (
  <>
    {style}
    <ion-header>
      <ion-toolbar>
        <IonBackButton href="/" backText="Home" />
        <ion-title role="heading" aria-level="1">
          {pageTitle}
        </ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content id="CreatePost" class="ion-padding">
      <h2>所有貼文 (共 {proxy.post.length} 篇)</h2>
      <Main />
    </ion-content>
  </>
)

function Main(attrs: {}, context: DynamicContext) {
  let items = proxy.post
  let user = getAuthUser(context)
  return (
    <>
      <ion-list>
        {mapArray(items, item => (
          <ion-item>
            {item.user?.username} <br />
            {item.content}
          </ion-item>
        ))}
      </ion-list>
      {user ? (
        <Link href="/create-post/add" tagName="ion-button">
          {addPageTitle}
        </Link>
      ) : (
        <p>
          You can add create post after <Link href="/register">register</Link>.
        </p>
      )}
    </>
  )
}

let addPage = (
  <>
    {Style(/* css */ `
#AddCreatePost .hint {
  margin-inline-start: 1rem;
  margin-block: 0.25rem;
}
`)}
    <ion-header>
      <ion-toolbar>
        <IonBackButton href="/" backText="Home" />
        <ion-title role="heading" aria-level="1">
          {addPageTitle}
        </ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content id="AddCreatePost" class="ion-padding">
      <form
        method="POST"
        action="/create-post/add/submit"
        onsubmit="emitForm(event)"
      >
        <ion-list>
          <ion-item>
            <ion-select name="tags" label="標籤:" required>
              <ion-select-option value="Travel">Travel</ion-select-option>
              <ion-select-option value="Food">Food</ion-select-option>
              <ion-select-option value="Tech">Tech</ion-select-option>
              <ion-select-option value="Life">Life</ion-select-option>
              <ion-select-option value="Other">Other</ion-select-option>
            </ion-select>
          </ion-item>
          <ion-item>
            <ion-input
              name="title"
              label="標題:"
              label-placement="floating"
              required
              minlength="3"
              maxlength="50"
            />
          </ion-item>
          <p class="hint">(3-50 characters)</p>
          <ion-item>
            <ion-input
              name="photo_url"
              label="Photo: (unique url)"
              label-placement="floating"
            />
          </ion-item>
          <ion-item>
            <ion-input
              name="attach_photo"
              type="file"
              label="Attach Photo"
              label-placement="floating"
              accept="image/*"
            />
          </ion-item>
          <div>
            <ion-item>
              <ion-input
                name="content"
                label="內文: "
                label-placement="floating"
              />
            </ion-item>
          </div>
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

function AddPage(attrs: {}, context: DynamicContext) {
  let user = getAuthUser(context)
  if (!user) return <Redirect href="/login" />
  return addPage
}

let submitParser = object({
  tags: string(),
  title: string({ minLength: 3, maxLength: 50 }),
  content: string(),
  photo_url: string(),
})

function Submit(attrs: {}, context: DynamicContext) {
  try {
    let user = getAuthUser(context)
    if (!user) throw 'You must be logged in to submit ' + pageTitle
    let body = getContextFormBody(context)
    let input = submitParser.parse(body)

    let id = proxy.post.push({
      user_id: user.id!,
      tags: input.tags,
      title: input.title,
      content: input.content,
      like_count: 0,
      comment_count: 0,
      photo_url: input.photo_url || null,
      photo_upload: input.photo_upload || null,
    })

    return <Redirect href={`/create-post/result?id=${id}`} />
  } catch (error) {
    throwIfInAPI(error, '#add-message', context)
    return (
      <Redirect
        href={
          '/create-post/result?' + new URLSearchParams({ error: String(error) })
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
          <IonBackButton href="/create-post/add" backText="Form" />
          <ion-title role="heading" aria-level="1">
            Submitted {pageTitle}
          </ion-title>
        </ion-toolbar>
      </ion-header>
      <ion-content id="AddCreatePost" class="ion-padding">
        {error ? (
          renderError(error, context)
        ) : (
          <>
            <p>Your submission is received (#{id}).</p>
            <Link href="/create-post" tagName="ion-button">
              Back to {pageTitle}
            </Link>
          </>
        )}
      </ion-content>
    </>
  )
}

let routes = {
  '/create-post': {
    resolve(context: DynamicContext) {
      let t = evalLocale(pageTitle, context)
      return {
        title: title(t),
        description: 'TODO',
        node: page(context),
        streaming: false,
      }
    },
  },
  '/create-post/add': {
    title: title(addPageTitle),
    description: 'TODO',
    node: <AddPage />,
    streaming: false,
  },
  '/create-post/add/submit': {
    title: apiEndpointTitle,
    description: 'TODO',
    node: <Submit />,
    streaming: false,
  },
  '/create-post/result': {
    title: apiEndpointTitle,
    description: 'TODO',
    node: <SubmitResult />,
    streaming: false,
  },
} satisfies Routes

export default { routes }
