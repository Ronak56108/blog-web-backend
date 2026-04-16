import authService from '../services/auth.service.js';
import jwt from 'jsonwebtoken';

class AuthController {
  async register(req, res, next) {
    try {
      const { name, email, password } = req.body;
      const { user, tokens } = await authService.registerUser({ name, email, password });

      res.cookie('refreshToken', tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      res.status(201).json({
        message: 'User registered successfully',
        accessToken: tokens.accessToken,
        user: { _id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar },
      });
    } catch (error) {
      if (error.message === 'User already exists') {
        res.status(400);
      }
      next(error);
    }
  }

  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const { user, tokens } = await authService.loginUser(email, password);

      res.cookie('refreshToken', tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      res.status(200).json({
        message: 'Login successful',
        accessToken: tokens.accessToken,
        user: { _id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar },
      });
    } catch (error) {
      if (error.message === 'Invalid email or password') {
        res.status(401);
      }
      next(error);
    }
  }

  async logout(req, res) {
    res.cookie('refreshToken', '', {
      httpOnly: true,
      expires: new Date(0),
    });
    res.status(200).json({ message: 'Logged out successfully' });
  }

  async refreshToken(req, res, next) {
    try {
      const { refreshToken } = req.cookies;

      if (!refreshToken) {
        return res.status(401).json({ message: 'Refresh token not found' });
      }

      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
      
      const tokens = {
        accessToken: jwt.sign(
          { userId: decoded.userId },
          process.env.JWT_ACCESS_SECRET,
          { expiresIn: process.env.JWT_ACCESS_EXPIRES_IN }
        )
      };

      res.status(200).json({ accessToken: tokens.accessToken });
    } catch (error) {
      res.status(401).json({ message: 'Invalid refresh token' });
    }
  }

  async getProfile(req, res, next) {
    try {
      const user = await authService.getUserProfile(req.user._id);
      res.status(200).json(user);
    } catch (error) {
      next(error);
    }
  }
}

export default new AuthController();
