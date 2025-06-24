const express = require("express");
const { authenticateAccessToken } = require("../middleware/auth");
const forwardRequest = require("../utils/forwardRequest");
const logger = require("../config/logger");
const { verifyAccessToken } = require("../utils/jwt");

const router = express.Router();

// Create a new story (protected)
router.post(
  "/",
  authenticateAccessToken,
  express.json({ limit: "100mb" }),
  async (req, res) => {
    logger.info("Handling POST /stories request", { user_id: req.user?.user_id });
    req.headers["x-user-id"] = req.user?.user_id || "";
    await forwardRequest(req, res, "post-service", "stories");
  }
);

// Update a story (protected)
router.put(
  "/:story_id",
  authenticateAccessToken,
  express.json({ limit: "150mb" }),
  async (req, res) => {
    logger.info(`Handling PUT /stories/${req.params.story_id} request`, { user_id: req.user?.user_id });
    req.headers["x-user-id"] = req.user?.user_id || "";
    await forwardRequest(req, res, "post-service", `stories/${req.params.story_id}`);
  }
); 

// Get stories feed for a specific user_id (protected, just checks x-user-id is present)
router.get(
  "/feed/:user_id",
  authenticateAccessToken,
  async (req, res) => {
    logger.info(`Handling GET /stories/feed/${req.params.user_id} request`, { user_id: req.user?.user_id });
    req.headers["x-user-id"] = req.user?.user_id || "";
    await forwardRequest(req, res, "post-service", `stories/feed/${req.params.user_id}`);
  }
);

module.exports = router;