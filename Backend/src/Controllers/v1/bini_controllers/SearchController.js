import SearchModel from '../../../Models/bini_models/SearchModel.js';

class SearchController {
  constructor() {
    this.searchModel = new SearchModel();
  }
  // Search users by keyword
  async searchUser(req, res) {
    const keyword = (req.query.keyword || '').toString().trim();
    console.log("Received keyword:", keyword);

    // Accept any non-empty keyword (restore previous behavior)
    if (!keyword || keyword.length < 1) {
      return res.status(400).json({ error: "Keyword is required" });
    }

    try {
      const results = await this.searchModel.searchUser(keyword);
      console.log("Search Results: users=%d", Array.isArray(results?.users) ? results.users.length : 0);
      return res.status(200).json(results);
    } catch (err) {
      console.error("Search error:", err?.stack || err);
      // Avoid leaking internal error details to clients in production; return a generic message
      return res.status(500).json({ error: 'Internal server error while performing search' });
    }
  }
}

export default SearchController;
