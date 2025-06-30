const express = require("express");
const { authenticateAccessToken } = require("../middleware/auth");
const forwardRequest = require("../utils/forwardRequest");
const logger = require("../config/logger");

const router = express.Router();

// Record a view for a post (protected)
router.post(
  "/",
  authenticateAccessToken,
  async (req, res) => {
    logger.info("Handling POST /views request", { user_id: req.user?.user_id });
    req.headers["x-user-id"] = req.user?.user_id || "";
    await forwardRequest(req, res, "post-service", "views");
  }
);

// Get views by post ID (protected)
router.get(
  "/post/:post_id",
  authenticateAccessToken,
  async (req, res) => {
    logger.info(`Handling GET /views/post/${req.params.post_id} request`, { user_id: req.user?.user_id });
    req.headers["x-user-id"] = req.user?.user_id || "";
    await forwardRequest(req, res, "post-service", `views/post/${req.params.post_id}`);
  }
);

// Get view count for a post (protected)
router.get(
  "/post/:post_id/count",
  authenticateAccessToken,
  async (req, res) => {
    logger.info(`Handling GET /views/post/${req.params.post_id}/count request`, { user_id: req.user?.user_id });
    req.headers["x-user-id"] = req.user?.user_id || "";
    await forwardRequest(req, res, "post-service", `views/post/${req.params.post_id}/count`);
  }
);

// Check if current user has viewed a post (protected)
router.get(
  "/post/:post_id/viewed",
  authenticateAccessToken,
  async (req, res) => {
    logger.info(`Handling GET /views/post/${req.params.post_id}/viewed request`, { user_id: req.user?.user_id });
    req.headers["x-user-id"] = req.user?.user_id || "";
    await forwardRequest(req, res, "post-service", `views/post/${req.params.post_id}/viewed`);
  }
);

module.exports = router;
