import { connect } from '../../core/database.js';
import { encryptPassword } from '../../utils/hash.js';
import crypto from "crypto";
import nodemailer from 'nodemailer';


class UserModel {
  constructor() {
    this.connect().catch(err => {
      console.error('<warning> user_model.connect failed', err && err.message ? err.message : err);
    });
  }
  
  async connect() {
    this.db = await connect();
  }

  async ensureConnection() {
    try {
      if (!this.db || this.db.connection.state === 'disconnected') {
        this.db = await connect();
      }
    } catch (err) {
      console.error('<error> ensureConnection failed:', err);
      this.db = await connect();
    }
    return this.db;
  }



  // 🧑 Create user (schema: email, fullname, password, profile_picture, role has default)
  async createUser({ password, email, username, firstname, lastname, imageUrl = "" }) {
    const connection = this.db;
    try {
      // Step 1: Encrypt password
      const hashedPassword = await encryptPassword(password);

      // Step 2: Create fullname
      const fullname = `${firstname} ${lastname}`;

      console.log('createUser debug:', { email, fullname, profilePic: imageUrl, hashedPasswordLength: hashedPassword.length });

      // Step 3: Insert new user (users table has: email, fullname, password, profile_picture)
      const userQuery = `
        INSERT INTO users (email, fullname, password, profile_picture)
        VALUES (?, ?, ?, ?)
      `;
      const [result] = await (await this.ensureConnection()).query(userQuery, [
        email,
        fullname,
        hashedPassword,
        imageUrl || 'none',
      ]);

      const userId = result.insertId;
      console.log('User created successfully with ID:', userId);
      return userId;

    } catch (error) {
      console.error('<error> user.createUser', { errorMessage: error.message, errorCode: error.code });
      throw new Error(error.message || 'Error inserting user');
    }
  }



// 
  async verify(email, password) {
    try {
      const db = await this.ensureConnection();
      
      console.log(`usermodel Verifying user: ${email} Password: ${password}`);
      // 1️⃣ Kunin user info
      const userQuery = `
        SELECT user_id, email, password, fullname
        FROM users
        WHERE email = ?
        LIMIT 1
      `;
      const [userRows] = await db.query(userQuery, [email]);
      const user = userRows?.[0];

      if (!user) {
        return { status: "error", message: "User not found" };
      }

      // 2️⃣ Verify password
      const hashedPassword = await encryptPassword(password);
      console.log('Password verification debug:', {
        inputPlain: password,
        inputHashed: hashedPassword,
        storedHash: user.password,
        match: user.password === hashedPassword
      });
      if (user.password !== hashedPassword) {
        return { status: "error", message: "Incorrect password" };
      }

      // 3️⃣ Success - return basic user info
      return {
        status: "success",
        user: {
          user_id: user.user_id,
          fullname: user.fullname
        }
      };

    } catch (error) {
      console.error('<error> user.verify', error);
      throw new Error('User verification failed');
    }
  }




  async requestPasswordReset(email) {
    try {
      // 1 Check kung existing yung user
      const [rows] = await (await this.ensureConnection()).query(
        'SELECT reset_expr FROM users WHERE email = ?',
        [email]
      );
      const user = rows?.[0];

      if (!user) {
        return { status: "error", message: "No user found with that email address." };
      }

      // 2️ Check kung may existing OTP na valid pa
      if (user.reset_expr && new Date() < new Date(user.reset_expr)) {
        const remainingMs = new Date(user.reset_expr) - new Date();
        const remainingSec = Math.ceil(remainingMs / 1000);
        return {
          status: "error",
          message: `OTP already sent. Please wait ${remainingSec} seconds before requesting again.`,
        };
      }

      // 3️ Generate new secure OTP
      const otp = crypto.randomInt(100000, 999999);
      const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);

      // 4 Save to DB
      const success = await this.saveResetToken(email, otp, otpExpiry);
      if (!success) {
        return { status: "error", message: "Failed to save OTP in database." };
      }

      // 5️ Send email
      await this.sendOtpEmail(email, otp);

      // 6️ Return success
      return {
        status: "success",
        message: "Password reset OTP sent successfully to your email.",
      };

    } catch (err) {
      console.error('<error> user.requestPasswordReset', err);
      return {
        status: "error",
        message: "An unexpected error occurred while sending the OTP.",
        error: err.message, 
      };
    }
  }




  async sendOtpEmail(email, otp) {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      }
    });

    await transporter.sendMail({
      to: email,
      subject: 'Password Reset OTP',
      text: `Your OTP for password reset is: ${otp}`
    });
  }


  async saveResetToken(email, otp, otpExpiry) {
    const query = 'UPDATE users SET reset_otp = ?, reset_expr = ? WHERE email = ?';

    const [result] = await (await this.ensureConnection()).query(query, [otp, otpExpiry, email]);
  
    return result.affectedRows > 0;
  }
    // verify OTP and reset password
  async verifyOtpAndResetPassword(email, otp, newPassword) {
    const query = 'SELECT reset_otp, reset_expr FROM users WHERE email = ?';
    const [results] = await (await this.ensureConnection()).query(query, [email]);
    const user = results?.[0];

    if (!user) {
      throw new Error('No user found with that email address.');
    }

    console.log('Debug - OTP Check:', {
      stored: user.reset_otp,
      provided: otp,
      expiry: user.reset_expr,
      now: new Date(),
      isExpired: new Date() > new Date(user.reset_expr)
    });

    const isOtpValid = String(user.reset_otp).trim() === String(otp).trim();
    const isOtpExpired = new Date() > new Date(user.reset_expr);

    if (!isOtpValid || isOtpExpired) {
      throw new Error('Invalid or expired OTP.');
    }

    const hashedPassword = await encryptPassword(newPassword);
    const updateQuery = 'UPDATE users SET password = ?, reset_otp = NULL, reset_expr = NULL WHERE email = ?';
    const [result] = await (await this.ensureConnection()).query(updateQuery, [hashedPassword, email]);

    return result.affectedRows > 0;
  }

  async getCommunities() {
    const connection = await this.connect();
    try {
      const [rows] = await connection.query('SELECT community_id, name, description FROM communities');
      return rows;
    } catch (error) {
      console.error('Error fetching communities:', error);
      throw error;
    }
  }

}

export default UserModel;
