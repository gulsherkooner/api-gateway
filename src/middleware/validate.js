const { body } = require('express-validator');

const validateRegister = [
  body('email').isEmail().withMessage('Invalid email format'),
  body('username').isLength({ min: 3, max: 30 }).matches(/^[a-zA-Z0-9_]+$/).withMessage('Username must be 3-30 characters and contain only letters, numbers, or underscores'),
  body('password').isLength({ min: 8, max: 50 }).withMessage('Password must be 8-50 characters'),
  body('name').optional().isLength({ max: 50 }).withMessage('Name must be 50 characters or less'), // Changed from display_name
  body('bio').optional().isLength({ max: 500 }).withMessage('Bio must be 500 characters or less'),
  body('profile_img_url').optional({ checkFalsy: true }).isURL().withMessage('Profile image URL must be valid'),
];

const validateLogin = [
  body('email').isEmail().withMessage('Invalid email format'),
  body('password').isLength({ min: 8, max: 50 }).withMessage('Password must be 8-50 characters'),
];

const validateRefresh = [
  // Make refreshToken optional in body since it might come from cookies
  body('refreshToken')
    .optional()
    .isString()
    .withMessage('Refresh token must be a string')
    .notEmpty()
    .withMessage('Refresh token cannot be empty'),
];

module.exports = {
  validateRegister,
  validateLogin,
  validateRefresh,
};