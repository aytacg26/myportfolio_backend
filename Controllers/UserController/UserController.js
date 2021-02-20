import User from '../../Models/User.js';
import { nameCapitalizer } from '../../Utils/nameCapitalizer.js';
import verificationIdGenerator from '../../Utils/verificationIdGen.js';
import { errorMessage, completedMessage } from '../../messages/messages.js';
import { UserViewModel } from '../../ViewModels/UserViewModel.js';
import VerificationToken from '../../Models/VerificationToken.js';
import emailVerification from '../../Utils/emailVerification.js';
import gravatar from 'gravatar';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import config from 'config';

//GET api/users
const GetAllUsers = async (res) => {
  try {
    const allUsers = await User.find().sort({ date: -1 });

    if (!allUsers) {
      return errorMessage(res, 404, 'No users found');
    }

    const verifiedAndActiveUsers = allUsers.filter(
      (user) => user.isVerified && user.isActive
    );
    const allUsersView = verifiedAndActiveUsers.map((user) =>
      UserViewModel(user)
    );

    res.json(allUsersView);
  } catch (error) {
    errorMessage(res);
  }
};

//POST api/users/
const UserRegistration = async (req, res) => {
  //Get Data from body
  const { name, surname, email, gender, password } = req.body;

  try {
    let user = await User.findOne({ email });

    if (user) {
      return errorMessage(res, 400, 'User exists in database');
    }

    const avatar = gravatar.url(email, { s: '200', r: 'pg', d: 'mm' });
    const nameToUse = nameCapitalizer(name);
    const surnameToUse = nameCapitalizer(surname);

    user = new User({
      name: nameToUse,
      surname: surnameToUse,
      email,
      gender,
      avatar,
      password,
      verificationId: await verificationIdGenerator(),
    });

    //Encryption of password :
    //first create a salt :
    const salt = await bcrypt.genSalt(12);
    user.password = await bcrypt.hash(password, salt);

    const verificationResult = await emailVerification(req, user);

    if (!verificationResult.isVerificationSend) {
      return errorMessage(
        res,
        424,
        "Sending email for email verification process failed, couldn't complete the registration"
      );
    }

    await user.save();

    completedMessage(res, 200, 'Registration Completed Successfully.');
    //Generate JWT
    // const payload = {
    //   user: {
    //     id: user.id,
    //   },
    // };

    // const userView = UserViewModel(user);

    /*
      @TODO : KULLANICIYA TOKEN Email verification işleminden sonra verilecek, burada bu işlemi yapmamıza gerek yok!!
    */
    //In production expiresIn 7200 yani 2 saat olacak (Burada kullanıcıya Token göndermenin bir anlamı yok)
    // jwt.sign(
    //   payload,
    //   config.get('jwtSecret'),
    //   { expiresIn: 3600000 },
    //   (error, token) => {
    //     if (error) throw error;

    //     res.json({ userView, token });
    //   }
    // );
  } catch (error) {
    console.error('Server Error : ', error.message);
    errorMessage(res);
  }
};

//POST api/users/verifyemail/:id/:verificationToken
const verifyEmail = async (req, res) => {
  try {
    //STEPS :
    //1- Get verification token by user id,
    const user = await User.findOne({ verificationId: req.params.id });
    //const token = await VerificationToken.findOne({ user: req.params.id });
    //const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return errorMessage(res, 403, 'The process is Forbidden.');
    }

    const token = await VerificationToken.findOne({ user: user.id });

    if (!token) {
      return errorMessage(res, 404, 'The token expired');
    }

    const isValidToken =
      token.verificationToken === req.params.verificationToken;
    const isExpired = token.expires - new Date().getTime() <= 0;

    if (!isValidToken) {
      return errorMessage(res, 401, 'Unauthorized');
    }

    if (isExpired) {
      await token.remove();
      return errorMessage(res, 404, 'The token expired');
    }

    user.isActive = true;
    user.isVerified = true;
    user.verificationId = await verificationIdGenerator('verified');
    await user.save();
    await token.remove();

    const userView = UserViewModel(user);

    res.json({ ...userView, isVerified: true });
  } catch (error) {
    console.error(error.message);
    errorMessage(res);
  }
};

//PUT api/users/privacy/:id
const privacySettings = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    const {
      privateAccount,
      showActivityStatus,
      postSharing,
      useTextMessage,
      useEmailMessage,
      useAuthenticationApp,
    } = req.body;

    console.log(req.body);

    if (!user) {
      return errorMessage(res, 400, 'Please login');
    }

    user.privacy.privateAccount = privateAccount;
    user.privacy.showActivityStatus = showActivityStatus;
    user.privacy.postSharing = postSharing;

    if (useTextMessage == true) {
      user.privacy.twoFactorAuth.useTextMessage = useTextMessage;
      user.privacy.twoFactorAuth.useEmailMessage = false;
      user.privacy.twoFactorAuth.useAuthenticationApp = false;
    } else if (useEmailMessage == true) {
      user.privacy.twoFactorAuth.useTextMessage = false;
      user.privacy.twoFactorAuth.useEmailMessage = useEmailMessage;
      user.privacy.twoFactorAuth.useAuthenticationApp = false;
    } else if (useAuthenticationApp == true) {
      user.privacy.twoFactorAuth.useTextMessage = false;
      user.privacy.twoFactorAuth.useEmailMessage = false;
      user.privacy.twoFactorAuth.useAuthenticationApp = useAuthenticationApp;
    } else {
      user.privacy.twoFactorAuth.useTextMessage = useTextMessage;
      user.privacy.twoFactorAuth.useEmailMessage = useEmailMessage;
      user.privacy.twoFactorAuth.useAuthenticationApp = useAuthenticationApp;
    }

    await user.save();
    const userView = UserViewModel(user);

    res.json(userView);
  } catch (error) {
    console.error(error.message);
    errorMessage(res);
  }
};

const UserController = Object.freeze({
  UserRegistration,
  GetAllUsers,
  verifyEmail,
  privacySettings,
});

export default UserController;
