import VerificationToken from '../Models/VerificationToken.js';
import crypto from 'crypto';
import sgMail from '@sendgrid/mail';
import config from 'config';

const emailVerification = async (req, user) => {
  try {
    const tokenGen = crypto.randomBytes(32).toString('hex');
    const emailToken = new VerificationToken({
      user: user.id,
      verificationToken: tokenGen,
    });

    await emailToken.save();
    sgMail.setApiKey(config.get('sendGridAPIKey'));
    const msg = {
      to: user.email,
      from: 'no-reply@dklassix.com',
      subject: 'Verify your email',
      templateId: 'd-1ac7fa4c44bb40e881da43f473ea7b08',
      dynamicTemplateData: {
        verificationLink: `http://${req.headers.host}/verify-email?token=${tokenGen}&id=${user.verificationId}`,
        userName: `${user.name} ${user.surname}`,
      },
    };

    await sgMail.send(msg);
    console.log('Email Send Successfully');
    return {
      data: msg,
      message: 'Email Send Successfully',
      isVerificationSend: true,
    };
  } catch (error) {
    console.log('An Error occured while sending email', error);
    return { data: '', message: error.message, isVerificationSend: false };
  }
};

export default emailVerification;
