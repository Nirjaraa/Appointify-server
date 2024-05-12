const errorHandler = (err) => {
  const errorMessage = err.message ? err.message : "Internal Server Error";

  return errorMessage;
};

module.exports = { errorHandler };
