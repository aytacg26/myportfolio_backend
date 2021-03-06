import { errorMessage } from '../../messages/messages.js';
import messageCodes from '../../messages/processCodes.js';
import User from '../../Models/User.js';
import Following from '../../Models/Following.js';
import Follower from '../../Models/Follower.js';
import UserProfile from '../../Models/UserProfile.js';
import {
  hasABlock,
  getTargetPrivacy,
  getTypeOfUser,
  hasLinkTo,
} from './profileControllerUtils.js';

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

    //TODO:
    //User's profile will be opened for edit purpose, this part must be revised according to the status of profile
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
    const targetUserId = req.params.id;
    const targetUser = await User.findById(targetUserId);
    let result;

    //A user may not have a completed profile, in such case, we need to show a profile page with empty cover photo (we will have default), avatar, name, profession
    //and for other parts, we will show nothing or "no photo yet", "no article yet", "no github repo yet" etc.

    if (!targetUser) {
      return errorMessage(
        res,
        404,
        'No user found',
        messageCodes['No User Found']
      );
    }

    //2- if exists Check if the targetUser has a private account or not
    //const isPrivateAccount = targetUser.privacy.privateAccount;
    const isPrivateAccount = getTargetPrivacy(targetUser, 'account');

    //if user is an authUser
    if (isAuthUser) {
      const authUserId = req.user.id;
      const isAuthUserAlsoTargetUser = authUserId === targetUserId;

      //if user enters his/her own Id, we need to forward him/her to getMyProfile() function
      if (isAuthUserAlsoTargetUser) return getMyProfile(req, res);

      const isBlocked = hasABlock(targetUser, authUserId);

      if (isBlocked) {
        return errorMessage(
          res,
          404,
          'No user found',
          messageCodes['No User Found']
        );
      }

      const doesAuthUserHasFollowRequestToTargetUser =
        targetUser.followRequestReceived.filter(
          (followRequestFrom) => followRequestFrom.userId === authUserId
        ).length > 0;

      //Find if the auth user has targetUser in his/her followings: If yes, there is no blocked, no need to check other possibilities and
      //no need to consider if it is Private Account or not
      //is authUser follower of targetUser
      const isInFollowings = await Following.findOne({
        user: authUserId,
        'following.userId': targetUserId,
      });

      //is targetUser follower of authUser
      const isInFollowers = await Follower.findOne({
        user: authUserId,
        'follower.userId': targetUserId,
      });

      const targetUserProfile = await UserProfile.findOne({
        user: targetUserId,
      });

      const typeOfUser = getTypeOfUser(
        isInFollowings,
        isInFollowers,
        isAuthUser
      );
      const hasLinkToFollowers = hasLinkTo('follower', typeOfUser, targetUser);
      const hasLinkToFollowings = hasLinkTo(
        'following',
        typeOfUser,
        targetUser
      );

      //BU BÖLÜM HALEN TAMAMLANMADI, RESULT SADECE TEST AMAÇLIDIR... DÜZENLENSİN!!
      //ADIMLARI TEKRARDAN GÖZDEN GEÇİR...
      //createUserProfile oluşturulduktan sonra her türlü olasılığa karşı test edilsin
      if (isPrivateAccount) {
        //TargetUSER, authUser'in following'leri arasında mı, yani authUser targetUser'in follower'i mi?
        //Buradaki mantık, targetUser privateAccount'una authUser'i kabul etmiş ise, authUser artık targetUser'in profilini görebilmelidir.
        if (isInFollowings) {
          //After Create Profile, we will create a profile and will populate the profile with the other data
          //TODO : create UserProfileViewModel func. instead of creating a result object
          result = {
            userId: targetUser._id,
            profile: targetUserProfile === null ? {} : targetUserProfile,
            name: targetUser.name,
            surname: targetUser.surname,
            avatar: targetUser.avatar,
            Followers: targetUser.numOfFollowers,
            Followings: targetUser.numOfFollowings,
            hasLinkToFollowers,
            hasLinkToFollowings,
            visitorIsAuthUser: isAuthUser,
            isOwnProfile: isAuthUserAlsoTargetUser,
            isInFollowings: true,
            hasFollowingRequestFromAuthUser: !isInFollowings,
          };
        } else {
          //ACCOUNTUN PRIVATE OLMASI VE AUTH_USER'IN FOLLOWINGLERI İÇERİSİNDE YER ALMAMASI DURUMUNDA DÖNDÜRECEĞİMİZ SONUÇ :
          //Yani hedef kullanıcı, authUser tarafından takip edilmemektedir, izin verilmemiş veya takip isteği gönderilmemiştir.
          //Böyle bir durumda, authUser, targetUser'in profilini göremeyecektir.
          result = {
            userId: targetUser._id,
            name: targetUser.name,
            surname: targetUser.surname,
            avatar: targetUser.avatar,
            Followers: targetUser.numOfFollowers,
            Followings: targetUser.numOfFollowings,
            hasLinkToFollowers,
            hasLinkToFollowings,
            visitorIsAuthUser: isAuthUser,
            isOwnProfile: isAuthUserAlsoTargetUser,
            isInFollowings: false,
            hasFollowingRequestFromAuthUser: doesAuthUserHasFollowRequestToTargetUser,
          };
        }
      } else {
        //ACCOUNT'UN PUBLIC OLMASI DURUMUNDA GERI GÖNDÜRECEĞİMİZ SONUÇ
        result = {
          userId: targetUser._id,
          profile: targetUserProfile === null ? {} : targetUserProfile,
          name: targetUser.name,
          surname: targetUser.surname,
          avatar: targetUser.avatar,
          Followers: targetUser.numOfFollowers,
          Followings: targetUser.numOfFollowings,
          hasLinkToFollowers,
          hasLinkToFollowings,
          visitorIsAuthUser: isAuthUser,
          isOwnProfile: isAuthUserAlsoTargetUser,
          isInFollowings: true,
          hasFollowingRequestFromAuthUser: !isInFollowings,
        };
      }

      res.json(result);
    } else {
      res.send(isAuthUser);
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
    console.log(error);
    return errorMessage(res);
  }
};

/**
 * TODO: Not Completed
 * @route           POST api/profile/user/coverphoto
 * @description     Upload Cover Photo of User
 * @access          Private
 */
const uploadUserCoverPhoto = async (req, res) => {};

/**
 * TODO: Not Completed
 * @route           POST api/profile/user/avatar
 * @description     Upload Avatar of User
 * @access          Private
 */
const uploadUserAvatar = async (req, res) => {};

/**
 * @route         POST api/profile
 * @description   Create Profile of User
 * @access        Private
 */
const createProfile = async (req, res) => {
  res.send(req.body);
};

const UserProfileController = Object.freeze({
  getMyProfile,
  getUserProfileById,
  uploadUserCoverPhoto,
  uploadUserAvatar,
  createProfile,
});

export default UserProfileController;
