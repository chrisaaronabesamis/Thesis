import fetchThreads from "../../services/bini_services/thread/thread-api.js";
import {
  getComments as apiGetComments,
  createComment as apiCreateComment,
} from "../../services/bini_services/post/create-comment-api.js";
import { BINI_API_URL } from "../../config/bini-api.js";

function navigateHome() {
  history.back();
}

function attachCloseButton(root) {
  const btn = root.querySelector(".thread-topic-close");
  if (btn) btn.addEventListener("click", navigateHome);
}

export default async function ThreadTopic(params) {
  const root = this.root;
  // params may be an array of capture groups or an object with named groups
  let threadId;
  if (Array.isArray(params)) {
    threadId = params[0];
  } else if (params && typeof params === "object") {
    threadId = params.id || Object.values(params)[0];
  } else {
    threadId = params;
  }

  try {
    const threads = await fetchThreads();
    const thread = threads.find((t) => String(t.id) === String(threadId));

    if (!thread) {
      root.innerHTML = `
        <div class="thread-topic-container">
          <button type="button" class="thread-topic-close" aria-label="Close">×</button>
          <div class="thread-not-found">
            <h2>Thread not found</h2>
            <p>The thread you're looking for doesn't exist.</p>
            <a href="/">Go back to home</a>
          </div>
        </div>
      `;
      attachCloseButton(root);
      return;
    }

    root.innerHTML = `
      <div class="thread-topic-container">
        <button type="button" class="thread-topic-close" aria-label="Close">×</button>
        <div class="thread-topic-header">
          <div class="thread-topic-meta">
            <div class="thread-topic-date">${thread.date}</div>
            <div class="thread-topic-venue">📍 ${thread.venue}</div>
          </div>
          <h1 class="thread-topic-title">
            ${thread.isPinned ? "📌 " : ""}${thread.title}
          </h1>
          <div class="thread-topic-author">By ${thread.author}</div>
        </div>

        <div class="thread-topic-content">
          <div class="thread-discussion">
            <h2 class="discussion-header">Discussion</h2>
            <div class="discussion-area">
              <div class="comments-list" aria-live="polite"></div>

              <form class="create-comment-form" style="margin-top:12px;">
                <textarea name="comment" class="create-comment-input" rows="3" placeholder="Write a comment..." style="width:100%;padding:8px;resize:vertical;"></textarea>
                <div style="text-align:right;margin-top:6px;">
                  <button type="submit" class="btn btn-primary btn-sm">Comment</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    `;
    attachCloseButton(root);

    // --- Comments logic ---
    const commentsListEl = root.querySelector(".comments-list");
    const createForm = root.querySelector(".create-comment-form");

    function saveLocalComments(comments) {
      const key = `thread-comments-${threadId}`;
      localStorage.setItem(key, JSON.stringify(comments));
    }

    function escapeHtml(str) {
      return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    }

    function renderComments(comments) {
      commentsListEl.innerHTML = "";
      if (!comments.length) {
        commentsListEl.innerHTML = `<div class="no-comments">Be the first to comment on this thread.</div>`;
        return;
      }

      comments.forEach((comment) => {
        const commentEl = document.createElement("div");
        commentEl.className = "comment-item";
        commentEl.innerHTML = `
          <div class="comment-meta"><strong>${comment.author || "You"}</strong> · <span class="comment-date">${comment.date || ""}</span></div>
          <div class="comment-body">${escapeHtml(comment.content)}</div>
          <div class="comment-actions"><button class="reply-btn btn-link" data-id="${comment.id}">Reply</button></div>
          <div class="replies-container"></div>
        `;

        const repliesContainer = commentEl.querySelector(".replies-container");
        if (comment.replies && comment.replies.length) {
          comment.replies.forEach((r) => {
            const rEl = document.createElement("div");
            rEl.className = "reply-item";
            rEl.innerHTML = `<div class="reply-meta"><strong>${r.author || "You"}</strong> · <span class="reply-date">${r.date || ""}</span></div><div class="reply-body">${escapeHtml(r.content)}</div>`;
            repliesContainer.appendChild(rEl);
          });
        }

        commentsListEl.appendChild(commentEl);
      });

      commentsListEl.querySelectorAll(".reply-btn").forEach((btn) => {
        btn.addEventListener("click", () => toggleReplyForm(btn.dataset.id));
      });
    }

    function toggleReplyForm(commentId) {
      const btn = commentsListEl.querySelector(
        `.reply-btn[data-id="${commentId}"]`,
      );
      if (!btn) return;
      const commentEl = btn.closest(".comment-item");
      let form = commentEl.querySelector(".reply-form");
      if (form) {
        form.remove();
        return;
      }

      form = document.createElement("form");
      form.className = "reply-form";
      form.innerHTML = `
        <textarea name="reply" placeholder="Write a reply..." rows="2"></textarea>
        <div><button type="submit">Reply</button></div>
      `;

      form.addEventListener("submit", async (ev) => {
        ev.preventDefault();
        const content = form
          .querySelector('textarea[name="reply"]')
          .value.trim();
        if (!content) return;
        await submitReply(commentId, content);
        form.remove();
        await loadComments();
      });

      commentEl.appendChild(form);
      form.querySelector("textarea").focus();
    }

    async function submitReply(commentId, content) {
      try {
        const resp = await fetch(
          `${BINI_API_URL}/comments/reply/${commentId}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("authToken") || ""}`,
              apikey: "thread",
            },
            body: JSON.stringify({ content }),
          },
        );
        if (!resp.ok) throw new Error("Reply failed");
        return await resp.json();
      } catch (err) {
        const key = `thread-comments-${threadId}`;
        const raw = localStorage.getItem(key);
        const comments = raw ? JSON.parse(raw) : [];
        const idx = comments.findIndex(
          (c) => String(c.id) === String(commentId),
        );
        if (idx !== -1) {
          comments[idx].replies = comments[idx].replies || [];
          comments[idx].replies.push({
            id: Date.now(),
            content,
            author: "You",
            date: new Date().toLocaleString(),
          });
          saveLocalComments(comments);
        }
      }
    }

    async function submitComment(content) {
      try {
        const token = localStorage.getItem("authToken") || "";
        const result = await apiCreateComment(threadId, content, token);
        return result;
      } catch (err) {
        const key = `thread-comments-${threadId}`;
        const raw = localStorage.getItem(key);
        const comments = raw ? JSON.parse(raw) : [];
        const newComment = {
          id: Date.now(),
          content,
          author: "You",
          date: new Date().toLocaleString(),
          replies: [],
        };
        comments.unshift(newComment);
        saveLocalComments(comments);
        return newComment;
      }
    }

    function normalizeComment(c) {
      if (!c) return null;
      const date = c.created_at ? new Date(c.created_at).toLocaleString() : (c.date || "");
      return {
        id: c.comment_id ?? c.id,
        author: c.fullname ?? c.username ?? c.author ?? "Unknown",
        date,
        content: c.content ?? "",
        replies: (c.replies || []).map((r) => ({
          id: r.comment_id ?? r.id,
          author: r.fullname ?? r.username ?? r.author ?? "Unknown",
          date: r.created_at ? new Date(r.created_at).toLocaleString() : (r.date || ""),
          content: r.content ?? "",
        })),
      };
    }

    async function loadComments() {
      let comments = [];
      try {
        const raw = await apiGetComments(
          threadId,
          localStorage.getItem("authToken"),
        );
        comments = (Array.isArray(raw) ? raw : []).map(normalizeComment).filter(Boolean);
      } catch (err) {
        const key = `thread-comments-${threadId}`;
        const raw = localStorage.getItem(key);
        comments = raw ? JSON.parse(raw) : [];
      }
      renderComments(comments || []);
    }

    createForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const ta = createForm.querySelector('textarea[name="comment"]');
      const content = ta.value.trim();
      if (!content) return;
      await submitComment(content);
      ta.value = "";
      await loadComments();
    });

    loadComments();
  } catch (error) {
    console.error("Error loading thread topic:", error);
    root.innerHTML = `
      <div class="thread-topic-container">
        <button type="button" class="thread-topic-close" aria-label="Close">×</button>
        <div class="thread-error">
          <h2>Error loading thread</h2>
          <p>Something went wrong while loading this thread.</p>
          <a href="/">Go back to home</a>
        </div>
      </div>
    `;
    attachCloseButton(root);
  }
}
