export const userNameVerification = (username) => {
  //username must consist of letters and numbers, no other chars accepted;

  const reg = /^[a-z0-9]+$/i;
  const regex = new RegExp(reg);

  return regex.test(username);
};
