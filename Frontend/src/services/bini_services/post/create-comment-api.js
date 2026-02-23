import api from "../../../lib/api";

// Create a new comment
export async function createComment(postId, content) {
  try {
    const res = await api.post(
      `/v1/bini/comments/create/${postId}`,
      { content }, // must be object, not raw string
    );

    console.log("Comment created successfully:", res.data);

    return res.data;
  } catch (error) {
    console.error(
      "Failed to create comment:",
      error.response?.data || error.message,
    );

    throw new Error(
      error.response?.data?.message ||
        error.message ||
        "Comment creation failed",
    );
  }
}

// Fetch comments for a specific post
export async function getComments(postId) {
  try {
    const res = await api.get(`/v1/bini/comments/${postId}`);

    const data = res.data;

    console.log(`Comments data for postId ${postId}:`, data);

    // Handle flexible backend response shapes safely
    if (Array.isArray(data)) return data;

    if (data?.comments && Array.isArray(data.comments)) {
      return data.comments;
    }

    return [];
  } catch (error) {
    console.error(
      "Error fetching comments:",
      error.response?.data || error.message,
    );

    return [];
  }
}
