import { connect } from "../../core/database.js";

class MessageModel {
  constructor() {
    this.connect();
  }
  async connect() {
    this.db = await connect();
    if (!this.db) {
      console.error("Database connection failed");
    }
  }
  //send message
  async sendMessage(sender_id, receiver_id, content) {
    try {
      const query = `INSERT INTO messages (sender_id, receiver_id, content) VALUES (?, ?, ?)`;
      const [result] = await this.db.query(query, [
        sender_id,
        receiver_id,
        content,
      ]);
      return result;
    } catch (err) {
      throw err;
    }
  }
  //get messages
  async getMessages(myId, userId) {
    try {
      const query = `
        SELECT m.*, u.profile_picture AS sender_profile_picture
        FROM messages m
        JOIN users u ON m.sender_id = u.user_id
        WHERE (m.sender_id = ? AND m.receiver_id = ?)
          OR (m.sender_id = ? AND m.receiver_id = ?)
        ORDER BY m.created_at ASC
      `;
      const [result] = await this.db.query(query, [myId, userId, userId, myId]);
      return result;
    } catch (err) {
      throw err;
    }
  }
  //mark as read
  async markAsRead(receiverId, senderId) {
    const sql = `
      UPDATE messages
      SET is_read = 1, read_at = NOW()
      WHERE receiver_id = ?
        AND sender_id   = ?
        AND is_read     = 0`;
    const [res] = await this.db.query(sql, [receiverId, senderId]);
    return res.affectedRows;
  }
  //get message previews
  async getMessagePreviews(userId) {
    const sql = `
    SELECT
      u.user_id,
      u.fullname,
      u.email,
      u.profile_picture,
      m.content AS last_message,
      m.sender_id,
      m.receiver_id,
      m.created_at,
      COALESCE(unread_sub.unread_count, 0) AS unread_count
    FROM follows f
    JOIN users u
      ON u.user_id = f.followed_id
    LEFT JOIN messages m
      ON m.message_id = (
          SELECT MAX(message_id)
          FROM messages
          WHERE 
            (sender_id = ? AND receiver_id = u.user_id)
            OR
            (sender_id = u.user_id AND receiver_id = ?)
      )
    LEFT JOIN (
        SELECT
          sender_id AS other_id,
          COUNT(*) AS unread_count
        FROM messages
        WHERE receiver_id = ? AND is_read = 0
        GROUP BY sender_id
    ) unread_sub 
      ON unread_sub.other_id = u.user_id
    WHERE f.follower_id = ?
    ORDER BY m.created_at DESC;
  `;

    const [rows] = await this.db.execute(sql, [userId, userId, userId, userId]);

    console.log("Followed:", rows);
    return rows;
  }
  //get unread count
  async getUnreadCount(userId) {
    const sql = `
      SELECT COUNT(*) AS unread
      FROM messages
      WHERE receiver_id = ? AND is_read = 0`;
    const [rows] = await this.db.query(sql, [userId]);
    return rows[0]?.unread || 0;
  }

  //report user
  async reportUser(reporter_id, reported_user_id, reason, message_id = null) {
    try {
      const query = `INSERT INTO user_reports (reporter_id, reported_user_id, reason, message_id, created_at) VALUES (?, ?, ?, ?, NOW())`;
      const [result] = await this.db.query(query, [
        reporter_id,
        reported_user_id,
        reason,
        message_id,
      ]);
      return result;
    } catch (err) {
      throw err;
    }
  }

  //get user report count
  async getUserReportCount(userId) {
    try {
      const query = `
        SELECT COUNT(DISTINCT reporter_id) as unique_reporters
        FROM user_reports 
        WHERE reported_user_id = ? AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      `;
      const [result] = await this.db.query(query, [userId]);
      return result[0]?.unique_reporters || 0;
    } catch (err) {
      throw err;
    }
  }

  //get user reports for admin
  async getUserReports(userId) {
    try {
      const query = `
        SELECT 
          ur.*,
          reporter.fullname as reporter_name,
          reporter.email as reporter_email,
          reported.fullname as reported_user_name,
          reported.email as reported_user_email,
          m.content as message_content
        FROM user_reports ur
        JOIN users reporter ON ur.reporter_id = reporter.user_id
        JOIN users reported ON ur.reported_user_id = reported.user_id
        LEFT JOIN messages m ON ur.message_id = m.message_id
        WHERE ur.reported_user_id = ?
        ORDER BY ur.created_at DESC
      `;
      const [result] = await this.db.query(query, [userId]);
      return result;
    } catch (err) {
      throw err;
    }
  }

  //get all reported users for admin
  async getAllReportedUsers() {
    try {
      const query = `
        SELECT 
          u.user_id,
          u.fullname,
          u.email,
          u.profile_picture,
          COUNT(DISTINCT ur.reporter_id) as unique_reporters,
          COUNT(ur.report_id) as total_reports,
          MAX(ur.created_at) as latest_report,
          GROUP_CONCAT(DISTINCT ur.reason) as reasons
        FROM users u
        JOIN user_reports ur ON u.user_id = ur.reported_user_id
        WHERE ur.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
        GROUP BY u.user_id, u.fullname, u.email, u.profile_picture
        HAVING unique_reporters >= 3
        ORDER BY unique_reporters DESC, latest_report DESC
      `;
      const [result] = await this.db.query(query);
      return result;
    } catch (err) {
      throw err;
    }
  }
}

export default MessageModel;
