/** Encaminha rejeicoes de controllers assincronos para o errorHandler central. */
const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

module.exports = asyncHandler;
