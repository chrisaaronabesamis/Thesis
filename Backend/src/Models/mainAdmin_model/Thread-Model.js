// src/Models/Thread-Model.js
import { connect } from '../../core/database.js';

class ThreadModel {
  constructor() {
    this.db = null;
  }

  async connect() {
    try {
      this.db = await connect();
    } catch (err) {
      console.error('DB connection failed:', err);
      throw new Error('Database connection failed');
    }
  }

  // =========================
  // GET ALL THREADS (BY SITE)
  // =========================
  async findAll(siteId = null) {
    try {
      if (!this.db) await this.connect();
      
      let query = `
        SELECT ct.*, s.site_name, s.community_type, s.domain 
        FROM community_threads ct
        LEFT JOIN sites s ON ct.site_id = s.id
      `;
      
      const params = [];
      
      if (siteId) {
        query += ' WHERE ct.site_id = ?';
        params.push(siteId);
      }
      
      query += ' ORDER BY ct.is_pinned DESC, ct.created_at DESC';
      
      const [threads] = await this.db.query(query, params);
      
      return threads;
    } catch (err) {
      console.error('Error fetching threads:', err);
      throw new Error('Failed to fetch threads');
    }
  }

  // =========================
  // GET THREAD BY ID
  // =========================
  async findById(id) {
    try {
      if (!this.db) await this.connect();
      
      const query = `
        SELECT ct.*, s.site_name, s.community_type, s.domain 
        FROM community_threads ct
        LEFT JOIN sites s ON ct.site_id = s.id
        WHERE ct.id = ?
      `;
      const [threads] = await this.db.query(query, [id]);
      
      return threads[0] || null;
    } catch (err) {
      console.error(`Error fetching thread with ID ${id}:`, err);
      throw new Error('Failed to fetch thread');
    }
  }

  // =========================
  // CREATE THREAD
  // =========================
  async create({ title, venue, date, author, is_pinned = 0, site_id }) {
    try {
      if (!this.db) await this.connect();
      
      const query = `
        INSERT INTO community_threads 
        (title, venue, date, author, is_pinned, site_id, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())
      `;
      
      const [result] = await this.db.query(query, [
        title,
        venue,
        new Date(date),
        author,
        is_pinned ? 1 : 0,
        site_id
      ]);
      
      return {
        id: result.insertId,
        title,
        venue,
        date,
        author,
        is_pinned,
        site_id,
        created_at: new Date(),
        updated_at: new Date()
      };
    } catch (err) {
      console.error('Error creating thread:', err);
      throw new Error('Failed to create thread');
    }
  }

  // =========================
  // UPDATE THREAD
  // =========================
  async update(id, { title, venue, date, is_pinned }) {
    try {
      if (!this.db) await this.connect();
      
      const query = `
        UPDATE community_threads 
        SET title = ?, 
            venue = ?, 
            date = ?, 
            is_pinned = ?,
            updated_at = NOW()
        WHERE id = ?
      `;
      
      const [result] = await this.db.query(query, [
        title,
        venue,
        new Date(date),
        is_pinned ? 1 : 0,
        id
      ]);
      
      if (result.affectedRows === 0) {
        throw new Error('Thread not found');
      }
      
      return await this.findById(id);
    } catch (err) {
      console.error(`Error updating thread with ID ${id}:`, err);
      throw err.message === 'Thread not found' 
        ? new Error('Thread not found')
        : new Error('Failed to update thread');
    }
  }

  // =========================
  // DELETE THREAD
  // =========================
  async delete(id) {
    try {
      if (!this.db) await this.connect();
      
      const query = 'DELETE FROM community_threads WHERE id = ?';
      const [result] = await this.db.query(query, [id]);
      
      if (result.affectedRows === 0) {
        throw new Error('Thread not found');
      }
      
      return true;
    } catch (err) {
      console.error(`Error deleting thread with ID ${id}:`, err);
      throw err.message === 'Thread not found' 
        ? new Error('Thread not found')
        : new Error('Failed to delete thread');
    }
  }

  // =========================
  // GET SITES FOR ADMIN
  // =========================
  async getSites() {
    try {
      if (!this.db) await this.connect();
      
      const query = 'SELECT * FROM sites WHERE status = "active" ORDER BY site_name';
      const [sites] = await this.db.query(query);
      
      return sites;
    } catch (err) {
      console.error('Error fetching sites:', err);
      throw new Error('Failed to fetch sites');
    }
  }
}

export default ThreadModel; 
