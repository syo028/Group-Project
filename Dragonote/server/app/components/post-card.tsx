import { Post } from '../../../db/proxy.js'
import { o } from '../jsx/jsx.js'
import { Script } from './script.js'
import Style from './style.js'

export let PostCardStyle = Style(/* css */ `

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
    justify-content: space-between;
    width: 100%;
    margin-bottom: 4px;
  }
  
    .post-tags {
      background-color: #007BFF; /* blue fill */
      color: white;              /* text color */
      padding: 4px 10px;
      border-radius: 12px;
      font-size: 0.875rem;
      font-weight: 600;
      user-select: none;
    }

  
  .tag {
    background-color: var(--ion-color-light);
    color: var(--ion-color-medium);
    padding: 2px 8px;
    border-radius: 12px;
    font-size: 12px;
    white-space: nowrap;
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

export let PostCardScript = Script(/* js */ `
`)

export function PostCard(attrs: { post: Post }) {
  let { post } = attrs
  return (
    <>
      <div class="post-content-info">
        <div class="post-header">
          <div class="post-content-Name">
            <strong>{post.user?.username}</strong>
            <ion-icon name="heart-outline"></ion-icon>
            <span>{post.like_count}</span>
            <ion-icon name="chatbubble-outline"></ion-icon>
            <span>{post.comment_count}</span>
          </div>
        </div>

        <div class="post-header">
          <div class="post-content-Title">{post.title}</div>
          <div class="post-tags">{post.tags}</div>
        </div>
        {post.photo_url && (
          <img src={post.photo_url} alt="post image" class="post-photo" />
        )}
        <p></p>

        <div class="post-timestamp">created at: {post.created_at}</div>
      </div>
    </>
  )
}

export default PostCard
