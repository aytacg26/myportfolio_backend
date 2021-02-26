export const FollowListViewModel = (list, type = 'follower') => {
  switch (type) {
    case 'follower':
      return list
        .map((follower) => follower.follower)
        .map((fol) => {
          return {
            userId: fol.userId._id,
            name: fol.userId.name,
            surname: fol.userId.surname,
            avatar: fol.userId.avatar,
            followStartDate: fol.followStartDate,
            amIFollowing: fol.amIFollowing,
          };
        });
    case 'following':
      return list
        .map((following) => following.following)
        .map((fol) => {
          return {
            userId: fol.userId._id,
            name: fol.userId.name,
            surname: fol.userId.surname,
            avatar: fol.userId.avatar,
            followingStartDate: fol.followingStartDate,
          };
        });
    case 'fromUser':
      return list.map((fromUser) => fromUser.fromUser);
    case 'toUser':
      return list.map((toUser) => toUser.toUser);
    case 'rejectedUser':
      return list.map((rejectedUser) => rejectedUser.rejectedUser);
    default:
      return [];
  }
};
