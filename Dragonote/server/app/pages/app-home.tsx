import { proxy } from '../../../db/proxy.js'
import { loadClientPlugin } from '../../client-plugin.js'
import { title } from '../../config.js'
import { toRouteUrl } from '../../url.js'
import { getAuthUser } from '../auth/user.js'
import { appIonTabBar } from '../components/app-tab-bar.js'
import { mapArray } from '../components/fragment.js'
import { IonButton } from '../components/ion-button.js'
import PostCard, {
  PostCardScript,
  PostCardStyle,
} from '../components/post-card.js'
import { Link } from '../components/router.js'
import { Script } from '../components/script.js'
import Style from '../components/style.js'
import { wsStatus } from '../components/ws-status.js'
import { Context } from '../context.js'
import { prerender } from '../jsx/html.js'
import { o } from '../jsx/jsx.js'
import { PageRoute, Routes } from '../routes.js'
import { fitIonFooter, selectIonTab } from '../styles/mobile-style.js'
import { characters } from './app-character.js'
import CreatePost from './create-post.js'

let pageTitle = 'Home'

let style = Style(/* css */ `
/* This explicit height is necessary when using ion-menu */
#main-content {
  height: 100%;
}

ion-title {
  text-align: center;
  position: absolute;
  left: 0;
  right: 0;
  margin: 0 auto;
}

.post-row {
  margin-bottom: 16px;
  --padding-start: 0;
  --inner-padding-end: 0;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease;
}

.post-row:hover {
  transform: translateY(-2px);
}

.show-tags {
  font-size: 12px;
  margin-top: 4px;
}

.post-stats {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-top: 8px;
  color: var(--ion-color-medium);
}

.post-stat {
  display: flex;
  align-items: center;
  gap: 4px;
}

.post-stat ion-icon {
  font-size: 16px;
}
`)

let script = Script(/* javascript */ `
function selectMenu(event, flag) {
  let item = event.currentTarget
  showToast('Selected ' + item.textContent)
  if (flag == 'close') {
    let menu = item.closest('ion-menu')
    menu.close()
  }
}
`)

let sweetAlertPlugin = loadClientPlugin({
  entryFile: 'dist/client/sweetalert.js',
})

let homePage = (
  <>
    {PostCardStyle}
    {style}
    <ion-header>
      <ion-toolbar color="primary">
        <ion-buttons slot="start">
          <ion-menu-button></ion-menu-button>
        </ion-buttons>
        <ion-title role="heading" aria-level="1">
          Droganote
        </ion-title>
        <ion-buttons slot="end">
          <Link tagName="ion-button" href="/login" class="ion-margin-top">
            Login{' '}
          </Link>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          marginBottom: '20px',
        }}
      >
        <img
          src="/logo.png.jpeg"
          alt="logo"
          style={{
            margin: 'auto',
            height: '1px',
            width: '1px',
          }}
        />
      </div>
      <h2 class="ion-text-center">Welcome!</h2>

      <CreateSection />

      <hr />
      {postsList()}
    </ion-content>

    <ion-footer>
      {appIonTabBar}
      {selectIonTab('home')}
    </ion-footer>
    {fitIonFooter}
    {script}
    {PostCardScript}
  </>
)

function CreateSection(attrs: {}, context: Context) {
  let user = getAuthUser(context)

  return (
    <>
      <div className="ion-text-center">
        <IonButton
          url={toRouteUrl(CreatePost.routes, '/create-post/add')}
          disabled={user ? true : undefined}
        >
          Create Your New Post
        </IonButton>

        {user && (
          <div style="margin-top: 16px;">
            <Link
              tagName="ion-button"
              href="/recommendations"
              color="secondary"
            >
              <ion-icon name="star-outline" slot="start"></ion-icon>
              查看推薦貼文
            </Link>
          </div>
        )}
      </div>
    </>
  )
}

function postsList() {
  let posts = proxy.post
  if (posts.length == 0) {
    return <p>No Any Post</p>
  }
  return (
    <>
      <ion-list>
        {mapArray(posts, post => (
          <Link tagName="ion-item" href={'/post/' + post.id} class="post-row">
            <PostCard post={post} />
            <div class="post-stats"></div>
          </Link>
        ))}
      </ion-list>
    </>
  )
}
// pre-render into html to reduce time to first contentful paint (FCP)
homePage = prerender(homePage)

let homeRoute: PageRoute = {
  title: title(pageTitle),
  description:
    'List of fictional characters commonly used as placeholders in discussion about cryptographic systems and protocols.',
  menuText: 'Ionic App',
  menuFullNavigate: true,
  node: homePage,
}

let routes = {
  '/': homeRoute,
  '/app/home': homeRoute,
} satisfies Routes

export default { routes }
