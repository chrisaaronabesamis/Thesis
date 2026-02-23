import { connect } from '../../core/database.js';
import { encryptPassword, comparePassword } from '../utils/bcryptpass.js';
import nodemailer from 'nodemailer';

class AdminModel {
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
  // CREATE ADMIN
  // =========================
  async createAdmin({ email, password }) {
    try {
      if (!this.db) await this.connect();
      const hashed = await encryptPassword(password);

      const query =
        'INSERT INTO admins (email, password) VALUES (?, ?)';

      const [result] = await this.db.query(query, [email, hashed]);

      return result.insertId;
    } catch (err) {
      console.error('Create admin error:', err);
      throw new Error('Failed to create admin');
    }
  }

  // =========================
  // LOGIN
  // =========================
  async loginAdmin(email, password) {
    try {
      if (!this.db) await this.connect();

      const query = 'SELECT * FROM admins WHERE email = ?';
      const [admins] = await this.db.query(query, [email]);

      if (admins.length === 0) {
        throw new Error('Invalid email or password');
      }

      const admin = admins[0];
      const isPasswordValid = await comparePassword(password, admin.password);

      if (!isPasswordValid) {
        throw new Error('Invalid email or password');
      }

      // Remove sensitive data before returning
      const { password: _, ...adminData } = admin;
      return adminData;
    } catch (err) {
      console.error('Login error:', err);
      throw err;
    }
  }

  // =========================
  // GET ADMIN BY ID
  // =========================
  async getAdminById(id) {
    try {
      if (!this.db) await this.connect();

      const query = 'SELECT id, email, created_at, updated_at FROM admins WHERE id = ?';
      const [admins] = await this.db.query(query, [id]);

      if (admins.length === 0) {
        throw new Error('Admin not found');
      }

      return admins[0];
    } catch (err) {
      console.error('Get admin by ID error:', err);
      throw err;
    }
  }

  // =========================
  // UPDATE ADMIN
  // =========================
  async updateAdmin(id, { email, password }) {
    try {
      if (!this.db) await this.connect();

      let query = 'UPDATE admins SET ';
      const params = [];
      const updates = [];

      if (email) {
        updates.push('email = ?');
        params.push(email);
      }

      if (password) {
        const hashed = await encryptPassword(password);
        updates.push('password = ?');
        params.push(hashed);
      }

      if (updates.length === 0) {
        throw new Error('No fields to update');
      }

      query += updates.join(', ') + ' WHERE id = ?';
      params.push(id);

      const [result] = await this.db.query(query, params);

      if (result.affectedRows === 0) {
        throw new Error('Admin not found');
      }

      return this.getAdminById(id);
    } catch (err) {
      console.error('Update admin error:', err);
      throw err;
    }
  }

  // =========================
  // DELETE ADMIN
  // =========================
  async deleteAdmin(id) {
    try {
      if (!this.db) await this.connect();

      const query = 'DELETE FROM admins WHERE id = ?';
      const [result] = await this.db.query(query, [id]);

      if (result.affectedRows === 0) {
        throw new Error('Admin not found');
      }

      return true;
    } catch (err) {
      console.error('Delete admin error:', err);
      throw err;
    }
  }

  // =========================
  // SEND OTP
  // =========================
  async sendOtp(email) {
    try {
      if (!this.db) await this.connect();

      // Check if admin exists
      const [admins] = await this.db.query(
        'SELECT id FROM admins WHERE email = ?',
        [email]
      );

      if (admins.length === 0) {
        throw new Error('Admin not found');
      }

      // Generate OTP (6 digits)
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

      // Store OTP in database
      await this.db.query(
        'UPDATE admins SET otp = ?, otp_expiry = ? WHERE email = ?',
        [otp, otpExpiry, email]
      );

      // In a real app, you would send this OTP via email
      console.log(`OTP for ${email}: ${otp}`);

      return { message: 'OTP sent successfully' };
    } catch (err) {
      console.error('Send OTP error:', err);
      throw err;
    }
  }

  // =========================
  // VERIFY OTP
  // =========================
  async verifyOtp(email, otp, newPassword) {
    try {
      if (!this.db) await this.connect();
      const hashed = await encryptPassword(newPassword);

      const [admins] = await this.db.query(
        'SELECT id FROM admins WHERE email = ? AND otp = ? AND otp_expiry > NOW()',
        [email, otp]
      );

      if (admins.length === 0) {
        throw new Error('Invalid or expired OTP');
      }

      // Update password and clear OTP
      const [result] = await this.db.query(
        'UPDATE admins SET password = ?, otp = NULL, otp_expiry = NULL WHERE email = ?',
        [hashed, email]
      );

      return result.affectedRows > 0;
    } catch (err) {
      console.error('Verify OTP error:', err);
      throw err;
    }
  }

  // =========================
  // LOGOUT
  // =========================
  async logoutAdmin(req) {
    try {
      const token = req.headers.authorization?.split(' ')[1];

      if (!token) {
        throw new Error('Token required');
      }

      return { message: 'Logout successful' };
    } catch (err) {
      console.error('Logout error:', err);
      throw err;
    }
  }
}

export default AdminModel;
