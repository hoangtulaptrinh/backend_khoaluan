import jwt from "jsonwebtoken";

const SECRET_KEY = "hoangtulaptrinh";

export default (req, res, next) => {
  const authHeader = req.headers.authorization;
  const error = new Error();
  error.status = 403;
  if (authHeader) {
    const token = authHeader.split("Bearer ")[1];
    if (token) {
      try {
        const user = jwt.verify(token, SECRET_KEY);
        req.user = user; //gắn user vào req gửi cho next()
        return next();
      } catch (e) {
        error.message = "token hết hạn hoặc không hợp lệ";
        return next(error);
      }
    }
    error.message = "authorization phải có dạng Bearer [token]";
    return next(error);
  }
  error.message = "phải gửi kèm authorization header";
  return next(error);
};
