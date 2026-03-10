function toArray(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data?.items)) return payload.data.items;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.videos)) return payload.videos;
  if (Array.isArray(payload?.albums)) return payload.albums;
  if (Array.isArray(payload?.posters)) return payload.posters;
  return [];
}

export function normalizeVideos(payload) {
  return toArray(payload).map((item) => ({
    id: item.videoId || item.id || Math.random().toString(16).slice(2),
    title: item.title || "Video",
    description: item.description || "",
    thumbnail:
      item.thumbnail ||
      item.thumbnail_url ||
      item?.thumbnails?.high?.url ||
      item?.thumbnails?.medium?.url ||
      "",
    url: item.url || (item.videoId ? `https://www.youtube.com/watch?v=${item.videoId}` : "#"),
  }));
}

export function normalizeAlbums(payload) {
  return toArray(payload).map((item) => ({
    id: item.album_id || item.id,
    title: item.title || item.album_name || "Album",
    cover: item.cover_url || item.image_url || item.cover_image || item.album_cover || "",
    year: item.release_year || item.year || "",
  }));
}

export function normalizePosters(payload) {
  return toArray(payload).map((item, index) => ({
    id: item.poster_id || item.id || `poster-${index}`,
    title: item.title || item.event_name || "Live Event",
    image: item.poster_url || item.image_url || item.url || "",
    venue: item.venue || "",
    city: item.city || item.municipality || "",
    barangay: item.barangay || item.district || "",
    date: item.event_date || item.event_datetime || item.start_date || item.date || "",
    description: item.description || item.caption || item.details || "",
    ticketLink: item.ticket_link || item.ticket_url || item.link || "",
  }));
}

export function normalizeTracks(payload) {
  return toArray(payload).map((item, index) => ({
    id: item.track_id || item.id || `track-${index}`,
    title: item.title || item.track_name || `Track ${index + 1}`,
    duration: item.duration || item.length || "",
  }));
}

export function normalizeCollections(payload) {
  return toArray(payload).map((item, index) => ({
    id: item.collection_id || item.id || `collection-${index}`,
    name: item.name || item.collection_name || `Collection ${index + 1}`,
    image: item.image_url || item.img_url || item.cover_url || "",
  }));
}

export function normalizeProducts(payload) {
  return toArray(payload).map((item, index) => ({
    id: item.product_id || item.id || `product-${index}`,
    name: item.name || "Product",
    image: item.image_url || "",
    price: Number(item.price || 0),
    description: item.description || "",
  }));
}

export function normalizeProductDetails(payload) {
  const data = payload?.data || payload || {};
  const product = data?.product || {};
  const variants = Array.isArray(data?.variants) ? data.variants : [];
  return {
    product: {
      id: product.product_id || product.id || "",
      name: product.name || "Product",
      image: product.image_url || "",
      description: product.description || "",
      price: Number(product.price || 0),
    },
    variants: variants.map((item, index) => ({
      id: item.variant_id || item.id || `variant-${index}`,
      name: item.variant_name || item.variant_values || `Variant ${index + 1}`,
      price: Number(item.price || 0),
      stock: Number(item.stock || 0),
    })),
  };
}

export function normalizeCart(payload) {
  return toArray(payload).map((item, index) => ({
    id: item.item_id || item.id || `cart-${index}`,
    productId: item.product_id || null,
    variantId: item.variant_id,
    name: item.product_name || item.name || "Item",
    variant: item.variant_name || item.variant_values || "",
    image: item.image_url || "",
    quantity: Number(item.quantity || 0),
    price: Number(item.price || 0),
    weightG: Number(item.weight_g || 0),
  }));
}

export function normalizePosts(payload) {
  return toArray(payload).map((item, index) => ({
    id: item.post_id || item.id || `post-${index}`,
    userId: item.user_id || item.userId || null,
    author: item.fullname || "Fan",
    avatar: item.profile_picture || "",
    content: item.content || "",
    image: item.img_url || "",
    createdAt: item.created_at || "",
    tags: Array.isArray(item.tags) ? item.tags : [],
  }));
}

export function normalizeComments(payload) {
  const comments = Array.isArray(payload) ? payload : [];
  return comments.map((item, index) => ({
    id: item.comment_id || item.id || `comment-${index}`,
    content: item.content || "",
    author: item.fullname || item.username || "Fan",
    createdAt: item.created_at || "",
    replies: Array.isArray(item.replies)
      ? item.replies.map((reply, replyIndex) => ({
          id: reply.comment_id || reply.id || `reply-${index}-${replyIndex}`,
          content: reply.content || "",
          author: reply.fullname || reply.username || "Fan",
          createdAt: reply.created_at || "",
        }))
      : [],
  }));
}

export function normalizeSimpleUsers(payload) {
  const users = Array.isArray(payload) ? payload : toArray(payload);
  return users.map((item, index) => ({
    id: item.user_id || item.id || `user-${index}`,
    fullname: item.fullname || item.username || "User",
    email: item.email || "",
    profilePicture: item.profile_picture || "",
  }));
}

export function normalizeMessages(payload) {
  const messages = Array.isArray(payload) ? payload : [];
  return messages.map((item, index) => ({
    id: item.message_id || item.id || `message-${index}`,
    senderId: item.sender_id,
    receiverId: item.receiver_id,
    content: item.content || "",
    createdAt: item.created_at || item.timestamp || "",
  }));
}

export function normalizeNotifications(payload) {
  const notifications = Array.isArray(payload) ? payload : [];
  return notifications.map((item, index) => ({
    id: item.notification_id || item.id || `notif-${index}`,
    activityType: item.activity_type || "activity",
    sourceUserName: item.source_user_name || item.fullname || "User",
    createdAt: item.created_at || "",
    postId: item.post_id || null,
  }));
}

export function normalizeOrders(payload) {
  const orders = Array.isArray(payload?.orders) ? payload.orders : [];
  return orders.map((item, index) => ({
    id: item.order_id || item.id || `order-${index}`,
    status: item.status || "pending",
    total: Number(item.total || 0),
    shippingFee: Number(item.shipping_fee || 0),
    subtotal: Number(item.subtotal || 0),
    paymentMethod: item.payment_method || "COD",
    createdAt: item.created_at || "",
    items: Array.isArray(item.items) ? item.items : [],
  }));
}

export function normalizeAnnouncements(payload) {
  const list = Array.isArray(payload?.data) ? payload.data : Array.isArray(payload) ? payload : [];
  return list.map((item, index) => ({
    id: item.id || item.thread_id || `announcement-${index}`,
    title: item.title || "Announcement",
    venue: item.venue || "",
    date: item.date || "",
    author: item.author || "Admin",
    pinned: Boolean(item.is_pinned),
  }));
}

export function normalizeGeneratedWebsite(payload) {
  const website = payload?.data || payload || {};
  const members = Array.isArray(website?.members) ? website.members : [];

  return {
    about: {
      community_id: website?.community_id || null,
      name: website?.site_name || website?.community_type || "community",
      description:
        String(website?.description || website?.short_bio || "").trim() || "",
    },
    members: members.map((member, index) => ({
      id: member?.id || member?.member_id || `member-${index}`,
      name: member?.name || `Member ${index + 1}`,
      role: member?.role || "Artist",
      description: member?.description || "",
      image: member?.image || member?.image_profile || "",
    })),
  };
}
