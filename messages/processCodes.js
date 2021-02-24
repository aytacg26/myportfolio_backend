const messageCodes = Object.freeze({
  'Update Saved to Server': 'S',
  'New User Created': 'CU',
  Unfollow: 'UF',
  Follow: 'F',
  'Follow Request Cancelled': 'FRC',
  'Follow Request Send': 'FRS',
  'No User Found': 'NU',
  'Dummy Request Send': 'DRS',
  'User Has No Followers': 'UHNF',
  'User Has No Follow Request': 'UHNFR',
  'User has not sent any Follow Request': 'NSAFR',
  'User removed from follower list': 'URFFL',
  'Follow Request Accepted': 'FRA',
  'Follow Request Rejected': 'FRR',
  'Follow Id Conflict': 'FIC',
  'User removed from Reject List': 'URFRL',
});

export default messageCodes;
