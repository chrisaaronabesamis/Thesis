import Comment from "../../../Models/bini_models/comment_model.js";

class CommentController {
  constructor() {
    this.comment = new Comment();
  }
  async init() {
    await this.comment.init();
  }
  // Create a new comment on a post
  async create(req, res) {
    await this.init();
    const { post_id } = req.params;
    const { content } = req.body || {};
    const user_id = res.locals.userId;

    try {
      // Validate inputs
      if (!post_id) {
        return res.status(400).json({ message: "Post ID is required" });
      }
      if (!content || typeof content !== 'string' || content.trim().length === 0) {
        return res.status(400).json({ message: "Comment content cannot be empty" });
      }
      if (!user_id) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const result = await this.comment.create(post_id, user_id, content, null);

      console.log("Comment created successfully:", result);
      res.status(201).json({ 
        message: "Comment created successfully",
        comment_id: result.comment_id,
        data: result
      });
    } catch (error) {
      console.error("<error> comment.create#", error);
      // Return specific error messages to help with debugging
      const statusCode = error.message.includes('required') || error.message.includes('empty') 
        ? 400 
        : error.message.includes('policy violation') 
        ? 403 
        : 500;
      res.status(statusCode).json({ 
        message: error.message || "Failed to create comment",
        error: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }
  async createReply(req, res) {
    await this.init();
    const { content } = req.body || {};
    const userId = res.locals.userId;
    const { comment_id } = req.params; // Parent comment ID
    console.log("[comment.createReply] incoming", {
      comment_id,
      userId,
      content,
    });
    try {
      // Validation: Check for missing input
      if (!content || typeof content !== 'string' || content.trim().length === 0) {
        return res.status(400).json({ message: "Reply content cannot be empty" });
      }
      if (!comment_id) {
        return res.status(400).json({ message: "Comment ID is required" });
      }
      if (!userId) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      // Model will fetch the parent comment's post_id automatically
      const result = await this.comment.createReply(
        null,
        userId,
        content,
        comment_id,
      );
      res.status(201).json({ 
        message: "Reply created successfully", 
        comment_id: result.comment_id,
        data: result 
      });
    } catch (error) {
      console.error("<error> comment.createReply", error);
      const statusCode = error.message.includes('required') || error.message.includes('empty') || error.message.includes('not found')
        ? 400 
        : error.message.includes('policy violation') 
        ? 403 
        : 500;
      res.status(statusCode).json({ 
        message: error.message || "Failed to create reply",
        error: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }
  // Get all comments for a specific post
  async getAll(req, res) {
    await this.init();
    const { post_id } = req.params;
    try {
      const comments = await this.comment.getAllByPost(post_id);
      res.status(200).json(comments);
    } catch (error) {
      console.error("<error> comment.getAllByPost", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  // Get comments made by the authenticated user
  async getByUser(req, res) {
    await this.init();
    const user_id = res.locals.userId;
    try {
      if (!user_id) return res.status(401).json({ message: "Unauthenticated" });
      const comments = await this.comment.getByUser(user_id);
      res.status(200).json(comments);
    } catch (error) {
      console.error("<error> comment.getByUser", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  // Get comment count for a specific post
  async getCommentCount(req, res) {
    await this.init();
    const { post_id } = req.params;
    console.log("Fetching comment count for post_id:", post_id);
    try {
      const comments = await this.comment.getAllByPost(post_id);
      const count = comments.length;
      res.status(200).json({ commentCount: count, count: count });
    } catch (error) {
      console.error("<error> comment.getCommentCount", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
  // Get all replies for a specific comment
  async getallreply(req, res) {
    await this.init();
    const { comment_id } = req.params;
    try {
      const comments = await this.comment.getRepliesByComment(comment_id);
      // Always return 200 with replies array (empty if no replies found)
      return res.status(200).json({ replies: comments || [] });
    } catch (error) {
      console.error("<error> getallreply", error);
      return res
        .status(500)
        .json({ message: "Internal Server Error", error: error.message });
    }
  }
  // Update an existing comment
  async update(req, res) {
    await this.init();
    const { comment_id } = req.params;
    const { content } = req.body || {};
    try {
      const result = await this.comment.update(comment_id, content);
      res.status(200).json({ message: "Comment updated successfully", result });
    } catch (error) {
      console.error("<error> comment.update", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
  // Delete a comment
  async delete(req, res) {
    await this.init();
    const { comment_id } = req.params;
    try {
      const result = await this.comment.delete(comment_id);
      res.status(200).json({ message: "Comment deleted successfully", result });
    } catch (error) {
      console.error("<error> comment.delete", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
}
export default CommentController;
