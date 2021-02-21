import User from '../../Models/User.js';
import Following from '../../Models/Following.js';
import Follower from '../../Models/Follower.js';
import ReceivedFollowRequest from '../../Models/ReceivedFollowRequest.js';
import SentFollowRequest from '../../Models/SentFollowRequest.js';
import RejectedFollower from '../../Models/RejectedFollower.js';
import messageCodes from '../../messages/processCodes.js';
import { completedMessage, errorMessage } from '../../messages/messages.js';
import { FollowListViewModel } from '../../ViewModels/FollowListViewModel.js';

//api/follow/followers
//GET
//This will get all followers of the authenticated user
const getAllFollowers = async (req, res) => {
  //we will get all followers of the auth user.
  try {
    //Find Followers from the userId
    const userFollowers = await Follower.find({ user: req.user.id });

    const followers = FollowListViewModel(userFollowers, 'follower');

    res.json(followers);
  } catch (error) {
    console.error(error.message);
    if (error.kind === 'ObjectId') {
      return completedMessage(
        res,
        200,
        [],
        messageCodes['User Has No Followers']
      );
    }

    return errorMessage(res);
  }
};

//api/follow/followings
//GET
//This will get all followings of the authenticated user
const getAllFollowings = async (req, res) => {
  try {
    const userFollowings = await Following.find({ user: req.user.id });

    const followings = FollowListViewModel(userFollowings, 'following');

    res.json(followings);
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return completedMessage(
        res,
        200,
        [],
        messageCodes['User Has No Followers']
      );
    }

    return errorMessage(res);
  }
};

//api/follow/followrequests
//GET
//this will get all follow requests received by authenticated user
const getAllReceivedFollowRequests = async (req, res) => {
  //This will give the list of all follow requests to auth user, auth user will be able to see all follow requests s/he received but not rejected or accepted by himself or herself
  //The rejected or accepted requests will be deleted from the follow requests list

  try {
    const userFollowRequests = await ReceivedFollowRequest.find({
      user: req.user.id,
    });

    const followReqestsList = FollowListViewModel(
      userFollowRequests,
      'fromUser'
    );

    res.json(followReqestsList);
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return completedMessage(
        res,
        200,
        [],
        messageCodes['User Has No Follow Request']
      );
    }

    return errorMessage(res);
  }
};

//api/follow/sentfollowrequests
//GET
//This will get all sent requests by authenticated user
const getAllSentFollowRequests = async (req, res) => {
  try {
    const sentFollowRequests = await SentFollowRequest.find({
      user: req.user.id,
    });

    const sentFollowRequestList = FollowListViewModel(
      sentFollowRequests,
      'toUser'
    );

    res.json(sentFollowRequestList);
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return completedMessage(
        res,
        200,
        [],
        messageCodes['User has not sent any Follow Request']
      );
    }

    return errorMessage(res);
  }
};

//api/follow/listOfRejected
//GET
//This will get all rejected follow requests by auth user (The list of users whose follow request rejected by auth user)
const getAllRejectedFollowRequests = async (req, res) => {
  try {
    const authUserId = req.user.id;
    const listOfRejected = await RejectedFollower.find({ user: authUserId });

    const rejectedUsersList = FollowListViewModel(
      listOfRejected,
      'rejectedUser'
    );

    res.json(rejectedUsersList);
  } catch (error) {
    console.error(error.message);
    return errorMessage(res);
  }
};

//api/follow/:idToRemove
//DELETE
//This will remove a follower of the user from his/her followers list
const removeFollower = async (req, res) => {
  try {
    const followerId = req.params.idToRemove;

    //check users if such user exists
    const follower = await User.findById(followerId);
    const authUser = await User.findById(req.user.id);

    if (!follower || !authUser) {
      return errorMessage(
        res,
        404,
        'No user found at given id',
        messageCodes['No User Found']
      );
    }

    //Remove from the follower array of the user
    const newFollowersList = authUser.followers.filter(
      (follower) => follower.userId !== followerId
    );
    authUser.followers = newFollowersList;

    authUser.save();

    //Remove from the following array of the removed user
    const newFollowingList = follower.followings.filter(
      (following) => following.userId !== req.user.id
    );
    follower.followings = newFollowingList;

    follower.save();

    //Remove follower document of user and follower
    await Follower.findOneAndDelete({
      user: req.user.id,
      'follower.userId': followerId,
    });

    //Remove following document of follower and user
    await Following.findOneAndDelete({
      user: followerId,
      'following.userId': req.user.id,
    });

    return completedMessage(
      res,
      200,
      'User removed from followers successfully',
      messageCodes['User removed from follower list']
    );
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

//api/follow/:idToFollow
//POST
//Send and Remove Follow Request and Follow bu fonksiyonunan gerçekleşmektedir. (All follow, follow requests, unfollow processes will take place here.)
const followUnfollow = async (req, res) => {
  try {
    const authUserId = req.user.id;
    const toFollow = req.params.idToFollow;
    //1- Gönderen Kullanıcı Bulunur, kullanıcının göndermiş olduğu request, eğer karşı tarafın accountu privateAccount ise, sentFollowRequest şemasına işlenir ve aynı zamanda following request send arrayine de işlenir.
    //2- Request'i alan kullanıcı bulunur, Request'i alan kullanıcının privacy.privateAccount true ise, Request, alan kullanıcının ReceivedFollowRequest şemasına ve followRequestReceived arrayine işlenir
    //Eğer account privateAccout değil ise yani privateAccount false ise, bu durumda, gönderenin Following Schema'sına, alıcının da Followers şemasına işlem gerçekleşitirlir aynı zamanda gönderenin following arrayi ve
    //alıcının follower arraylerine de işlem gerçekleştirilir.
    const user = await User.findById(authUserId);
    const toUser = await User.findById(toFollow);

    if (!user || !toUser) {
      return errorMessage(
        res,
        400,
        "Couldn't find the user",
        messageCodes['No User Found']
      );
    }

    const isFollowing =
      user.followings.filter((following) => following.id === toFollow).length >
      0;

    //Eğer takip ettiği bir kişi ise unfollow işlemi uygulanır
    if (isFollowing) {
      await Following.findOneAndDelete({
        user: authUserId,
        'following.userId': toFollow,
      });

      await Follower.findOneAndDelete({
        user: toFollow,
        'follower.userId': authUserId,
      });

      //kullanıcı hali hazırda takip ediyor ise unfollow işlemini gerçekleştirmek istiyor demektir yani kullanıcı takipten vazgeçmek istiyor demektir. Bu durumda
      //aynı zamanda followRequest gönderimi yapılan kişiye aslında unfollow işlemi uygulandığından, takipçi listesinden user çıkartılacaktır.
      const userNewFollowingList = user.followings.filter(
        (following) => following.userId !== toFollow
      );
      const toUserNewFollowerList = toUser.followers.filter(
        (follower) => follower.userId !== authUserId
      );

      user.followings = userNewFollowingList;
      toUser.followers = toUserNewFollowerList;

      await user.save();
      await toUser.save();

      return completedMessage(
        res,
        200,
        'Unfollow: Unfollow process completed',
        messageCodes.Unfollow
      );
    }
    //TAKIP ETME IPTALI SONU

    //Eğer follow request gönderdiği bir kişi ise, follow request iptal edilir. Tabi böyle bir şeyin söz konusu olması için follow request gönderilen kişinin accountu private olmalıdır
    //ancak burada şöle bir durum söz konusu olabilir, kullanıcı account'unu daha sonradan private yapmış olabilir. zaten böyle bir durumda isFollowing true olacaktır ve aynı zamanda hasFollowingRequestSend'de false olacaktır
    const hasFolowingRequestSend =
      user.followingRequestSend.filter((frs) => frs.userId === toFollow)
        .length > 0;

    if (hasFolowingRequestSend) {
      //Eğer following request göndermiş olduğu biri ise, kullanıcının followingRequestSend listesi revize edilir, request gönderilen kişinin followRequestListesi revize edilir.
      const newFollowingRequestSendList = user.followingRequestSend.filter(
        (frs) => frs.userId !== toFollow
      );
      user.followingRequestSend = newFollowingRequestSendList;
      await user.save();

      //göndermi alan kişinin gelen talepler listesinden kullanıcı kaldırılır.
      const newFollowRequestReceivedList = toUser.followRequestReceived.filter(
        (frr) => frr.userId !== authUserId
      );
      toUser.followRequestReceived = newFollowRequestReceivedList;
      await toUser.save();

      //Gönderimi yapan kişiye ait SentFollowRequest şemasından, gönderim yapılan kişi kaldırılır
      await SentFollowRequest.findOneAndDelete({
        user: authUserId,
        'toUser.userId': toFollow,
      });

      await ReceivedFollowRequest.findOneAndDelete({
        user: toFollow,
        'fromUser.userId': authUserId,
      });

      return completedMessage(
        res,
        200,
        'Removed Request: Following Request Removed Successfully',
        messageCodes['Follow Request Cancelled']
      );
    }

    //REQUEST IPTALI SONU

    //Request Iptalinden sonra, tekrar request göndermesi durumunda, karşı tarafa tekrardan request gitmemesi için karşı tarafın Rejected Listesinde olup olmadığı kontrol edilir. Eğer
    //Rejected Listesinde ise, request gönderilmiş gibi yapılır ancak gönderilmez
    const isInRejectedList =
      user.followingRequestRejected.filter(
        (followingReqRejected) => followingReqRejected.userId === toFollow
      ).length > 0;

    if (isInRejectedList && !hasFolowingRequestSend) {
      const newFollowingReqList = [
        ...user.followingRequestSend,
        {
          userId: toFollow,
        },
      ];

      user.followingRequestSend = newFollowingReqList;
      user.save();

      return completedMessage(
        res,
        200,
        'Dummy Request : Dummy Request Added to Senders List',
        messageCodes['Dummy Request Send']
      );
    }

    //Eğer yukarıdakilerin hiçbirine uymuyor ise yani kullanıcı takip etmiyor ise, daha önceden request göndermemiş ise ve reject listesinde değil ise
    //Bu durumda, request gönderilen kullanıcının privateAccount olup olmadığı kontrol edilir, privateAccount ise gönderen kullanıcının SentFollowRequest şemasına alıcı eklenir,
    //request gönderilen kullanıcının ise ReceivedFollowRequest şemasına gönderen eklenir, bunlara ek olarak alıcının followRequestReceived arrayine gönderen, gönderenin followingRequestSend arrayine de alıcı eklenir.
    //privateAccount false ise, gönderenin followings arrayine ve Following şemasına alıcı, alıcının followers arrayine ve Followers şemasına da gönderen eklenir.
    const isPrivateAccount = toUser.privacy.privateAccount;

    if (isPrivateAccount) {
      const sentFollow = new SentFollowRequest({
        user: authUserId,
        toUser: {
          userId: toFollow,
          name: toUser.name,
          surname: toUser.surname,
        },
      });

      await sentFollow.save();

      user.followingRequestSend = [
        ...user.followingRequestSend,
        {
          userId: toFollow,
        },
      ];

      await user.save();

      const receivedFollow = new ReceivedFollowRequest({
        user: toFollow,
        fromUser: {
          userId: authUserId,
          name: user.name,
          surname: user.surname,
          avatar: user.avatar,
          profession: user.profession,
        },
      });

      await receivedFollow.save();

      toUser.followRequestReceived = [
        ...toUser.followRequestReceived,
        {
          userId: authUserId,
        },
      ];

      await toUser.save();

      return completedMessage(
        res,
        200,
        'Follow Request Send Successfully',
        messageCodes['Follow Request Send']
      );
    }

    user.followings = [
      ...user.followings,
      {
        userId: toFollow,
      },
    ];
    await user.save();

    toUser.followers = [
      ...toUser.followers,
      {
        userId: authUserId,
      },
    ];

    await toUser.save();

    const newFollowing = new Following({
      user: authUserId,
      following: {
        userId: toFollow,
        name: toUser.name,
        surname: toUser.surname,
        avatar: toUser.avatar,
        profession: toUser.profession,
      },
    });

    await newFollowing.save();

    const newFollower = new Follower({
      user: toFollow,
      follower: {
        userId: authUserId,
        name: user.name,
        surname: user.surname,
        avatar: user.avatar,
        profession: user.profession,
      },
    });

    await newFollower.save();

    return completedMessage(
      res,
      200,
      'Follow Process Completed Successfully',
      messageCodes.Follow
    );
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return errorMessage(
        res,
        400,
        "Couldn't find the user",
        messageCodes['No User Found']
      );
    }

    console.error(error);
    return errorMessage(res);
  }
};

//api/follow/accept/:idOfRequester
//POST
//This will add the requested user to the follower list of the authenticated user
const acceptFollowRequest = async (req, res) => {
  try {
    const authUserId = req.user.id;
    const requesterId = req.params.idOfRequester;

    const user = await User.findById(authUserId);
    const requester = await User.findById(requesterId);

    if (!requester || !user) {
      return errorMessage(
        res,
        404,
        'No user found',
        messageCodes['No User Found']
      );
    }

    //Add requester to the list of followers of auth User
    user.followers = [
      ...user.followers,
      {
        userId: requesterId,
      },
    ];

    //Remove requester from the list of followRequestReceived List of auth user
    user.followRequestReceived = user.followRequestReceived.filter(
      (frr) => frr.userId !== requesterId
    );

    await user.save();

    //Add auth user to the followings list of requester
    requester.followings = [
      ...requester.followings,
      {
        userId: authUserId,
      },
    ];

    //Remove auth user from the followingRequestSend List of requester
    requester.followingRequestSend = requester.followingRequestSend.filter(
      (frs) => frs.userId !== authUserId
    );

    await requester.save();

    //create document for requester and auth user in followers collection, requester will follow auth user, for this reason user is auth user, follower is requester
    const follower = new Follower({
      user: authUserId,
      follower: {
        userId: requesterId,
        name: requester.name,
        surname: requester.surname,
        avatar: requester.avatar,
        profession: requester.profession,
      },
    });

    await follower.save();

    //Create document for auth user and requester in followings collection, requester will follow auth user, therefore in followings, user is requester and auth user is the followed by requester, that is auth user is the following of requester
    const following = new Following({
      user: requesterId,
      following: {
        userId: authUserId,
        name: user.name,
        surname: user.surname,
        avatar: user.avatar,
        profession: user.profession,
      },
    });

    await following.save();

    //Remove user's and requester's received follow request, user is the user in receivedFollowRequest document and requester is fromUser in receivedFollowRequest document
    await ReceivedFollowRequest.findOneAndDelete({
      user: authUserId,
      'fromUser.userId': requesterId,
    });

    //Remove requester's and user's send follow request, user is the requester who send the follow request and auth user is toUser in sendFollowRequest document
    await SentFollowRequest.findOneAndDelete({
      user: requesterId,
      'toUser.userId': authUserId,
    });

    return completedMessage(
      res,
      200,
      'Follow Request Accepted Successfully',
      messageCodes['Follow Request Accepted']
    );
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

//api/follow/reject/:idOfRequester
//POST
//This will reject the follow request of requester and will add him/her to followingRequestRejected list of himself/herself and followRequestRejected list of auth user
const rejectFollowRequest = async (req, res) => {
  try {
    const authUserId = req.user.id;
    const requesterId = req.params.idOfRequester;

    const authUser = await User.findById(authUserId);
    const requester = await User.findById(requesterId);

    if (!authUser || !requester) {
      return errorMessage(
        res,
        404,
        'No user found',
        messageCodes['No User Found']
      );
    }

    //Add requester to the followRequestRejected list of authUser
    authUser.followRequestRejected = [
      ...authUser.followRequestRejected,
      {
        userId: requesterId,
      },
    ];

    //Remove requester from followRequestReceived list of authUser
    authUser.followRequestReceived = authUser.followRequestReceived.filter(
      (frr) => frr.userId !== requesterId
    );

    await authUser.save();

    //Add authUser to the followingRequestRejected list of requester (requester will not be able to see this list but with the help of this list, s/he won't be able to send follow request to the user again and again)
    requester.followingRequestRejected = [
      ...requester.followingRequestRejected,
      { userId: authUserId },
    ];

    //Remove authUser from followingRequestSend list of requester
    requester.followingRequestSend = requester.followingRequestSend.filter(
      (frs) => frs.userId !== authUserId
    );

    await requester.save();

    //Remove user's and requester's received follow request, user is the user in receivedFollowRequest document and requester is fromUser in receivedFollowRequest document
    await ReceivedFollowRequest.findOneAndDelete({
      user: authUserId,
      'fromUser.userId': requesterId,
    });

    //Remove requester's and user's send follow request, user is the requester who send the follow request and auth user is toUser in sendFollowRequest document
    await SentFollowRequest.findOneAndDelete({
      user: requesterId,
      'toUser.userId': authUserId,
    });

    const rejectedFollower = new RejectedFollower({
      user: authUserId,
      rejectedUser: {
        userId: requesterId,
        name: requester.name,
        surname: requester.surname,
        avatar: requester.avatar,
        profession: requester.profession,
      },
    });

    await rejectedFollower.save();

    return completedMessage(
      res,
      200,
      'Follow Request Rejection Completed Successfully',
      messageCodes['Follow Request Rejected']
    );
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

  //1- add requester to followingRequestRejected List in his/her document, this list will not be visible by user but he/she will be able to see followRequestRejected List in his/her document
  //2- add requester to followRequestRejected List in auth user document, this list will be seen auth user
  //3- remove auth user from followingRequestSent list of requester
  //4- remove requester from followRequestReceived list of auth user.
  //5- delete sendFollowRequest of requester and user
  //6- delete receivedFollowRequest of user and requester
  //7- add requester to RejectedFollower document, user is auth user who rejects the follow request, rejected user is the requester to send the follow requset to auth user
};

//api/follow/deletereject/:idOfRequester
//DELETE
//This will delete the user whose follow request rejected from the rejectedFollowRequests of the auth user
const deleteUserFromRejectList = async (req, res) => {
  //1-Remove requester and auth user document from rejectedFollowRequests collection (user is the auth user and requester is the rejectedUser in the document)
  //2- Remove auth user from the followingRequestRejected list of requester
  //3- Remove requester from the followRequestRejected list of auth user
};

//Blokelemede, hem takip işlemleri kalkacak, yani kullanıcı takip ediyorsa, takibi son bulacak, takip ediliyorsa, takil edenler listesinden blokelediği kişi kaldırılacak.
const blockFollower = async (req, res) => {};

//Blokenin kaldırılması durumunda, blokenin kaldırıldığı kişi kullanıcıya follow isteği gönderebilir veya accout privateAccount değil ise, direkt follow işlemine başlayabilir.
const removeBlock = async (req, res) => {};

const FollowController = Object.freeze({
  getAllFollowings,
  getAllFollowers,
  getAllReceivedFollowRequests,
  getAllSentFollowRequests,
  getAllRejectedFollowRequests,
  removeFollower,
  followUnfollow,
  acceptFollowRequest,
  rejectFollowRequest,
  blockFollower,
  removeBlock,
  deleteUserFromRejectList,
});

export default FollowController;
