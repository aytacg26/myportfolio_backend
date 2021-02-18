export const errorMessage = (
  res,
  status = 500,
  message = 'Internal Server Error'
) => {
  if (Array.isArray(message)) {
    return res.status(status).json({ errors: errors.array() });
  }

  return res
    .status(status)
    .json({ errors: [{ msg: message, isSuccess: false }] });
};

export const completedMessage = (
  res,
  status = 200,
  message = 'Processes Completed Successfully'
) => {
  return res
    .status(status)
    .json({ 'Success Messages': [{ msg: message, isSuccess: true }] });
};
