import crypto from 'crypto';

const verificationIdGenerator = async (initials = 'verified') => {
  const cryptoGen = await crypto.randomBytes(10).toString('hex');
  const registrationDate = new Date().getTime();

  if (initials) {
    return `${initials}-${cryptoGen}-${registrationDate}`;
  }

  return `${cryptoGen}-${registrationDate}`;
};

export default verificationIdGenerator;
