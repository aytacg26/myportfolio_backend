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
 * p - public, om - onlyMe, ofr - onlyFollowers, ofg - onlyFollowings, off - onlyFollowersAndFollowings
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
