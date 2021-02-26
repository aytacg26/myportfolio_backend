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
    //Find Followers from the userId, we used projection to prevent fetching user data and user _id
    const userFollowers = await Follower.find(
      { user: req.user.id },
      { follower: 1, _id: 0 }
    ).populate('follower.userId', {
      name: 1,
      surname: 1,
      avatar: 1,
      profession: 1,
    });

    const followersView = FollowListViewModel(userFollowers, 'follower');

    res.json(followersView);
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

//This will not required because of revisions on User Model
const getNumberOfFollowers = async (req, res) => {
  try {
    const userId = req.user.id;

    const numOfFollowers = await Follower.countDocuments({ user: userId });

    res.json({ 'Number Of Followers': numOfFollowers });
  } catch (error) {
    return errorMessage(res);
  }
};

//api/follow/followings
//GET
//This will get all followings of the authenticated user
const getAllFollowings = async (req, res) => {
  try {
    //We used projection to prevent fetching user _id and other data, and we are only fetching following data
    const userFollowings = await Following.find(
      { user: req.user.id },
      { following: 1, _id: 0 }
    ).populate('following.userId', {
      name: 1,
      surname: 1,
      avatar: 1,
      profession: 1,
    });

    const followingsView = FollowListViewModel(userFollowings, 'following');

    res.json(followingsView);
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
  //NOTE : USE PROJECTION TO PREVENT FETCHING UNNECESSARY DATA, in getAllFollowings and getAllFollowers we used projection!!
  try {
    const userFollowRequests = await ReceivedFollowRequest.find({
      user: req.user.id,
    }).populate('fromUser.userId', {
      name: 1,
      surname: 1,
      avatar: 1,
      profession: 1,
    });

    const followReqestsList = FollowListViewModel(
      userFollowRequests,
      'fromUser'
    );

    res.json(followReqestsList);
    // res.json(userFollowRequests);
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
    }).populate('toUser.userId', {
      name: 1,
      surname: 1,
      avatar: 1,
      profession: 1,
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
    const listOfRejected = await RejectedFollower.find({
      user: authUserId,
    }).populate('rejectedUser.userId', {
      name: 1,
      surname: 1,
      avatar: 1,
      profession: 1,
    });

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

    //Remove follower from the numOfFollowers of user
    const newFollowerSize = authUser.numOfFollowers - 1;
    authUser.numOfFollowers = newFollowerSize;

    authUser.save();

    //Remove from the numOfFollowings of the removed user
    const newFollowingSize = follower.numOfFollowings - 1;
    follower.numOfFollowings = newFollowingSize;

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

    if (authUserId === toFollow) {
      return errorMessage(
        res,
        400,
        'User cannot follow own account',
        messageCodes['Follow Id Conflict']
      );
    }

    // const isFollowing =
    //   user.followings.filter((following) => following.id === toFollow).length >
    //   0;
    //Follow tuşuna tıkladığımız kişiyi takip ediyor muyuz? Evet ise, takibi kaldıracağımız anlamına gelir.
    const isFollowing = await Following.findOne({
      user: authUserId,
      'following.userId': toFollow,
    });

    //Eğer takip ettiği bir kişi ise unfollow işlemi uygulanır
    if (isFollowing) {
      //Burada unfollow işlemi gerçekleşti, authUser artık toFollow user'in follower listesinde değildir ve authUser'in follower listesinde toFollow user bulunarak eğer mevcut ise amIFollowing:false yapılır

      await Following.findOneAndDelete({
        user: authUserId,
        'following.userId': toFollow,
      });

      const isInUserFollowers = await Follower.findOne({
        user: authUserId,
        'follower.userId': toFollow,
      });

      if (isInUserFollowers) {
        isInUserFollowers.follower.amIFollowing = false;

        isInUserFollowers.save();
      }

      await Follower.findOneAndDelete({
        user: toFollow,
        'follower.userId': authUserId,
      });

      //kullanıcı hali hazırda takip ediyor ise unfollow işlemini gerçekleştirmek istiyor demektir yani kullanıcı takipten vazgeçmek istiyor demektir. Bu durumda
      //aynı zamanda followRequest gönderimi yapılan kişiye aslında unfollow işlemi uygulandığından, takipçi listesinden user çıkartılacaktır.

      const userNewFollowingSize = user.numOfFollowings - 1;
      user.numOfFollowings = userNewFollowingSize;

      const unfollowedUserFollowerSize = toUser.numOfFollowers - 1;
      toUser.numOfFollowers = unfollowedUserFollowerSize;

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
    const hasFollowingRequestSend =
      user.followingRequestSend.filter((frs) => frs.userId === toFollow)
        .length > 0;

    if (hasFollowingRequestSend) {
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

    if (isInRejectedList && !hasFollowingRequestSend) {
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

    //AuthUser, toUser'in follower'i olur, bu durumda, authUser'in follower'leri arasında toUser var ise bulunur ve amIFollowing true yapılır.
    const newFollowingSize = user.numOfFollowings + 1;
    user.numOfFollowings = newFollowingSize;

    const newFollowerSize = toUser.numOfFollowers + 1;
    toUser.numOfFollowers = newFollowerSize;

    await user.save();
    await toUser.save();

    //1- authUser toUser'i takip etmeye başlayacak, yani authUser, toUser'in follower listesine eklenecek. Bu noktada, ilk kontrol etmemiz gereken, toUser, authUser'i takip ediyor mu?
    //toUser authUser'i takip ediyor ise, authUser'in follower listesinde yer almaktadır, authUser'in follower listesinde yer alıyor ise, burada toUser follower listesine eklenecek olan authUser için
    //amIFollowing (Yani toUser kendi kendine soruyor bu soruyu), sorunun cevabı true olacak

    let toUserFollowsAuthUser = false;
    const isAuthFollowedByToUser = await Follower.findOne({
      user: authUserId,
      'follower.userId': toFollow,
    });

    if (isAuthFollowedByToUser) {
      toUserFollowsAuthUser = true;
    }

    //Bu noktada karşılaşacağımız problem, eğer authUser takip etmeye başladığında, toUser takip etmiyor ise toUserFollowsAuthUser false kalacak, ve sonradan toUser, authUser'i
    //takip etmeye başlar ise toUser authUser konumuna geçecek ve toUser için amIFollowing false kalırken, şimdiki authUser ve sonraki toUser konumunda olan kişi için amIFollowing true olacaktır.
    //Bu noktada, şu soruyu da sormamız gerekecek, toUser'in following listesinde authUser var mı? eğer var ise
    const isInFollowingList = await Following.findOne({
      user: toFollow,
      'following.userId': authUserId,
    });

    if (isInFollowingList) {
      const follower = await Follower.findOne({
        user: authUserId,
        'follower.userId': toFollow,
      });
      follower.follower.amIFollowing = true;

      await follower.save();
    }

    //AuthUser'in following yani takip ettiği listeye toUser eklenecek
    const newFollowing = new Following({
      user: authUserId,
      following: {
        userId: toFollow,
      },
    });

    await newFollowing.save();

    //toUser'in follower listesine authUser eklenecek.
    const newFollower = new Follower({
      user: toFollow,
      follower: {
        userId: authUserId,

        amIFollowing: toUserFollowsAuthUser,
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
    const userNewFollowerSize = user.numOfFollowers + 1;
    const requesterFollowingSize = requester.numOfFollowings + 1;
    user.numOfFollowers = userNewFollowerSize;
    requester.numOfFollowings = requesterFollowingSize;

    //Remove requester from the list of followRequestReceived List of auth user
    user.followRequestReceived = user.followRequestReceived.filter(
      (frr) => frr.userId !== requesterId
    );

    await user.save();

    //Remove auth user from the followingRequestSend List of requester
    requester.followingRequestSend = requester.followingRequestSend.filter(
      (frs) => frs.userId !== authUserId
    );

    await requester.save();

    //Requester'i authUser olarak takipçi olarak kabul ettiğimizde, authUser olarak, requester'in follower'leri arasındamıyız diye kontrol etmemiz lazım.
    //eğer authUser Requester'in takipçileri arasında ise, authUser altında yer alan amIFollowing (yani requester follow ediyor mu) true olacaktır.
    let follows = false;

    const isInRequesterFollowers = await Follower.findOne({
      user: requesterId,
      'follower.userId': authUserId,
    });

    if (isInRequesterFollowers) {
      follows = true;
    }

    const isInFollowingList = await Following.findOne({
      user: authUserId,
      'following.userId': requesterId,
    });

    if (isInFollowingList) {
      const follower = await Follower.findOne({
        user: requesterId,
        'follower.userId': authUserId,
      });
      follower.follower.amIFollowing = true;

      await follower.save();
    }

    //create document for requester and auth user in followers collection, requester will follow auth user, for this reason user is auth user, follower is requester
    const follower = new Follower({
      user: authUserId,
      follower: {
        userId: requesterId,

        amIFollowing: follows,
      },
    });

    await follower.save();

    //Create document for auth user and requester in followings collection, requester will follow auth user, therefore in followings, user is requester and auth user is the followed by requester, that is auth user is the following of requester
    const following = new Following({
      user: requesterId,
      following: {
        userId: authUserId,
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
};

//api/follow/deletereject/:idOfRequester
//DELETE
//This will delete the user whose follow request rejected from the rejectedFollowRequests of the auth user
const deleteUserFromRejectList = async (req, res) => {
  try {
    //1-Remove requester and auth user document from rejectedFollowRequests collection (user is the auth user and requester is the rejectedUser in the document)
    const authUserId = req.user.id;
    const requesterId = req.params.idOfRequester;

    await RejectedFollower.findOneAndDelete({
      user: authUserId,
      'rejectedUser.userId': requesterId,
    });
    //2- Remove auth user from the followingRequestRejected list of requester

    //3- Remove requester from the followRequestRejected list of auth user
    const requester = await User.findById(requesterId);
    const authUser = await User.findById(authUserId);

    if (!requester || !authUser) {
      return errorMessage(
        res,
        404,
        'No user found',
        messageCodes['No User Found']
      );
    }

    const newFollowingReqRejectedList = requester.followingRequestRejected.filter(
      (rej) => rej.userId !== authUserId
    );
    requester.followingRequestRejected = newFollowingReqRejectedList;

    const newFollowReqRejectedList = authUser.followRequestRejected.filter(
      (folReqRej) => folReqRej.userId !== requesterId
    );
    authUser.followRequestRejected = newFollowReqRejectedList;

    await requester.save();
    await authUser.save();

    return completedMessage(
      res,
      200,
      'User removed from reject list successfully',
      messageCodes['User removed from Reject List']
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

/**
 * @route           POST api/follow/blockuser/:idOfBlockedUser
 * @description     Block a follower or a user
 * @access          Private
 */
//Blokelemede, hem takip işlemleri kalkacak, yani kullanıcı takip ediyorsa, takibi son bulacak, takip ediliyorsa, takil edenler listesinden blokelediği kişi kaldırılacak.
const blockFollower = async (req, res) => {
  try {
    const userId = req.user.id;
    const blockedUserId = req.params.idOfBlockedUser;
    //1- Find user and blocked User, if they exists, move forward, else return error
    const user = await User.findById(userId);
    const blockedUser = await User.findById(blockedUserId);

    if (!user || !blockedUser) {
      return errorMessage(
        res,
        404,
        'No user found',
        messageCodes['No User Found']
      );
    }

    //2- Check if blocked user is a follower of user, if s/he is a follower, remove from followers of the user and followings of the blocked user
    //3- check if blocked user is a following of user (that is if blocked user is followed by user), if yes, remove from followings of the user and followers of the blocked user
    const followerOfUser = await Follower.findOne({
      user: userId,
      'follower.userId': blockedUserId,
    });
    const followingOfUser = await Following.findOne({
      user: userId,
      'following.userId': blockedUserId,
    });

    if (followerOfUser) {
      await Follower.findOneAndDelete({
        user: userId,
        'follower.userId': blockedUserId,
      });

      await Following.findOneAndDelete({
        user: blockedUserId,
        'following.userId': userId,
      });
    }

    if (followingOfUser) {
      await Following.findOneAndDelete({
        user: userId,
        'following.userId': blockedUserId,
      });

      await Follower.findOneAndDelete({
        user: blockedUserId,
        'follower.userId': userId,
      });
    }

    //4- Add blocked user to the blockedUsers array of user
    const newBlockedUserArray = [
      ...user.blockedUsers,
      {
        userId: blockedUserId,
      },
    ];

    user.blockedUsers = newBlockedUserArray;
    await user.save();
    //5- Add user to the blockedBy array of blockedUser
    const newBlockedByArray = [
      ...blockedUser.blockedBy,
      {
        userId: blockedUserId,
      },
    ];

    blockedUser.blockedBy = newBlockedByArray;
    await blockedUser.save();

    //6- check if blocked user has any following request to user and remove user from following requests of blocked user
    const followingRequestFromBlockedUser = await Following.findOne({
      user: blockedUserId,
      'following.userId': userId,
    });
    //7- check if blocked user has any follow request received from user and remove user from follow request received list
    //8- check if user has any following request to blocked user and remove blockedUser from following requests of user
    //9- check if user has any follow request received from blockUser and remove blocked user from follow request received list
    //10- check if there is any ReceivedFollowRequest of blocked user from user and delete it
    //11- check if there is any SentFollowRequest of blockedUser to user and delete it
    //12- check if there is any SentFollowRequest of user to blocked user and delete it
    //13- check if there is any ReceivedFollowRequest of user from blocked user and delete it
    //14- add BlockedUser to the Blocked User collection of user.
    //MODEL :
    /**
   *   user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',
  },
  blockedUser: {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'users',
      required: true,
    },
  },

  blockedDate: {
    type: Date,
    default: Date.now(),
  },
   */
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
  getNumberOfFollowers,
});

export default FollowController;
