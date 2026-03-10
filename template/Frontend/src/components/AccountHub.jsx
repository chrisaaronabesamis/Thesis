import { useEffect, useMemo, useState } from "react";
import {
  followUser,
  getFollowers,
  getFollowing,
  getMessagePreviews,
  getMessages,
  getMyPosts,
  getMyReposts,
  getNotifications,
  getSuggestedFollowers,
  markMessagesRead,
  searchUsers,
  sendMessage,
  unfollowUser,
  updateUserProfile,
} from "../services/api";
import {
  normalizeMessages,
  normalizeNotifications,
  normalizeSimpleUsers,
} from "../services/normalize";

export default function AccountHub({ profile, isLoggedIn = false, onProfileRefresh, communityView = "all" }) {
  const [searchKeyword, setSearchKeyword] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [activeChatUserId, setActiveChatUserId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageDraft, setMessageDraft] = useState("");
  const [profileForm, setProfileForm] = useState({ fullname: "", profile_picture: "" });
  const [status, setStatus] = useState("");
  const [myPosts, setMyPosts] = useState([]);
  const [myReposts, setMyReposts] = useState([]);
  const [timelineTab, setTimelineTab] = useState("all");
  const [timelineQuery, setTimelineQuery] = useState("");

  function mapTimelinePosts(payload) {
    const list = Array.isArray(payload) ? payload : [];
    return list.map((item, index) => ({
      id: item.post_id || item.id || `timeline-${index}`,
      content: item.content || "",
      image: item.img_url || item.image_url || "",
      createdAt: item.created_at || "",
      author: item.fullname || profile?.user?.fullname || "You",
    }));
  }

  useEffect(() => {
    setProfileForm({
      fullname: profile?.user?.fullname || "",
      profile_picture: profile?.user?.profile_picture || "",
    });
  }, [profile?.user?.fullname, profile?.user?.profile_picture]);

  useEffect(() => {
    if (!isLoggedIn) return;
    refreshAll();
  }, [isLoggedIn]);

  async function refreshAll() {
    try {
      const [suggestedRes, followersRes, followingRes, notifRes, previewRes, myPostsRes, myRepostsRes] =
        await Promise.allSettled([
          getSuggestedFollowers(10, 0),
          getFollowers(),
          getFollowing(),
          getNotifications(),
          getMessagePreviews(),
          getMyPosts(),
          getMyReposts(),
        ]);

      if (suggestedRes.status === "fulfilled") {
        setSuggestedUsers(normalizeSimpleUsers(suggestedRes.value));
      }
      if (followersRes.status === "fulfilled") {
        setFollowers(normalizeSimpleUsers(followersRes.value));
      }
      if (followingRes.status === "fulfilled") {
        setFollowing(normalizeSimpleUsers(followingRes.value));
      }
      if (notifRes.status === "fulfilled") {
        setNotifications(normalizeNotifications(notifRes.value));
      }
      if (previewRes.status === "fulfilled") {
        setPreviews(normalizeSimpleUsers(previewRes.value));
      }
      if (myPostsRes.status === "fulfilled") {
        setMyPosts(mapTimelinePosts(myPostsRes.value));
      } else {
        setMyPosts([]);
      }
      if (myRepostsRes.status === "fulfilled") {
        setMyReposts(mapTimelinePosts(myRepostsRes.value));
      } else {
        setMyReposts([]);
      }
    } catch (_) {}
  }

  async function runSearch(event) {
    event.preventDefault();
    if (!searchKeyword.trim()) return;
    try {
      const res = await searchUsers(searchKeyword.trim());
      setSearchResults(normalizeSimpleUsers(res));
    } catch (err) {
      setStatus(err?.response?.data?.error || "Search failed.");
    }
  }

  async function selectChatUser(userId) {
    setActiveChatUserId(userId);
    try {
      const res = await getMessages(userId);
      setMessages(normalizeMessages(res));
      await markMessagesRead(userId);
    } catch (_) {
      setMessages([]);
    }
  }

  async function sendChatMessage(event) {
    event.preventDefault();
    if (!activeChatUserId || !messageDraft.trim()) return;
    try {
      await sendMessage({ receiver_id: activeChatUserId, content: messageDraft.trim() });
      setMessageDraft("");
      await selectChatUser(activeChatUserId);
    } catch (err) {
      setStatus(err?.response?.data?.error || "Message failed.");
    }
  }

  async function submitProfileUpdate(event) {
    event.preventDefault();
    try {
      await updateUserProfile(profileForm);
      setStatus("Profile updated.");
      await onProfileRefresh?.();
    } catch (err) {
      setStatus(err?.response?.data?.error || "Profile update failed.");
    }
  }

  async function toggleFollow(userId, isCurrentlyFollowing) {
    try {
      if (isCurrentlyFollowing) {
        await unfollowUser(userId);
      } else {
        await followUser(userId);
      }
      await refreshAll();
    } catch (err) {
      setStatus(err?.response?.data?.error || "Follow action failed.");
    }
  }

  if (!isLoggedIn) {
    return (
      <section id="account" className="panel">
        <h2>Account Hub</h2>
        <p className="muted">Login to use profile, search, follow, notifications, and messages.</p>
      </section>
    );
  }

  const followingIds = new Set(following.map((u) => String(u.id)));
  const view = String(communityView || "all").toLowerCase();
  const showAll = view === "all";
  const showProfile = showAll || view === "profile";
  const showSearch = showAll || view === "search";
  const showNotifications = showAll || view === "notifications";
  const showMessages = showAll || view === "messages";
  const singleViewMode = !showAll;
  const pageTitle = showAll ? "Account Hub" : view.charAt(0).toUpperCase() + view.slice(1);
  const profileUser = profile?.user || {};
  const profileName = String(profileUser.fullname || "Fan").trim() || "Fan";
  const profileEmail = String(profileUser.email || "").trim();
  const profileAvatar = String(profileUser.profile_picture || "").trim();
  const profileHandle = `@${profileName.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "") || "fan"}`;
  const initials = profileName
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const profileTimeline = useMemo(() => {
    const merged = [
      ...myPosts.map((item) => ({ ...item, type: "post" })),
      ...myReposts.map((item) => ({ ...item, type: "repost" })),
    ].sort((a, b) => {
      const aTs = Date.parse(a.createdAt || "") || 0;
      const bTs = Date.parse(b.createdAt || "") || 0;
      return bTs - aTs;
    });

    const byTab = merged.filter((item) => {
      if (timelineTab === "posts") return item.type === "post";
      if (timelineTab === "reposts") return item.type === "repost";
      return true;
    });

    const needle = timelineQuery.trim().toLowerCase();
    if (!needle) return byTab;
    return byTab.filter((item) => String(item.content || "").toLowerCase().includes(needle));
  }, [myPosts, myReposts, timelineTab, timelineQuery]);

  return (
    <section id="account" className={`panel community-account-panel view-${view}`}>
      <div className="account-page-head">
        <h2>{pageTitle}</h2>
      </div>
      {status ? <p className="muted">{status}</p> : null}

      <div className={`account-grid ${singleViewMode ? "single-view" : ""}`}>
        {showProfile ? (
          <article id="account-profile" className="account-card">
            <h3>Profile</h3>
            <div className="profile-hero-card">
              {profileAvatar ? (
                <img className="profile-avatar" src={profileAvatar} alt={profileName} />
              ) : (
                <div className="profile-avatar profile-avatar-fallback">{initials}</div>
              )}
              <div>
                <h4>{profileName}</h4>
                <p className="muted">{profileHandle}</p>
                {profileEmail ? <p className="muted">{profileEmail}</p> : null}
                <div className="profile-hero-stats">
                  <span>{myPosts.length} posts</span>
                  <span>{myReposts.length} reposts</span>
                  <span>{followers.length} followers</span>
                </div>
              </div>
            </div>
            <form onSubmit={submitProfileUpdate} className="inline-form">
              <input
                value={profileForm.fullname}
                onChange={(event) => setProfileForm((prev) => ({ ...prev, fullname: event.target.value }))}
                placeholder="Full name"
              />
              <input
                value={profileForm.profile_picture}
                onChange={(event) =>
                  setProfileForm((prev) => ({ ...prev, profile_picture: event.target.value }))
                }
                placeholder="Profile image URL"
              />
              <button type="submit">Update profile</button>
            </form>
            <div className="profile-timeline-wrap">
              <div className="profile-posts-block">
                <div className="profile-timeline-head">
                  <h4>Activity</h4>
                  <div className="profile-timeline-tabs">
                    <button type="button" className={timelineTab === "all" ? "active" : ""} onClick={() => setTimelineTab("all")}>All</button>
                    <button type="button" className={timelineTab === "posts" ? "active" : ""} onClick={() => setTimelineTab("posts")}>Posts</button>
                    <button type="button" className={timelineTab === "reposts" ? "active" : ""} onClick={() => setTimelineTab("reposts")}>Reposts</button>
                  </div>
                </div>
                <input
                  value={timelineQuery}
                  onChange={(event) => setTimelineQuery(event.target.value)}
                  placeholder="Filter your activity..."
                />
                {profileTimeline.length === 0 ? <p className="muted">No activity yet.</p> : null}
                {profileTimeline.map((post) => (
                  <article key={`${post.type}-${post.id}`} className={`profile-post-card ${post.type === "repost" ? "repost" : ""}`}>
                    <div className="profile-post-head">
                      <strong>{post.type === "repost" ? "Repost" : "Post"}</strong>
                      <span className="muted">{post.createdAt ? new Date(post.createdAt).toLocaleString() : "Just now"}</span>
                    </div>
                    <p>{post.content || "No content"}</p>
                    {post.image ? <img src={post.image} alt={post.type} /> : null}
                  </article>
                ))}
              </div>
            </div>
          </article>
        ) : null}

        {showSearch ? (
          <article id="account-search" className="account-card">
            <h3>Search</h3>
            <form onSubmit={runSearch} className="inline-form">
              <input
                value={searchKeyword}
                onChange={(event) => setSearchKeyword(event.target.value)}
                placeholder="Search users..."
              />
              <button type="submit">Search</button>
            </form>
            <div className="mini-list">
              {searchResults.length === 0 ? <p className="muted">Start typing a name and tap Search.</p> : null}
              {searchResults.map((result, index) => (
                <div key={result.id || `result-${index}`} className="mini-row">
                  <span>{result.fullname || result.content || result.tag || "Result"}</span>
                </div>
              ))}
            </div>
          </article>
        ) : null}

        {showAll ? (
          <article className="account-card">
            <h3>Follow</h3>
            <p className="muted">Followers: {followers.length} | Following: {following.length}</p>
            <div className="mini-list">
              {suggestedUsers.map((user) => {
                const isFollowing = followingIds.has(String(user.id));
                return (
                  <div key={user.id} className="mini-row">
                    <span>{user.fullname}</span>
                    <button type="button" onClick={() => toggleFollow(user.id, isFollowing)}>
                      {isFollowing ? "Unfollow" : "Follow"}
                    </button>
                  </div>
                );
              })}
            </div>
          </article>
        ) : null}

        {showNotifications ? (
          <article id="account-notifications" className="account-card">
            <h3>Notifications</h3>
            <div className="mini-list">
              {notifications.length === 0 ? <p className="muted">No notifications yet.</p> : null}
              {notifications.map((item) => (
                <div key={item.id} className="mini-row">
                  <span>
                    {item.sourceUserName} {item.activityType}
                  </span>
                </div>
              ))}
            </div>
          </article>
        ) : null}

        {showMessages ? (
          <article id="account-messages" className="account-card account-chat">
            <h3>Messages</h3>
            <div className="chat-layout">
              <div className="mini-list">
                {previews.length === 0 ? <p className="muted">No conversations yet.</p> : null}
                {previews.map((user) => (
                  <button key={user.id} type="button" onClick={() => selectChatUser(user.id)}>
                    {user.fullname}
                  </button>
                ))}
              </div>
              <div>
                <div className="mini-list">
                  {activeChatUserId && messages.length === 0 ? <p className="muted">No messages yet.</p> : null}
                  {!activeChatUserId ? <p className="muted">Select a conversation to view messages.</p> : null}
                  {messages.map((message) => (
                    <div key={message.id} className="mini-row">
                      <span>{message.content}</span>
                    </div>
                  ))}
                </div>
                <form className="inline-form" onSubmit={sendChatMessage}>
                  <input
                    value={messageDraft}
                    onChange={(event) => setMessageDraft(event.target.value)}
                    placeholder="Message..."
                  />
                  <button type="submit">Send</button>
                </form>
              </div>
            </div>
          </article>
        ) : null}
      </div>
    </section>
  );
}
