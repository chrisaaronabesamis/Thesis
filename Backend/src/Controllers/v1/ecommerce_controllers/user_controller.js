import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import UserModel from '../../../Models/ecommerce_model/user_model.js';

class UserController {
  constructor() {
    this.userModel = new UserModel();
  }


  // register user 
  async createUser(req, res) {
  const { username, password, email, firstname, lastname, imageUrl } = req.body;

  console.log(req.body)

  // Check if all fields are provided
  if (!username || !password || !email  || !firstname || !lastname) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  // Check if email is a Gmail account
  const emailPattern = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
  if (!emailPattern.test(email)) {
    return res.status(400).json({ error: 'Email must be a valid Gmail account' });
  }

  try {
    const userId = await this.userModel.createUser({ username, password, email, firstname, lastname, imageUrl });
    return res.status(201).json({ message: 'User created successfully', userId });
  } catch (error) {
    console.error('Error creating user:', error.message);

    // If error message comes from model (e.g. "Username already taken")
    if (
      error.message === 'Username already taken' ||
      error.message === 'Email already registered'
    ) {
      return res.status(400).json({ error: error.message });
    }

    // Default server error
    return res.status(500).json({ error: 'Failed to create user' });
  }
}

  async loginUser(req, res) {
    const { email, password } = req.body;
    console.log('Received body:', req.body);

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    try {
      console.log('Attempting login for email:', email);

      // Call verify()
      const result = await this.userModel.verify(email, password);
      console.log('Verification result:', result);

      if (!result || result.status !== 'success') {
        const message = result?.message || 'Invalid credentials';
        console.log('Login failed:', message);
        return res.status(401).json({ error: message });
      }

      const user = result.user;

      const token = jwt.sign(
        { email: email, id: user.user_id },
        process.env.API_SECRET_KEY,
        { expiresIn: '1d' }
      );

      console.log('User authenticated successfully:', email);

      return res.status(200).json({ message: 'Login successful', token });

    } catch (error) {
      console.error('Error during login:', error);
      return res.status(500).json({ error: 'Login failed: ' + error.message });
    }
  }



  // Request OTP for password reset
  async requestPasswordReset(req, res) {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required.' });
    }

    try {
      const response = await this.userModel.requestPasswordReset(email);

      if (response.status === 'error') {
        if (response.message.includes('No user')) {
          return res.status(404).json(response);
        } else if (response.message.includes('Please wait')) {
          return res.status(429).json(response);
        }
        return res.status(400).json(response);
      }

      return res.status(200).json(response);

    } catch (error) {
      console.error('Error requesting password reset:', error.message);
      return res.status(500).json({ error: 'Failed to send OTP.' });
    }
  }


  async resetPassword(req, res) {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ error: 'Email, OTP, and new password are required.' });
    }

    try {
      const success = await this.userModel.verifyOtpAndResetPassword(email, otp, newPassword);

      if (!success) {
        return res.status(400).json({ error: 'Invalid or expired OTP.' });
      }

      return res.status(200).json({ message: 'Password has been reset successfully.' });

    } catch (error) {
      console.error('Error resetting password:', error.message);
      return res.status(500).json({ error: 'Failed to reset password.' });
    }
  }



  async GetAllUser(req, res) {
    try {
      const users = await this.userModel.getAllUsers();

      console.log(users);
      if (!users || users.length === 0) {
        return res.status(404).json({ error: 'No users found' });

      }

      return res.status(200).json({ users });
    } catch (error) {
      console.error('Error fetching all users:', error.message);
      return res.status(500).json({ error: 'Failed to fetch users' });
    }
  }

  async getUserProfile(req, res) {
    const userId = res.locals.userId;

    try {
      const user = await this.userModel.getUserById(userId);

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      return res.status(200).json({ user });
    } catch (error) {
      console.error('Error fetching user profile:', error.message);
      return res.status(500).json({ error: 'Failed to fetch user profile' });
    }
  }

  async getfollowProfile(req, res) {
    const userId = req.params.id;

    try {
      const user = await this.userModel.getUserById(userId);

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      return res.status(200).json({ user });
    } catch (error) {
      console.error('Error fetching user profile:', error.message);
      return res.status(500).json({ error: 'Failed to fetch user profile' });
    }
  }

  async GetUser(req, res) {
    const userId = req.params.id;
    try {
      const user = await this.userModel.getUserById(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      return res.status(200).json({ user });
    } catch (error) {
      console.error('Error fetching user:', error.message);
      return res.status(500).json({ error: 'Failed to fetch user' });
    }
  }


  
  async logoutUser (req, res) {
    const token = req.headers['authorization']?.split(' ')[1];

    if (!token) {
        return res.status(400).json({ error: 'Token is required' });
    }
    return res.status(200).json({ message: 'Logged out successfully' });
}

  async follow(req, res) {
    const followerId = res.locals.userId;
    const followedId = req.params.id;

    console.log('Follow Request:', { followerId, followedId });

    if (!followedId) {
      return res.status(400).json({ error: 'Followed user ID is required' });
    }

    try {
      const success = await this.userModel.follow(followerId, followedId);

      if (success) {
        return res.status(200).json({ message: 'Successfully followed user' });
      } else {
        return res.status(400).json({ error: 'Failed to follow user' });
      }
    } catch (error) {
      console.error('Error following user:', error.message);
      return res.status(500).json({ error: 'Failed to follow user' });
    }
  }

  async unfollow(req, res) {
    const followerId = res.locals.userId;
    const followedId = req.params.id;

    if (!followedId) {
      return res.status(400).json({ error: 'Followed user ID is required' });
    }

    try {
      const success = await this.userModel.unfollow(followerId, followedId);

      if (success) {
        return res.status(200).json({ message: 'Successfully unfollowed user' });
      } else {
        return res.status(400).json({ error: 'Failed to unfollow user' });
      }
    } catch (error) {
      console.error('Error unfollowing user:', error.message);
      return res.status(500).json({ error: 'Failed to unfollow user' });
    }
  }

  async getFollowerList(req, res) {
    const { id } = req.params;

    try {
      const followers = await this.userModel.getFollowers(id);

      if (!followers) {
        return res.status(404).json({ error: 'No followers found' });
      }

      return res.status(200).json({ followers });
    } catch (error) {
      console.error('Error fetching followers:', error.message);
      return res.status(500).json({ error: 'Failed to fetch followers' });
    }
  }

  async getFollowerCount(req, res) {
    const userId = req.params.id;
    try {
      const followerCount = await this.userModel.getFollowerCount(userId);

      if (followerCount === null) {
        return res.status(404).json({ error: 'User not found' });
      }
      return res.status(200).json({ followerCount });
    } catch (error) {
      console.error('Error fetching follower count:', error.message);
      return res.status(500).json({ error: 'Failed to fetch follower count' });
    }
  }

  async getFollowingCount(req, res) {
    const userId = req.params.id;

    try {
      const count = await this.userModel.getFollowingCount(userId);

      return res.status(200).json({ followingCount: count });
    } catch (error) {
      console.error('Error fetching following count:', error.message);
      return res.status(500).json({ error: 'Failed to fetch following count' });
    }
  }

  async getFollowingList(req, res) {
    const { id } = req.params;

    try {
      const following = await this.userModel.getFollowing(id);

      if (!following) {
        return res.status(404).json({ error: 'No followed users found' });
      }

      return res.status(200).json({ following });
    } catch (error) {
      console.error('Error fetching followed users:', error.message);
      return res.status(500).json({ error: 'Failed to fetch followed users' });
    }
  }


  async isfollowing(req, res) {
    const userId = res.locals.userId;
    const followedId = req.params.id;

    if (!followedId) {
      return res.status(400).json({ error: 'Followed user ID is required' });
    }

    try {
      const isFollowing = await this.userModel.isFollowing(userId, followedId);

      return res.status(200).json({ isFollowing });
    } catch (error) {
      console.error('Error checking following status:', error.message);
      return res.status(500).json({ error: 'Failed to check following status' });
    }
  }

  async updateUser(req, res) {
    const userId = res.locals.userId;
    const { fullname, profile_picture } = req.body;

    if (!fullname && !imageUrl) {
      return res.status(400).json({ error: 'At least one field is required to update' });
    }

    try {
      const updates = {};
      if (fullname) updates.fullname = fullname;
      if (profile_picture) updates.profile_picture = profile_picture;

      const success = await this.userModel.updateUser(userId, updates);

      if (success) {
        return res.status(200).json({ message: 'User profile updated successfully' });
      } else {
        return res.status(400).json({ error: 'Failed to update user profile' });
      }
    } catch (error) {
      console.error('Error updating user:', error.message);
      return res.status(500).json({ error: 'Failed to update user profile' });
    }
  }

  async getCommunities(req, res) {
    try {
      const communities = await this.userModel.getCommunities();
      return res.status(200).json({ communities });
    } catch (error) {
      console.error('Error fetching communities:', error);
      return res.status(500).json({ error: 'Failed to fetch communities' });
    }
  }

}


export default UserController;
