const express = require("express");
const forwardRequest = require("../utils/forwardRequest");
const { authenticateAccessToken } = require("../middleware/auth");
const logger = require("../config/logger");
const { verifyAccessToken } = require("../utils/jwt");

const router = express.Router();

// Create a new membership (protected)
router.post(
  "/",
  authenticateAccessToken,
  express.json({ limit: "150mb" }),
  async (req, res) => {
    // Optionally, you can add authentication here if needed
    logger.info("Handling POST /memberships request");
    req.headers['x-user-id'] = req.user?.user_id || '';
    await forwardRequest(req, res, "sub-service", "memberships");
  }
);

// Get a user's membership by user_id (public)
router.get("/user/:user_id", async (req, res) => {
  logger.info(`Handling GET /memberships/user/${req.params.user_id} request`);
  await forwardRequest(
    req,
    res,
    "sub-service",
    `memberships/user/${req.params.user_id}`
  );
});

// Get a membership by membership_id (public)
router.get("/:membership_id", async (req, res) => {
  logger.info(`Handling GET /memberships/${req.params.membership_id} request`);
  await forwardRequest(
    req,
    res,
    "sub-service",
    `memberships/${req.params.membership_id}`
  );
});

module.exports = router;
