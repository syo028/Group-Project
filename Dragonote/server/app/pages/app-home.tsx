import { proxy } from '../../../db/proxy.js'
import { loadClientPlugin } from '../../client-plugin.js'
import { title } from '../../config.js'
import { appIonTabBar } from '../components/app-tab-bar.js'
import { mapArray } from '../components/fragment.js'
import { Link } from '../components/router.js'
import { Script } from '../components/script.js'
import Style from '../components/style.js'
import { wsStatus } from '../components/ws-status.js'
import { prerender } from '../jsx/html.js'
import { o } from '../jsx/jsx.js'
import { PageRoute, Routes } from '../routes.js'
import { fitIonFooter, selectIonTab } from '../styles/mobile-style.js'
import { characters } from './app-character.js'

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

.post-stats {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-left: auto;
}

.post-content-Name {
  font-size: 15px;
  color: var(--ion-color-primary);
  display: flex;
  align-items: center;
  gap: 8px;
}

.post-content-Title {
  font-size: 20px;
  font-weight: bold;
  color: #222;
  margin-top: 2px;
  line-height: 1.3;
}

.post-content-info {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
  margin-top: 15px;
  width: 100%;
}

.post-header {
  display: flex;
  align-items: center;
  width: 100%;
  margin-bottom: 4px;
}

.post-photo {
  width: 100%;
  height: auto;
  max-width: 400px;
  border-radius: 8px;
  margin-top: 10px;
  display: block;
}

.post-timestamp {
  font-size: 12px;
  color: #666;
  margin-top: 4px;
}

.post-row {
  margin-bottom: 16px;
  --padding-start: 0;
  --inner-padding-end: 0;
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
          <Link
            tagName="ion-button"
            href="/login"
            fill="block"
            color="primary"
            class="ion-margin-top"
          >
            Login
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
            height: '10px',
            width: '10px',
          }}
        />
      </div>
      <h2>Welcome !</h2>

      <hr />
      {postsList()}
    </ion-content>

    <ion-footer>
      {appIonTabBar}
      {selectIonTab('home')}
    </ion-footer>
    {fitIonFooter}
    {script}
  </>
)

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
            <div class="post-content-info">
              <div class="post-header">
                <div class="post-content-Name">
                  <strong>{post.username}</strong>
                  <ion-icon name="heart-outline"></ion-icon>
                  <span>{post.likes}</span>
                  <ion-icon name="chatbubble-outline"></ion-icon>
                  <span>{post.comments}</span>
                </div>
              </div>
              <div class="post-content-Title">{post.title}</div>
              <img src={post.photos} alt="post image" class="post-photo" />
              <div class="post-timestamp">created at: {post.created_at}</div>
            </div>
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
