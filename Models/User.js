import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  surname: {
    type: String,
    requried: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  gender: {
    type: String,
    required: true,
  },
  isActive: {
    //when user confirms his/her email this will be true, if user deactives his/her accout, this will be false
    type: Boolean,
    default: false,
  },
  verificationId: {
    type: String,
  },
  isVerified: {
    //When user confirms his/her email this will be true
    type: Boolean,
    default: false,
  },
  avatar: {
    type: String,
  },
  userLanguage: {
    type: String,
    default: 'en',
  },
  date: {
    type: Date,
    default: Date.now(),
  },
  privacy: {
    privateAccount: {
      type: Boolean,
      default: false,
    },
    showActivityStatus: {
      type: Boolean,
      default: true,
    },
    postSharing: {
      type: Boolean,
      default: true,
    },
    twoFactorAuth: {
      useTextMessage: {
        type: Boolean,
        default: false,
      },
      useEmailMessage: {
        type: Boolean,
        default: false,
      },
      useAuthenticationApp: {
        type: Boolean,
        default: false,
      },
    },
  },
  followings: [
    {
      userId: {
        type: String,
      },
    },
  ],
  followers: [
    {
      userId: {
        type: String,
      },
    },
  ],
  followingRequestSend: [
    {
      userId: {
        type: String,
      },
    },
  ],
  followRequestReceived: [
    {
      userId: {
        type: String,
      },
    },
  ],
  followingRequestRejected: [
    //Kullanıcının follow request gönderip de reject edildiği durumlarda bu listede isteği kabul etmeyenlerin id'si yer alacak, kabul etmeyen bunu görecek ancak follow request gönderen göremeyecek
    //Kabul etmeyen kabul etmedikleri listesinden istek gönderen kişiyi silmediği sürece, follow request gönderme işlemi followingRequestSend iptal edilse de karşı tarafa bir request göndermeyecektir.
    {
      userId: {
        type: String,
      },
    },
  ],
  followRequestRejected: [
    //Kullanıcının follow request'i alıp da reject ettiği kişileri içerecektir. Bunu kullanıcı görebilecek ve dilediğinde bu listeden kişiyi kaldırıp, tekrar follow request göndermesine izin vermiş olacaktır.
    {
      userId: {
        type: String,
      },
    },
  ],
  blockedUsers: [
    //Kullanıcının bloke ettiği diğer kullanıcıların listesini içerir, kullanıcı bu listeyi görebilir ve isterse blokeyi kaldırabilir, blokeyi kaldırmadığı sürece, blokelediği kişiler bu kullanıcıyı göremez
    {
      userId: {
        type: String,
      },
    },
  ],
  blockedBy: [
    //Kullanıcının başka kullanıcılar tarafından blokelendiği listedir, kullanıcı bu listeyi göremez, blokeleyen kullanıcı blokeyi kaldırmadığı sürece, bu kullanıcı bloke edenleri göremez
    {
      userId: {
        type: String,
      },
    },
  ],
});

const User = mongoose.model('users', UserSchema);

export default User;
