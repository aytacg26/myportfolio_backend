import User from '../../Models/User.js';
import Following from '../../Models/Following.js';
import Follower from '../../Models/Follower.js';
import ReceivedFollowRequest from '../../Models/ReceivedFollowRequest.js';
import SentFollowRequest from '../../Models/SentFollowRequest.js';
import { completedMessage, errorMessage } from '../../messages/messages.js';

const getAllFollowers = async (req, res) => {};

const getAllFollowings = async (req, res) => {};

const getAllReceivedFollowRequests = async (req, res) => {};

const getAllSendFollowRequests = async (req, res) => {};

const removeFollower = async (req, res) => {};

//Send and Remove Follow Request and Follow bu fonksiyonunan gerçekleşmektedir.
const followUnfollow = async (req, res) => {
  try {
    //1- Gönderen Kullanıcı Bulunur, kullanıcının göndermiş olduğu request, eğer karşı tarafın accountu privateAccount ise, sentFollowRequest şemasına işlenir ve aynı zamanda following request send arrayine de işlenir.
    //2- Request'i alan kullanıcı bulunur, Request'i alan kullanıcının privacy.privateAccount true ise, Request, alan kullanıcının ReceivedFollowRequest şemasına ve followRequestReceived arrayine işlenir
    //Eğer account privateAccout değil ise yani privateAccount false ise, bu durumda, gönderenin Following Schema'sına, alıcının da Followers şemasına işlem gerçekleşitirlir aynı zamanda gönderenin following arrayi ve
    //alıcının follower arraylerine de işlem gerçekleştirilir.
    const user = await User.findById(req.params.id);
    const toUser = await User.findById(req.params.idToFollow);

    if (!user || !toUser) {
      return errorMessage(res, 400, "Couldn't find the user");
    }

    const isFollowing =
      user.followings.map((following) => following.id === req.params.idToFollow)
        .length > 0;

    //Eğer takip ettiği bir kişi ise unfollow işlemi uygulanır
    if (isFollowing) {
      await Following.findOneAndDelete({
        user: req.params.id,
        'following.userId': req.params.idToFollow,
      });

      await Follower.findOneAndDelete({
        user: req.params.idToFollow,
        'follower.userId': req.params.id,
      });

      //kullanıcı hali hazırda takip ediyor ise unfollow işlemini gerçekleştirmek istiyor demektir yani kullanıcı takipten vazgeçmek istiyor demektir. Bu durumda
      //aynı zamanda followRequest gönderimi yapılan kişiye aslında unfollow işlemi uygulandığından, takipçi listesinden user çıkartılacaktır.
      const userNewFollowingList = user.followings.filter(
        (following) => following.userId !== req.params.idToFollow
      );
      const toUserNewFollowerList = toUser.followers.filter(
        (follower) => follower.userId !== req.params.id
      );

      user.followings = userNewFollowingList;
      toUser.followers = toUserNewFollowerList;

      await user.save();
      await toUser.save();

      return completedMessage(res, 200, 'Unfollow: Unfollow process completed');
    }
    //TAKIP ETME IPTALI SONU

    //Eğer follow request gönderdiği bir kişi ise, follow request iptal edilir. Tabi böyle bir şeyin söz konusu olması için follow request gönderilen kişinin accountu private olmalıdır
    //ancak burada şöle bir durum söz konusu olabilir, kullanıcı account'unu daha sonradan private yapmış olabilir. zaten böyle bir durumda isFollowing true olacaktır ve aynı zamanda hasFollowingRequestSend'de false olacaktır
    const hasFolowingRequestSend =
      user.followingRequestSend.filter(
        (frs) => frs.userId === req.params.idToFollow
      ).length > 0;

    if (hasFolowingRequestSend) {
      //Eğer following request göndermiş olduğu biri ise, kullanıcının followingRequestSend listesi revize edilir, request gönderilen kişinin followRequestListesi revize edilir.
      const newFollowingRequestSendList = user.followingRequestSend.filter(
        (frs) => frs.userId !== req.params.idToFollow
      );
      user.followingRequestSend = newFollowingRequestSendList;
      await user.save();

      //göndermi alan kişinin gelen talepler listesinden kullanıcı kaldırılır.
      const newFollowRequestReceivedList = toUser.followRequestReceived.filter(
        (frr) => frr.userId !== req.params.id
      );
      toUser.followRequestReceived = newFollowRequestReceivedList;
      await toUser.save();

      //Gönderimi yapan kişiye ait SentFollowRequest şemasından, gönderim yapılan kişi kaldırılır
      await SentFollowRequest.findOneAndDelete({
        user: req.params.id,
        'toUser.userId': req.params.idToFollow,
      });

      await ReceivedFollowRequest.findOneAndDelete({
        user: req.params.idToFollow,
        'fromUser.userId': req.params.id,
      });

      return completedMessage(
        res,
        200,
        'Removed Request: Following Request Removed Successfully'
      );
    }

    //REQUEST IPTALI SONU

    //Request Iptalinden sonra, tekrar request göndermesi durumunda, karşı tarafa tekrardan request gitmemesi için karşı tarafın Rejected Listesinde olup olmadığı kontrol edilir. Eğer
    //Rejected Listesinde ise, request gönderilmiş gibi yapılır ancak gönderilmez
    const isInRejectedList =
      user.followingRequestRejected.filter(
        (followingReqRejected) =>
          followingReqRejected.userId === req.params.idToFollow
      ).length > 0;

    if (isInRejectedList && !hasFolowingRequestSend) {
      const newFollowingReqList = [
        ...user.followingRequestSend,
        {
          userId: req.params.idToFollow,
        },
      ];

      user.followingRequestSend = newFollowingReqList;
      user.save();

      return completedMessage(
        res,
        200,
        'Dummy Request : Dummy Request Added to Senders List'
      );
    }

    //Eğer yukarıdakilerin hiçbirine uymuyor ise yani kullanıcı takip etmiyor ise, daha önceden request göndermemiş ise ve reject listesinde değil ise
    //Bu durumda, request gönderilen kullanıcının privateAccount olup olmadığı kontrol edilir, privateAccount ise gönderen kullanıcının SentFollowRequest şemasına alıcı eklenir,
    //request gönderilen kullanıcının ise ReceivedFollowRequest şemasına gönderen eklenir, bunlara ek olarak alıcının followRequestReceived arrayine gönderen, gönderenin followingRequestSend arrayine de alıcı eklenir.
    //privateAccount false ise, gönderenin followings arrayine ve Following şemasına alıcı, alıcının followers arrayine ve Followers şemasına da gönderen eklenir.
    const isPrivateAccount = toUser.privacy.privateAccount;

    if (isPrivateAccount) {
      const sentFollow = new SentFollowRequest({
        user: req.params.id,
        toUser: {
          userId: req.params.idToFollow,
        },
      });

      await sentFollow.save();

      user.followingRequestSend = [
        ...user.followingRequestSend,
        {
          userId: req.params.idToFollow,
        },
      ];

      await user.save();

      const receivedFollow = new ReceivedFollowRequest({
        user: req.params.idToFollow,
        fromUser: {
          userId: req.params.id,
          name: user.name,
          surname: user.surname,
          avatar: user.avatar,
        },
      });

      await receivedFollow.save();

      toUser.followRequestReceived = [
        ...toUser.followRequestReceived,
        {
          userId: req.params.id,
        },
      ];

      await toUser.save();

      return completedMessage(res, 200, 'Follow Request Send Successfully');
    }

    user.followings = [
      ...user.followings,
      {
        userId: req.params.idToFollow,
      },
    ];
    await user.save();

    toUser.followers = [
      ...toUser.followers,
      {
        userId: req.params.id,
      },
    ];

    await toUser.save();

    const newFollowing = new Following({
      user: req.params.id,
      following: {
        userId: req.params.idToFollow,
        name: toUser.name,
        surname: toUser.surname,
        avatar: toUser.avatar,
      },
    });

    await newFollowing.save();

    const newFollower = new Follower({
      user: req.params.idToFollow,
      follower: {
        userId: req.params.id,
        name: user.name,
        surname: user.surname,
        avatar: user.avatar,
      },
    });

    await newFollower.save();

    return completedMessage(res, 200, 'Follow Process Completed Successfully');
  } catch (error) {
    console.error(error);
    errorMessage(res);
  }
};

const acceptFollowRequest = async (req, res) => {};

const rejectFollowRequest = async (req, res) => {};

//Blokelemede, hem takip işlemleri kalkacak, yani kullanıcı takip ediyorsa, takibi son bulacak, takip ediliyorsa, takil edenler listesinden blokelediği kişi kaldırılacak.
const blockFollower = async (req, res) => {};

//Blokenin kaldırılması durumunda, blokenin kaldırıldığı kişi kullanıcıya follow isteği gönderebilir veya accout privateAccount değil ise, direkt follow işlemine başlayabilir.
const removeBlock = async (req, res) => {};

const deleteFromRejectFollowList = async (req, res) => {};

const FollowController = Object.freeze({
  getAllFollowings,
  getAllFollowers,
  getAllReceivedFollowRequests,
  getAllSendFollowRequests,
  removeFollower,
  followUnfollow,
  acceptFollowRequest,
  rejectFollowRequest,
  blockFollower,
  removeBlock,
  deleteFromRejectFollowList,
});

export default FollowController;
