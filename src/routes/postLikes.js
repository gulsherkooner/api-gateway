const express = require("express");
const { authenticateAccessToken } = require("../middleware/auth");
const forwardRequest = require("../utils/forwardRequest");
const logger = require("../config/logger");

const router = express.Router();

// Like a post
router.post("/:post_id/like", authenticateAccessToken, async (req, res) => {
  req.headers["x-user-id"] = req.user?.user_id || "";
  logger.info(`Handling POST /postLikes/${req.params.post_id}/like request`, { user_id: req.user?.user_id });
  await forwardRequest(req, res, "post-service", `postLikes/${req.params.post_id}/like`);
});

// Unlike a post
router.delete("/:post_id/like", authenticateAccessToken, async (req, res) => {
  req.headers["x-user-id"] = req.user?.user_id || "";
  logger.info(`Handling DELETE /postLikes/${req.params.post_id}/like request`, { user_id: req.user?.user_id });
  await forwardRequest(req, res, "post-service", `postLikes/${req.params.post_id}/like`);
});

// Get all likes for a user (must match x-user-id)
router.get("/user/:user_id", authenticateAccessToken, async (req, res) => {
  req.headers["x-user-id"] = req.user?.user_id || "";
  logger.info(`Handling GET /postLikes/user/${req.params.user_id} request`, { user_id: req.user?.user_id });
  await forwardRequest(req, res, "post-service", `postLikes/user/${req.params.user_id}`);
});

// Get like for a specific post and user (user from x-user-id)
router.get("/:post_id/like", authenticateAccessToken, async (req, res) => {
  req.headers["x-user-id"] = req.user?.user_id || "";
  logger.info(
    `Handling GET /postLikes/${req.params.post_id}/like request`,
    { user_id: req.user?.user_id }
  );
  await forwardRequest(req, res, "post-service", `postLikes/${req.params.post_id}/like`);
});

module.exports = router;