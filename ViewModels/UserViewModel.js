export const UserViewModel = (
  user,
  options = { name: 1, surname: 1, email: 1, gender: 1, registrationDate: 1 }
) => {
  const userName = options.name === 1 ? user.name : '*****';
  const userSurname = options.surname === 1 ? user.surname : '*****';
  const userEmail = options.email === 1 ? user.email : '*****';
  const userGender = options.gender === 1 ? user.gender : '*****';
  const regDate = options.registrationDate === 1 ? user.date : '';

  return {
    name: userName,
    surname: userSurname,
    email: userEmail,
    gender: userGender,
    date: regDate,
  };
};
