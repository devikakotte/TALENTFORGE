const { body } = require('express-validator');
const User = require('../models/User');

const registerValidator = [
  body('fullName')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Full name must be between 2 and 100 characters'),
  body('email').trim().isEmail().withMessage('A valid email is required').normalizeEmail(),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/\d/)
    .withMessage('Password must contain at least one number')
    .matches(/[A-Za-z]/)
    .withMessage('Password must contain at least one letter'),
  body('role')
    .optional()
    .isIn(User.ROLES.filter((role) => role !== 'admin'))
    .withMessage('Role must be either candidate or recruiter'),
];

const loginValidator = [
  body('email').trim().isEmail().withMessage('A valid email is required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];

const forgotPasswordValidator = [
  body('email').trim().isEmail().withMessage('A valid email is required').normalizeEmail(),
];

const resetPasswordValidator = [
  body('token').notEmpty().withMessage('Reset token is required'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/\d/)
    .withMessage('Password must contain at least one number')
    .matches(/[A-Za-z]/)
    .withMessage('Password must contain at least one letter'),
];

const changePasswordValidator = [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/\d/)
    .withMessage('Password must contain at least one number')
    .matches(/[A-Za-z]/)
    .withMessage('Password must contain at least one letter'),
];

module.exports = {
  registerValidator,
  loginValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
  changePasswordValidator,
};
