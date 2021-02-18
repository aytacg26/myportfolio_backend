export const nameCapitalizer = (name) => {
  const initialLetter = name.charAt(0).toUpperCase();
  const remaining = name.slice(1, name.length);

  return `${initialLetter}${remaining}`;
};
