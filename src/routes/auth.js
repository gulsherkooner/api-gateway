const express = require("express");
const {
  validateRegister,
  validateLogin,
  validateRefresh,
} = require("../middleware/validate");
const validateResult = require("../middleware/validateResult");
const limiter = require("../middleware/rateLimit");
const {
  authenticateAccessToken,
  authenticateRefreshToken,
} = require("../middleware/auth");
const {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
} = require("../utils/jwt");
const logger = require("../config/logger");
const forwardRequest = require("../utils/forwardRequest");
const { google } = require("googleapis");
const nodemailer = require("nodemailer");

const router = express.Router();

router.post(
  "/register",
  limiter,
  validateRegister,
  validateResult,
  async (req, res) => {
    logger.info("Handling POST /auth/register request");
    await forwardRequest(req, res, "auth-service", "register");
  }
);

router.post(
  "/login",
  limiter,
  validateLogin,
  validateResult,
  async (req, res) => {
    logger.info("Handling POST /auth/login request");
    await forwardRequest(req, res, "auth-service", "login");
  }
);

router.post(
  "/refresh",
  validateRefresh,
  validateResult,
  authenticateRefreshToken,
  async (req, res) => {
    try {
      const { user_id, email, username } = req.user;
      const newAccessToken = generateAccessToken({ user_id, email, username });
      const newRefreshToken = generateRefreshToken({
        user_id,
        email,
        username,
      });

      res.set(
        "Set-Cookie",
        `refreshToken=${newRefreshToken}; HttpOnly; Path=/; Max-Age=${
          7 * 24 * 60 * 60
        }`
      );
      res.status(200).json({
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      });
    } catch (error) {
      logger.error(`Refresh token error: ${error.message}`);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

router.get("/user", authenticateAccessToken, async (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];
    try {
      const decoded = verifyAccessToken(token);
      req.headers["x-user-id"] = decoded.user_id;
      logger.info(
        `GET /posts/${req.params.post_id} with user_id: ${decoded.user_id}`
      );
    } catch (error) {
      logger.warn(
        `Invalid token for GET /posts/${req.params.post_id}: ${error.message}`
      );
    }
  }
  logger.info("Handling GET /auth/user request");
  await forwardRequest(req, res, "auth-service", "user");
});

router.get("/user/:user_id", async (req, res) => {
  logger.info("Handling GET /auth/users request");
  await forwardRequest(req, res, "auth-service", `user/${req.params.user_id}`);
});

router.put("/user", async (req, res) => {
  logger.info("Handling PUT /auth/user request");
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];
    try {
      const decoded = verifyAccessToken(token);
      req.headers["x-user-id"] = decoded.user_id;
      logger.info(`PUT /auth/user with user_id: ${decoded.user_id}`);
    } catch (error) {
      logger.warn(`Invalid token for PUT /auth/user: ${error.message}`);
      return res.status(401).json({ error: "Invalid token" });
    }
  } else {
    return res.status(401).json({ error: "Authorization header missing" });
  }
  await forwardRequest(req, res, "auth-service", "user");
});

router.post("/sendOTP", async (req, res) => {
  const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
  const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
  const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI;
  const REFRESH_TOKEN = process.env.GOOGLE_REFRESH_TOKEN;

  // console.log(CLIENT_ID,":::::",CLIENT_SECRET,":::::",REDIRECT_URI,":::::",REFRESH_TOKEN,":::::",process.env.GMAIL_USER)
  console.log(req.body)

  const oauth2Client = new google.auth.OAuth2(
    CLIENT_ID,
    CLIENT_SECRET,
    REDIRECT_URI
  );
  oauth2Client.setCredentials({
    refresh_token: REFRESH_TOKEN,
  });
  const { email, verificationCode } = req.body;
  try {
    if (!email || !verificationCode) {
      return res
        .status(400)
        .json({ message: "Email and verification code are required" });
    }
    const accessToken = await oauth2Client.getAccessToken();

    // Create transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: process.env.GMAIL_USER,
        clientId: CLIENT_ID,
        clientSecret: CLIENT_SECRET,
        refreshToken: REFRESH_TOKEN,
        accessToken: accessToken.token,
      },
    });

    // Send email
    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: email,
      subject: "Verification Code",
      text: `Your verification code is: ${verificationCode}`,
      html: `<p>Your verification code is: <strong>${verificationCode}</strong></p>`,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ verificationCode });
  } catch (error) {
    logger.info(
      `Handling POST /auth/sendOTP request, error sending code:${error}`
    );
    res
      .status(500)
      .json({ message: "Error sending email", error: error.message });
  }
});

router.post("/change-password", authenticateAccessToken, async (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];
    try {
      const decoded = verifyAccessToken(token);
      req.headers["x-user-id"] = decoded.user_id;
      logger.info(
        `POST /change-password with user_id: ${decoded.user_id}`
      );
    } catch (error) {
      logger.warn(
        `Invalid token for POST /change-password: ${error.message}`
      );
    }
  }
  logger.info("Handling POST /auth/change-password request");
  await forwardRequest(req, res, "auth-service", "change-password");
});


module.exports = router;
