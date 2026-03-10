import { biniApi, coreApi, ecommerceApi } from "./http";

export async function loginUser(payload) {
  const { data } = await biniApi.post("/users/login", payload);
  return data;
}

export async function registerUser(payload) {
  const { data } = await biniApi.post("/users/register", payload);
  return data;
}

export async function getProfile() {
  const { data } = await biniApi.get("/users/profile");
  return data;
}

export async function getAlbums() {
  const { data } = await ecommerceApi.get("/discography/albums");
  return data;
}

export async function getAlbumTracks(albumId) {
  const { data } = await ecommerceApi.get(`/discography/albums/${albumId}/tracks`);
  return data;
}

export async function getEventPosters() {
  const { data } = await ecommerceApi.get("/events/posters");
  return data;
}

export async function getCollections() {
  const { data } = await ecommerceApi.get("/shop/getCollections");
  return data;
}

export async function getProductsByCollection(collectionId) {
  const { data } = await ecommerceApi.get(`/shop/getProductCollection/${collectionId}`);
  return data;
}

export async function getProductDetails(productId) {
  const { data } = await ecommerceApi.get(`/shop/getProductDetails/${productId}`);
  return data;
}

export async function getCartItems() {
  const { data } = await ecommerceApi.get("/cart/items");
  return data;
}

export async function addToCart(payload) {
  const { data } = await ecommerceApi.post("/cart/add", payload);
  return data;
}

export async function getCommunityFeed(limit = 10, offset = 0) {
  const { data } = await biniApi.get(`/posts/getrandomposts?limit=${limit}&offset=${offset}`);
  return data;
}

export async function getAnnouncements() {
  const { data } = await biniApi.get("/posts/threads");
  return data;
}

export async function createCommunityPost(payload) {
  const { data } = await biniApi.post("/posts/create", payload);
  return data;
}

export async function togglePostLike(postId) {
  const { data } = await biniApi.post(`/posts/${postId}/likes/toggle`);
  return data;
}

export async function getPostLikeCount(postId) {
  const { data } = await biniApi.get(`/posts/${postId}/likes/count`);
  return data;
}

export async function getPostComments(postId) {
  const { data } = await biniApi.get(`/posts/${postId}/comments`);
  return data;
}

export async function getMyPosts() {
  const { data } = await biniApi.get("/posts/mypost");
  return data;
}

export async function getMyReposts() {
  const { data } = await biniApi.get("/posts/repost");
  return data;
}

export async function createPostComment(postId, payload) {
  const { data } = await biniApi.post(`/posts/${postId}/comments/create`, payload);
  return data;
}

export async function createCommentReply(commentId, payload) {
  const { data } = await biniApi.post(`/posts/${commentId}/reply`, payload);
  return data;
}

export async function repostPost(postId) {
  const { data } = await biniApi.patch(`/posts/${postId}/repost`);
  return data;
}

export async function updatePost(postId, payload) {
  const { data } = await biniApi.patch(`/posts/${postId}`, payload);
  return data;
}

export async function deletePost(postId) {
  const { data } = await biniApi.delete(`/posts/${postId}`);
  return data;
}

export async function updateUserProfile(payload) {
  const { data } = await biniApi.put("/users/profile", payload);
  return data;
}

export async function searchUsers(keyword) {
  const { data } = await biniApi.get(`/search/users?keyword=${encodeURIComponent(keyword)}`);
  return data;
}

export async function searchPosts(keyword) {
  const { data } = await biniApi.get(`/search/posts?keyword=${encodeURIComponent(keyword)}`);
  return data;
}

export async function searchHashtags(keyword) {
  const { data } = await biniApi.get(`/search/hashtags?keyword=${encodeURIComponent(keyword)}`);
  return data;
}

export async function getSuggestedFollowers(limit = 10, offset = 0) {
  const { data } = await biniApi.get(`/follow/suggested-followers?limit=${limit}&offset=${offset}`);
  return data;
}

export async function getFollowers() {
  const { data } = await biniApi.get("/follow/followers");
  return data;
}

export async function getFollowing() {
  const { data } = await biniApi.get("/follow/following");
  return data;
}

export async function followUser(userId) {
  const { data } = await biniApi.post(`/users/${userId}/follow`);
  return data;
}

export async function unfollowUser(userId) {
  const { data } = await biniApi.post(`/users/${userId}/unfollow`);
  return data;
}

export async function getNotifications() {
  const { data } = await biniApi.get("/notifications/mynotif");
  return data;
}

export async function getMessagePreviews() {
  const { data } = await biniApi.get("/message/preview");
  return data;
}

export async function getMessages(userId) {
  const { data } = await biniApi.get(`/message/${userId}`);
  return data;
}

export async function sendMessage(payload) {
  const { data } = await biniApi.post("/message", payload);
  return data;
}

export async function markMessagesRead(senderId) {
  const { data } = await biniApi.patch(`/message/read/${senderId}`);
  return data;
}

export async function getShippingRate(provinceName, totalWeightGrams = 0) {
  const { data } = await ecommerceApi.get(
    `/shipping/getShippingRates?province_name=${encodeURIComponent(provinceName)}&total_weight_grams=${totalWeightGrams}`,
  );
  return data;
}

export async function createOrder(payload) {
  const { data } = await ecommerceApi.post("/orders/create", payload);
  return data;
}

export async function getOrderHistory() {
  const { data } = await ecommerceApi.get("/orders/user");
  return data;
}

export async function getGeneratedWebsiteByCommunityType(communityType) {
  const { data } = await coreApi.get(`/generate/generated-websites/type/${encodeURIComponent(communityType)}`);
  return data;
}
