const jwt = require('jsonwebtoken');
const ApiError = require('../utils/ApiError');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new ApiError(401, 'Not authorized to access this route'));
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallbacksecretkey123');

    req.user = await User.findById(decoded.id);
    if (!req.user) {
      return next(new ApiError(401, 'User not found'));
    }

    next();
  } catch (err) {
    return next(new ApiError(401, 'Not authorized to access this route'));
  }
};

module.exports = protect;
