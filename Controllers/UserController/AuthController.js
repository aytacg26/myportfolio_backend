import { errorMessage } from '../../messages/messages.js';
import User from '../../Models/User.js';
import { UserViewModel } from '../../ViewModels/UserViewModel.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import config from 'config';

//Get Authenticated user data
const getAuthUserData = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');

    if (!user) {
      return errorMessage(res, 404, 'User not found');
    }

    const userView = UserViewModel(user);

    res.json(userView);
  } catch (error) {
    console.error(error.message);
    errorMessage(res);
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return errorMessage(res, 400, 'Invalid Credentials');
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return errorMessage(res, 400, 'Invalid Credentials');
    }

    const isVerified = user.isVerified;
    const isActive = user.isActive;

    if (!isVerified) {
      return errorMessage(
        res,
        400,
        'Please verify your email address to login'
      );
    }

    if (!isActive) {
      user.isActive = true;
      await user.save();
    }

    const userView = UserViewModel(user);

    const payload = {
      user: {
        id: user.id,
      },
    };

    jwt.sign(
      payload,
      config.get('jwtSecret'),
      { expiresIn: 7200 },
      (error, token) => {
        if (error) throw error;

        res.json({ userView, token });
      }
    );
  } catch (error) {
    console.error(error.message);
    errorMessage(res);
  }
};

const AuthController = Object.freeze({
  getAuthUserData,
  loginUser,
});

export default AuthController;
