const { verifyRefreshToken, verifyAccessToken } = require("../utils/jwt");
const logger = require("../config/logger");

const authenticateAccessToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const token = authHeader.split(" ")[1];
  const decoded = verifyAccessToken(token);
  if (!decoded) {
    return res.status(401).json({ error: "Invalid or expired access token" });
  }

  req.user = decoded; // Attach decoded user data to request
  next();
};

const authenticateRefreshToken = (req, res, next) => {
  try {
    // Get refresh token from multiple sources
    const refreshToken =
      req.cookies?.refreshToken ||
      req.body?.refreshToken ||
      req.headers?.authorization?.replace("Bearer ", "");

    logger.info(`Refresh token found: ${refreshToken ? "Yes" : "No"}`);

    if (!refreshToken) {
      logger.warn("No refresh token provided");
      return res.status(401).json({ error: "Refresh token required" });
    }

    // Verify the refresh token
    const decoded = verifyRefreshToken(refreshToken);
    logger.info(`Refresh token decoded for user: ${decoded.user_id}`);

    // Attach user data to request
    req.user = {
      user_id: decoded.user_id,
      email: decoded.email,
      username: decoded.username,
    };

    next();
  } catch (error) {
    logger.error(`Refresh token authentication error: ${error.message}`);
    return res.status(401).json({ error: "Invalid or expired refresh token" });
  }
};

module.exports = {
  authenticateAccessToken,
  authenticateRefreshToken,
};
