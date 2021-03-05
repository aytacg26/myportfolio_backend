export const ANONYMOUS_USER = 'ANONYMOUS_USER';
export const FOLLOWER = 'FOLLOWER';
export const FOLLOWING = 'FOLLOWING';
export const FOLLOWER_AND_FOLLOWING = 'FOLLOWER_AND_FOLLOWING';
export const AUTH_USER = 'AUTH_USER';

/**
 *
 * @param {Object} targetUser -  A Target User which auth user tries to see his/her profile
 * @param {String} authUserId  - Auth User who tries to see profile of target user
 * @returns                    - Boolean (true or false)
 */
export const hasABlock = (targetUser, authUserId) => {
  const isAuthUserBlockedByTargetUser =
    targetUser.blockedUsers.filter(
      (blockedUser) => blockedUser.userId === authUserId
    ).length > 0;

  const isTargetUserBlockedByAuthUser =
    targetUser.blockedBy.filter((blocker) => blocker.userId === authUserId)
      .length > 0;

  return isAuthUserBlockedByTargetUser && isTargetUserBlockedByAuthUser;
};

/**
 * With this function, we will get the privacy of the user about the mentioned options, if the result is true, it means, user selected that privacy option
 * and hence all processes should be taken accout by considering that privacy option, For example, if targetPrivacy = account returns true, that means
 * user account is private, else it is public
 * type options : p - public, om - onlyMe, ofr - onlyFollowers, ofg - onlyFollowings, off - onlyFollowingsAndFollowers
 * @param {Object} targetUser  - The target user that we would like to see privacy options
 * @param {String} targetPrivacy  - target privacy option ("account", "follower" or "following"), one of the three options will be mentioned
 * @param {String} type - default is "p"; if target privacy is "follower" or "following", we need to mention which type of privacy result we would like to have ("p", "om", "ofr", "ofg", "off")
 * p - public, om - onlyMe, ofr - onlyFollowers, ofg - onlyFollowings, off - onlyFollowersAndFollowings,
 * @returns - Boolean (true or false), it will return true if the given privacy option is selected by target user
 */
export const getTargetPrivacy = (targetUser, targetPrivacy, type = 'p') => {
  const target =
    targetPrivacy.toLowerCase() === 'account'
      ? 'account'
      : `${targetPrivacy.toLowerCase()}-${type.toLowerCase()}`;

  const {
    everyone,
    onlyMe,
    onlyFollowers,
    onlyFollowings,
    onlyFollowersAndFollowings,
  } = targetUser.privacy.showFollowers;
  targetPrivacy.toLowerCase() === 'follower'
    ? targetUser.privacy.showFollowers
    : targetPrivacy.toLowerCase() === 'following'
    ? targetUser.privacy.showFollowings
    : {};

  switch (target) {
    case 'account':
      return targetUser.privacy.privateAccount;
    case 'follower-p':
    case 'following-p':
      return everyone;
    case 'follower-om':
    case 'following-om':
      return onlyMe;
    case 'follower-ofr':
    case 'following-ofr':
      return onlyFollowers;
    case 'follower-ofg':
    case 'following-ofg':
      return onlyFollowings;
    case 'follower-off':
    case 'following-off':
      return onlyFollowersAndFollowings;
  }
};

/**
 * we will check if the authUser is allowed by target user to have link to Followers and Followings in his/her profile to the visitor, according to type of authUser
 * if visitor is an anonymous user, it will return false in any case
 * @param {String} typeOfSearch - "follower" or "following", it will check follower privacy or following privacy
 * @param {String} typeOfUser - "FOLLOWER" of targetUser, "FOLLOWING" of targetUser, only a "AUTH_USER" or "ANONYMOUS_USER"
 * @param {Object} targetUser - target user which we would like to check if the authUser will have a link to followers or followings of targetUser according to the privacy of targetUser
 * @returns - Boolean (true or false), if privacy options of targetUser allows link to his/her followers to the authUser, it will return true, otherwise, will return false
 */
export const hasLinkTo = (typeOfSearch, typeOfUser, targetUser) => {
  const Public = getTargetPrivacy(targetUser, typeOfSearch, 'p');
  const FollowersAndFollowings = getTargetPrivacy(
    targetUser,
    typeOfSearch,
    'off'
  );
  const OnlyFollowings = getTargetPrivacy(targetUser, typeOfSearch, 'ofr');
  const OnlyFollowers = getTargetPrivacy(targetUser, typeOfSearch, 'ofg');

  switch (typeOfUser) {
    case FOLLOWER:
      return Public || FollowersAndFollowings || OnlyFollowers;
    case FOLLOWING:
      return Public || FollowersAndFollowings || OnlyFollowings;
    case FOLLOWER_AND_FOLLOWING:
      return (
        Public || FollowersAndFollowings || OnlyFollowers || OnlyFollowings
      );
    case AUTH_USER:
      return Public;
    default:
      return false;
  }
};

/**
 *
 * @param {Boolean} isFollowing - from db, we will check if the authUser follows targetUser
 * @param {Boolean} isFollower - from db, we will check if the authUser is followed by targetUser
 * @param {Boolean} isAuthUser - if user passed authentication and has a token, s/he is a authUser
 * @returns String value of type of user as "AUTH_USER" or "FOLLOWING" or "FOLLOWER" or "FOLLOWER_AND_FOLLOWING" or "ANONYMOUS_USER"
 */
export const getTypeOfUser = (isFollowing, isFollower, isAuthUser) => {
  if (isAuthUser) {
    if (isFollowing && isFollower) {
      return FOLLOWER_AND_FOLLOWING;
    } else if (isFollowing) {
      return FOLLOWING;
    } else if (isFollower) {
      return FOLLOWER;
    } else {
      return AUTH_USER;
    }
  } else {
    return ANONYMOUS_USER;
  }
};
