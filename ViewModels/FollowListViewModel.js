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
      return list
        .map((fromUser) => {
          return {
            fromUser: fromUser.fromUser,
            requestDate: fromUser.requestDate,
          };
        })
        .map((fu) => {
          const { _id, name, surname, avatar } = fu.fromUser.userId;
          return {
            userId: _id,
            name,
            surname,
            avatar,
            requestDate: fu.requestDate,
          };
        });

    case 'toUser':
      return list
        .map((toUser) => {
          return {
            requestSentUser: toUser.toUser,
            requestDate: toUser.requestDate,
          };
        })
        .map((tU) => {
          const { _id, name, surname, avatar } = tU.requestSentUser.userId;
          return {
            userId: _id,
            name,
            surname,
            avatar,
            requestDate: tU.requestDate,
          };
        });
    case 'rejectedUser':
      return list.map((rejectedUser) => {
        const { _id, name, surname, avatar } = rejectedUser.rejectedUser.userId;
        return {
          userId: _id,
          name,
          surname,
          avatar,
        };
      });
    default:
      return [];
  }
};
