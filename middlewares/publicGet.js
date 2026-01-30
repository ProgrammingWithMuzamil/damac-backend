// Middleware to make GET requests public (except user management)
const publicGetMiddleware = (req, res, next) => {
  // Allow all GET requests except for user management
  if (req.method === 'GET' && !req.path.includes('/users')) {
    return next();
  }
  
  // For all other requests (POST, PUT, DELETE) and user management, continue with auth
  next();
};

export default publicGetMiddleware;
