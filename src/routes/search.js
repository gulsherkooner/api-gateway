const express = require("express");
const { authenticateAccessToken } = require("../middleware/auth");
const forwardRequest = require("../utils/forwardRequest");
const logger = require("../config/logger");

const router = express.Router();

// Search posts route (protected)
router.get("/search", authenticateAccessToken, async (req, res) => {
  logger.info("Handling GET /search request", { user_id: req.user?.user_id });
  req.headers["x-user-id"] = req.user?.user_id || "";

  // Forward search query params
  const { q, post_type, page, limit, seed } = req.query;
  let path = "search/search";
  const params = [];

  if (q) params.push(`q=${encodeURIComponent(q)}`);
  if (post_type) params.push(`post_type=${post_type}`);
  if (page) params.push(`page=${page}`);
  if (limit) params.push(`limit=${limit}`);
  if (seed) params.push(`seed=${encodeURIComponent(seed)}`);

  if (params.length > 0) path += `?${params.join("&")}`;

  await forwardRequest(req, res, "post-service", path);
});

// Suggestions route (protected)
router.get("/suggestions", authenticateAccessToken, async (req, res) => {
  logger.info("Handling GET /posts/suggestions request");
  req.headers["x-user-id"] = req.user?.user_id || "";
  await forwardRequest(req, res, "post-service", "search/suggestions");
});

module.exports = router;
