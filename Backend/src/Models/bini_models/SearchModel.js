import { connect } from '../../core/database.js';

class SearchModel {
  constructor() {
    this.connect();
  }
  async connect() {
    this.db = await connect();
  }
  // search users by keyword in fullname or username
  async searchUser(keyword) {
    try {
      // Ensure DB connection is established (constructor calls connect() but it's async)
      if (!this.db) {
        await this.connect();
      }
      // Search users only (limit 5)
      const userQuery = `
        SELECT user_id, fullname, username, profile_picture
        FROM users
        WHERE fullname LIKE ? OR username LIKE ?
        ORDER BY fullname
        LIMIT 5
      `;
      const userParams = [
        `%${keyword}%`,
        `%${keyword}%`
      ];
      const [userResults] = await this.db.query(userQuery, userParams);

      return {
        users: userResults
      };
    } catch (err) {
      console.error("Error in searchUser:", err);
      throw err;
    }
  }
}

export default SearchModel;