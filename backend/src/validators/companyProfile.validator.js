const { body } = require('express-validator');
const CompanyProfile = require('../models/CompanyProfile');

const updateCompanyValidator = [
  body('companyName')
    .trim()
    .notEmpty()
    .withMessage('Company name is required')
    .isLength({ max: 150 })
    .withMessage('Company name is too long'),
  body('industry').optional().trim().isLength({ max: 100 }),
  body('companySize')
    .optional()
    .isIn(CompanyProfile.COMPANY_SIZES)
    .withMessage('Invalid company size'),
  body('website').optional({ checkFalsy: true }).isURL().withMessage('Invalid website URL'),
  body('description').optional().trim().isLength({ max: 3000 }),
  body('headquarters').optional().trim().isLength({ max: 150 }),
  body('foundedYear')
    .optional({ checkFalsy: true })
    .isInt({ min: 1800, max: new Date().getFullYear() })
    .withMessage('Invalid founded year'),
  body('socialLinks.linkedin').optional({ checkFalsy: true }).isURL().withMessage('Invalid LinkedIn URL'),
  body('socialLinks.twitter').optional({ checkFalsy: true }).isURL().withMessage('Invalid Twitter/X URL'),
];

module.exports = { updateCompanyValidator };
