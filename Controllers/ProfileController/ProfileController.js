import { errorMessage } from '../../messages/messages.js';
import messageCodes from '../../messages/processCodes.js';
import UserProfile from '../../Models/UserProfile.js';

/**
 * @route           GET api/profile/myprofile
 * @description     Get Current User Profile (When user enters his/her profile)
 * @access          Private
 */

const getMyProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const profile = await UserProfile.findById(userId).populate('user', {
      name: 1,
      surname: 1,
      avatar: 1,
      profession: 1,
    });

    if (!profile) {
      return errorMessage(
        res,
        404,
        'Profile not Created Yet.',
        messageCodes['Profile Not Exists']
      );
    }

    res.json({ profile, isOwnProfile: true });
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return errorMessage(
        res,
        404,
        'No user found',
        messageCodes['No User Found']
      );
    }

    return errorMessage;
  }
};

/**
 * @route           GET api/profile/user/:id
 * @description     Get profile of another user (auth user will be able to enter profiles of other users if they are not private, if they are private and is a following of the user)
 * @access          Private/Public (depends on the user privacy options)
 */
const getUserProfileById = async (req, res) => {
  try {
    const isAuthUser = req.isAuthUser;

    if (isAuthUser) {
      const authUser = req.user.id;
      const targetUser = req.params.id;
      const isAuthUserAlsoTargetUser = authUser === targetUser;

      if (isAuthUserAlsoTargetUser) return getMyProfile(req, res);

      //if user enters his/her own Id, we need to forward him/her to getMyProfile() function
      //if user is an authUser
      //1- Check if the targetUser with a given Id is exist or not
      //2- if exists Check if the targetUser has a private account or not
      //3- if not a private account, show profile with all details, if it is, just show cover page, user avatar, user name and profession and also follow request button
      //4- if account is a private account, check if the authUser is a following of the targetUser or not (If s/he is a following of the authUser, show profile, if not or even if s/he is a follower
      //and has private account just show cover page, user avatar, user name and profession and a follow request button)
      res.send({
        profile: { name: 'A User Name', surname: 'A User Surname', age: 39 },
        isAuthUser,
        isOwnProfile: false,
      });
    } else {
      // Check if the user is an authUser or anonymous user
      //if user is an anonymous user,
      //1- Check if the targetUser with a given Id is exist or not
      //2- if Exists, check if the targetUser has private account or not
      //3- if targetUser has private accout, forward anonymous user to login page
      //4- if targetUser has public account, just show cover page, user avatar, user name and profession and also sign in button
      res.send({
        profile: { name: 'TestName', surname: 'TestSurname' },
        isAuthUser,
        isOwnProfile: false,
      });
    }
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return errorMessage(
        res,
        404,
        'No user found',
        messageCodes['No User Found']
      );
    }
    return errorMessage(res);
  }
};

const UserProfileController = Object.freeze({
  getMyProfile,
  getUserProfileById,
});

export default UserProfileController;
