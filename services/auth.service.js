import authRepository from '../repositories/auth.repository.js';
import { generateTokens } from '../utils/generateToken.js';

class AuthService {
  async registerUser(userData) {
    const userExists = await authRepository.findUserByEmail(userData.email);
    if (userExists) {
      throw new Error('User already exists');
    }

    const user = await authRepository.createUser(userData);
    const tokens = generateTokens(user._id);
    return { user, tokens };
  }

  async loginUser(email, password) {
    const user = await authRepository.findUserByEmail(email);
    if (user && (await user.matchPassword(password))) {
      const tokens = generateTokens(user._id);
      return { user, tokens };
    } else {
      throw new Error('Invalid email or password');
    }
  }

  async getUserProfile(userId) {
    const user = await authRepository.findUserById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }
}

export default new AuthService();
