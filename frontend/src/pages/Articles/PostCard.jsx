import { Link } from 'react-router-dom';
import { CoverImage } from '@/components/ui/CoverImage';
import { formatDate } from '@/lib/format';
import { cx } from '@/lib/cx';
import { postPath } from './postParams';

/** Article / blog card. The whole card is clickable through the title link overlay. */
export function PostCard({ post, featured = false }) {
  return (
    <article className={cx('post-card', featured && 'post-card--featured')}>
      <div className="post-card__cover">
        <CoverImage src={post.cover_image} alt={post.cover_image_alt || ''} seed={post.slug} ratio="16 / 10" />
      </div>
      <div className="post-card__body">
        <p className="post-card__meta">
          {post.category && <span className="post-card__category">{post.category.name}</span>}
          {post.published_at && <time dateTime={post.published_at}>{formatDate(post.published_at)}</time>}
        </p>
        <h3 className="post-card__title">
          <Link to={postPath(post)} className="post-card__link">
            {post.title}
          </Link>
        </h3>
        {post.excerpt && <p className="post-card__excerpt">{post.excerpt}</p>}
        <p className="post-card__foot">
          {post.author?.name && <span>{post.author.name}</span>}
          {post.reading_minutes ? <span>{post.reading_minutes} min read</span> : null}
        </p>
      </div>
    </article>
  );
}
