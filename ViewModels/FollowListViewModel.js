export const FollowListViewModel = (list, type = 'follower') => {
  switch (type) {
    case 'follower':
      return list.map((follower) => follower.follower);
    case 'following':
      return list.map((following) => following.following);
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
