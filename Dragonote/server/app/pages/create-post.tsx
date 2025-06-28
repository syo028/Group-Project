import { o } from '../jsx/jsx.js'
import { ResolvedPageRoute, Routes, StaticPageRoute } from '../routes.js'
import { apiEndpointTitle, title } from '../../config.js'
import Style from '../components/style.js'
import {
  Context,
  DynamicContext,
  ExpressContext,
  getContextFormBody,
  throwIfInAPI,
  WsContext,
} from '../context.js'
import { mapArray } from '../components/fragment.js'
import { IonBackButton } from '../components/ion-back-button.js'
import { object, string } from 'cast.ts'
import { Link, Redirect } from '../components/router.js'
import { renderError } from '../components/error.js'
import { getAuthUser } from '../auth/user.js'
import { evalLocale, Locale, Title } from '../components/locale.js'
import { proxy } from '../../../db/proxy.js'
import { Script } from '../components/script.js'
import { loadClientPlugin } from '../../client-plugin.js'
import {
  loadImageClassifierModel,
  loadImageModel,
  PreTrainedImageModels,
} from 'tensorflow-helpers'
import { writeFile } from 'fs/promises'
import { EarlyTerminate } from '../../exception.js'

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

// let imageAIPlugin = loadClientPlugin({
//   entryFile: 'dist/client/image-ai.js',
// })

let addPageScript = Script(/* js */ `
function updateImage() {
  let url = createPostForm.photo_url.value
  console.log('loading image:', url)
  // preview_image.onload = () => {
  //   console.log('image loaded:', preview_image.naturalWidth + 'x' + preview_image.naturalHeight)
  //   preview_canvas.width = preview_image.naturalWidth
  //   preview_canvas.height = preview_image.naturalHeight
  //   let context = preview_canvas.getContext('2d')
  //   context.drawImage(preview_image, 0, 0)
  //   let dataUrl = preview_canvas.toDataURL('image/jpeg')
  //   classifyImage(dataUrl)
  // }
  preview_image.src = url
  emit('/image-classify', url)
}
function updateLabel(result) {
  console.log('update label:', result)
  result.sort((a,b) => b.confidence - a.confidence)
  let class_name = result[0].label
  if (class_name === 'Others' || class_name === 'Funny') {
    class_name = 'Other'
  }
  let label = createPostForm.querySelector('ion-select[name="tags"]')
  label.setAttribute('value', class_name)
  preview_result.textContent = 'Classified as: ' + class_name
  for (let item of result) {
    let line = document.createElement('div')
    line.textContent = item.label + ': ' + (item.confidence * 100).toFixed(2) + '%'
    preview_result.appendChild(line)
  }
}
`)

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
        id="createPostForm"
        method="POST"
        action="/create-post/add/submit"
        onsubmit="emitForm(event)"
      >
        <ion-list>
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
              oninput="updateImage()"
            />
          </ion-item>
          <div>
            <div>Preview:</div>
            <img id="preview_image" crossorigin="anonymous" />
            <canvas id="preview_canvas" hidden></canvas>
            <div id="preview_result"></div>
          </div>
          <ion-item>
            <ion-select name="tags" label="標籤:" required>
              <ion-select-option value="Travel">Travel</ion-select-option>
              <ion-select-option value="Food">Food</ion-select-option>
              <ion-select-option value="Nail">Nail</ion-select-option>
              <ion-select-option value="Other">Other</ion-select-option>
            </ion-select>
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
    {/* {imageAIPlugin.node} */}
    {addPageScript}
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
    let body = getContextFormBody(context) as FormData
    let input = submitParser.parse(body)

    let id = proxy.post.push({
      user_id: user.id!,
      tags: input.tags,
      title: input.title,
      content: input.content,
      like_count: 0,
      comment_count: 0,
      photo_url: input.photo_url || null,
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
            <Link href="/" tagName="ion-button">
              Back to {pageTitle}
            </Link>
          </>
        )}
      </ion-content>
    </>
  )
}

console.log('loading base image model...')
let baseModel = await loadImageModel({
  spec: PreTrainedImageModels.mobilenet['mobilenet-v3-large-100'],
  dir: 'saved_models/base_model',
})

console.log('loading classifier model...')
let classifier = await loadImageClassifierModel({
  baseModel,
  modelDir: 'saved_models/classifier_model',
  datasetDir: 'dataset',
})

async function ClassifyImageUrl(context: WsContext): Promise<StaticPageRoute> {
  let url = context.args?.[0] as string
  let file = 'image.jpg'
  let res = await fetch(url)
  let arrayBuffer = await res.arrayBuffer()
  let bytes = new Uint8Array(arrayBuffer)
  let buffer = Buffer.from(bytes)
  await writeFile(file, buffer)
  let result = await classifier.classifyImageFile(file)
  console.log('classification result:', result)
  context.ws.send(['eval', `updateLabel(${JSON.stringify(result)})`])
  throw EarlyTerminate
  return {
    title: apiEndpointTitle,
    description: 'run image classification on given image url',
    node: (
      <pre>
        <code>{JSON.stringify(result, null, 2)}</code>
      </pre>
    ),
  }
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
  '/image-classify': {
    resolve(context) {
      return ClassifyImageUrl(context as WsContext)
    },
    streaming: false,
  },
  '/create-post/add': {
    title: <Title t={addPageTitle} />,
    // title: title('添加貼文'),
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
