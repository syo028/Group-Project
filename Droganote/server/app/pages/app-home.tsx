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

let posts = [
  {
    id: 1,
    username: 'John Doe',
    title: 'Post 1',
    description: `This is an apple.`,
    likes: 10,
    comments: 5,
    tags: ['tag1', 'tag2', 'tag3'],
    photos: 'https://picsum.photos/200',
    created_at: '21May2025 11:00',
    updated_at: '21May2025 11:00',
  },
  {
    id: 2,
    username: 'Jane Doe',
    title: 'Post 2',
    description: `This is an apple.`,
    likes: 20,
    comments: 10,
    tags: ['tag4', 'tag5', 'tag6'],
    photos: 'https://picsum.photos/200',
    created_at: '21May2025 11:00',
    updated_at: '21May2025 11:00',
  },
  {
    id: 3,
    username: 'John Smith',
    title: 'Post 3',
    description: `This is an apple.`,
    likes: 30,
    comments: 15,
    tags: ['tag7', 'tag8', 'tag9'],
    photos: 'https://picsum.photos/200',
    created_at: '21May2025 11:00',
    updated_at: '21May2025 11:00',
  },
]

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
  margin-top: 10px;
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
      <p>Total number of posts: {posts.length}</p>

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
              <div class="post-timestamp">{post.created_at}</div>
            </div>
          </Link>
        ))}
      </ion-list>
    </ion-content>

    <ion-footer>
      {appIonTabBar}
      {selectIonTab('home')}
    </ion-footer>
    {fitIonFooter}
    {script}
  </>
)

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
