import { useEffect, useMemo, useRef, useState } from "react";

function toTime(value) {
  const ts = Date.parse(value || "");
  if (Number.isNaN(ts)) return "Just now";
  return new Date(ts).toLocaleString();
}

function toHandle(value = "") {
  return String(value || "fan")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "") || "fan";
}

function toAvatarSeed(value = "") {
  const text = String(value || "").trim();
  if (!text) return "F";
  return text.charAt(0).toUpperCase();
}

export default function CommunityFeed({
  posts = [],
  onCreatePost,
  onLikePost,
  onRepost,
  onUpdatePost,
  onDeletePost,
  commentsByPost = {},
  commentLoadingByPost = {},
  onToggleComments,
  onAddComment,
  onAddReply,
  loading = false,
  isLoggedIn = false,
  currentUserId = null,
  onLoadMore,
  hasMore = false,
  loadingMore = false,
}) {
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [status, setStatus] = useState("");
  const [commentDrafts, setCommentDrafts] = useState({});
  const [replyDrafts, setReplyDrafts] = useState({});
  const [editingPostId, setEditingPostId] = useState(null);
  const [editDraft, setEditDraft] = useState("");
  const loadMoreRef = useRef(null);

  const feedPosts = useMemo(() => {
    return [...posts].sort((a, b) => {
      const aTs = Date.parse(a.createdAt || "") || 0;
      const bTs = Date.parse(b.createdAt || "") || 0;
      return bTs - aTs;
    });
  }, [posts]);

  async function submitPost(event) {
    event.preventDefault();
    setStatus("");
    if (!content.trim()) return;
    try {
      const payload = { content: content.trim() };
      if (imageUrl.trim()) payload.img_url = imageUrl.trim();
      await onCreatePost?.(payload);
      setContent("");
      setImageUrl("");
      setStatus("Posted.");
    } catch (error) {
      setStatus(error?.response?.data?.error || "Post failed.");
    }
  }

  useEffect(() => {
    if (!hasMore || loading || loadingMore) return;
    const target = loadMoreRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) return;
        onLoadMore?.();
      },
      { rootMargin: "320px 0px" },
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [hasMore, loading, loadingMore, onLoadMore, feedPosts.length]);

  return (
    <section id="community-feed" className="panel">
      <div className="community-shell">
        <div className="community-main">
          <div id="community-compose" className="community-composer">
            {isLoggedIn ? (
              <form className="post-form" onSubmit={submitPost}>
                <textarea
                  value={content}
                  onChange={(event) => setContent(event.target.value)}
                  placeholder="What's new in your fan community?"
                  maxLength={500}
                />
                <input
                  value={imageUrl}
                  onChange={(event) => setImageUrl(event.target.value)}
                  placeholder="Image URL (optional)"
                />
                {imageUrl.trim() ? (
                  <div className="composer-image-preview">
                    <img
                      src={imageUrl}
                      alt="Post preview"
                      onError={(event) => {
                        event.currentTarget.style.display = "none";
                      }}
                    />
                  </div>
                ) : null}
                <div className="composer-foot">
                  <small className="muted">{content.length}/500</small>
                  <button type="submit">Post</button>
                </div>
              </form>
            ) : (
              <p className="muted">Login first to create posts and interact in community.</p>
            )}
          </div>
          {status ? <p className="muted">{status}</p> : null}

          <div id="community-discover" />

          {loading ? <p className="muted">Loading feed...</p> : null}
          {!loading && feedPosts.length === 0 ? <p className="muted">No posts yet.</p> : null}

          <div className="feed-list">
            {feedPosts.map((post) => (
              <article key={post.id} className="feed-card thread-card thread-post">
                <div className="thread-post-avatar">{toAvatarSeed(post.author)}</div>
                <div className="thread-post-main">
                  <div className="feed-head">
                    <div>
                      <strong>{post.author}</strong>
                      <span className="muted"> @{toHandle(post.author)}</span>
                    </div>
                    <span className="muted">{toTime(post.createdAt)}</span>
                  </div>
                  {editingPostId === post.id ? (
                    <form
                      className="edit-post-form"
                      onSubmit={async (event) => {
                        event.preventDefault();
                        const text = editDraft.trim();
                        if (!text) return;
                        await onUpdatePost?.(post.id, text);
                        setEditingPostId(null);
                        setEditDraft("");
                      }}
                    >
                      <textarea value={editDraft} onChange={(event) => setEditDraft(event.target.value)} maxLength={500} />
                      <div className="feed-actions">
                        <button type="submit">Save</button>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingPostId(null);
                            setEditDraft("");
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  ) : (
                    <p>{post.content}</p>
                  )}
                  {post.image ? <img src={post.image} alt="post" /> : null}
                  {post.tags.length ? <p className="muted">#{post.tags.join(" #")}</p> : null}
                  {isLoggedIn ? (
                    <div className="feed-actions thread-actions">
                      <button type="button" onClick={() => onLikePost?.(post.id)}>
                        <span aria-hidden="true">Heart</span> {post.likeCount || 0}
                      </button>
                      <button type="button" onClick={() => onToggleComments?.(post.id)}>
                        <span aria-hidden="true">Reply</span>
                      </button>
                      <button type="button" onClick={() => onRepost?.(post.id)}>
                        <span aria-hidden="true">Repost</span>
                      </button>
                      {String(post.userId || "") === String(currentUserId || "") ? (
                        <>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingPostId(post.id);
                              setEditDraft(post.content || "");
                            }}
                          >
                            <span aria-hidden="true">Edit</span>
                          </button>
                          <button type="button" className="danger-btn" onClick={() => onDeletePost?.(post.id)}>
                            <span aria-hidden="true">Delete</span>
                          </button>
                        </>
                      ) : null}
                    </div>
                  ) : null}

                  {commentsByPost[post.id] ? (
                    <div className="comments-block">
                      {isLoggedIn ? (
                        <form
                          className="comment-form"
                          onSubmit={async (event) => {
                            event.preventDefault();
                            const text = (commentDrafts[post.id] || "").trim();
                            if (!text) return;
                            await onAddComment?.(post.id, text);
                            setCommentDrafts((prev) => ({ ...prev, [post.id]: "" }));
                          }}
                        >
                          <input
                            value={commentDrafts[post.id] || ""}
                            onChange={(event) => setCommentDrafts((prev) => ({ ...prev, [post.id]: event.target.value }))}
                            placeholder="Write a comment..."
                          />
                          <button type="submit">Comment</button>
                        </form>
                      ) : null}

                      {commentLoadingByPost[post.id] ? <p className="muted">Loading comments...</p> : null}

                      {(commentsByPost[post.id] || []).map((comment) => (
                        <article key={comment.id} className="comment-card">
                          <p>
                            <strong>{comment.author}</strong> {comment.content}
                          </p>
                          {isLoggedIn ? (
                            <form
                              className="reply-form"
                              onSubmit={async (event) => {
                                event.preventDefault();
                                const key = `${post.id}:${comment.id}`;
                                const text = (replyDrafts[key] || "").trim();
                                if (!text) return;
                                await onAddReply?.(post.id, comment.id, text);
                                setReplyDrafts((prev) => ({ ...prev, [key]: "" }));
                              }}
                            >
                              <input
                                value={replyDrafts[`${post.id}:${comment.id}`] || ""}
                                onChange={(event) =>
                                  setReplyDrafts((prev) => ({ ...prev, [`${post.id}:${comment.id}`]: event.target.value }))
                                }
                                placeholder="Write a reply..."
                              />
                              <button type="submit">Reply</button>
                            </form>
                          ) : null}
                          {comment.replies.map((reply) => (
                            <p key={reply.id} className="reply-item">
                              <strong>{reply.author}</strong> {reply.content}
                            </p>
                          ))}
                        </article>
                      ))}
                    </div>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
          <div ref={loadMoreRef} className="feed-load-sentinel" />
          {loadingMore ? <p className="muted">Loading more posts...</p> : null}
          {!hasMore && !loading ? <p className="muted">No more posts.</p> : null}
        </div>

        {/* Right rail: condensed thread list */}
        <aside className="community-right" aria-label="Community Threads">
          <div className="community-rail-card">
            <h3 style={{ marginBottom: 8 }}>Community Threads</h3>
            {feedPosts.slice(0, 6).map((t) => (
              <div key={t.id} style={{ marginBottom: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                  <small className="muted">{toTime(t.createdAt)}</small>
                  {t.pinned ? <small style={{ color: 'var(--accent)', fontWeight: 700 }}>PINNED</small> : null}
                </div>
                <div style={{ padding: '8px 10px', borderRadius: 8, background: 'rgba(255,255,255,0.02)' }}>
                  <div style={{ fontSize: 13, lineHeight: '1.2em' }}>{(t.content || '').slice(0, 160) || (t.title || 'Untitled')}</div>
                </div>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </section>
  );
}
