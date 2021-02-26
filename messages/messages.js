export const errorMessage = (
  res,
  status = 500,
  message = 'Internal Server Error',
  processCode = 'Server'
) => {
  if (Array.isArray(message)) {
    return res.status(status).json({ errors: errors.array() });
  }

  return res
    .status(status)
    .json({ errors: [{ msg: message, isSuccess: false, processCode }] });
};

export const completedMessage = (
  res,
  status = 200,
  message = 'Processes Completed Successfully',
  processCode = 'S'
) => {
  return res.status(status).json({
    'Success Messages': [{ msg: message, isSuccess: true, processCode }],
  });
};

//Process Codes are listed in processCodes.js
