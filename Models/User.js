import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      minLenght: 2,
      maxLenght: 35,
    },
    surname: {
      type: String,
      requried: true,
      minLength: 2,
      maxLenght: 35,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      index: true,
      maxLength: 100,
    },
    password: {
      type: String,
      required: true,
      minLength: 6,
      maxLength: 100,
    },
    gender: {
      type: String,
      required: true,
      maxLength: 25,
    },
    profession: {
      type: String,
      maxLength: 60,
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
      showFollowings: {
        everyone: {
          type: Boolean,
          default: true,
        },

        onlyMe: {
          type: Boolean,
          default: false,
        },

        onlyFollowers: {
          type: Boolean,
          default: false,
        },

        onlyFollowings: {
          type: Boolean,
          default: false,
        },

        onlyFollowersAndFollowings: {
          type: Boolean,
          default: false,
        },
      },
      showFollowers: {
        everyone: {
          type: Boolean,
          default: true,
        },

        onlyMe: {
          type: Boolean,
          default: false,
        },

        onlyFollowers: {
          type: Boolean,
          default: false,
        },

        onlyFollowings: {
          type: Boolean,
          default: false,
        },

        onlyFollowersAndFollowings: {
          type: Boolean,
          default: false,
        },
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
    numOfFollowers: {
      type: Number,
      default: 0,
    },
    numOfFollowings: {
      type: Number,
      default: 0,
    },

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
  },
  { minimize: false }
);

const User = mongoose.model('users', UserSchema);

export default User;
