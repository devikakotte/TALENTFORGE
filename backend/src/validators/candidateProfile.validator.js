const { body, param, query } = require('express-validator');

const updateProfileValidator = [
  body('headline').optional().trim().isLength({ max: 150 }).withMessage('Headline is too long'),
  body('bio').optional().trim().isLength({ max: 2000 }).withMessage('Bio is too long'),
  body('phone').optional().trim().isLength({ max: 30 }).withMessage('Phone number is too long'),
  body('location').optional().trim().isLength({ max: 150 }).withMessage('Location is too long'),
  body('skills').optional().isArray({ max: 50 }).withMessage('Skills must be a list of at most 50 items'),
  body('skills.*').optional().isString().trim().isLength({ min: 1, max: 60 }),
  body('projects').optional().isArray({ max: 30 }),
  body('projects.*').optional().isString().trim().isLength({ min: 1, max: 300 }),
  body('achievements').optional().isArray({ max: 30 }),
  body('achievements.*').optional().isString().trim().isLength({ min: 1, max: 500 }),
  body('preferences').optional().isArray({ max: 20 }),
  body('preferences.*').optional().isString().trim().isLength({ min: 1, max: 100 }),
  body('expectedSalary').optional().isFloat({ min: 0 }),
  body('availability').optional().trim().isLength({ max: 100 }),
  body('socialLinks.linkedin').optional({ checkFalsy: true }).isURL().withMessage('Invalid LinkedIn URL'),
  body('socialLinks.github').optional({ checkFalsy: true }).isURL().withMessage('Invalid GitHub URL'),
  body('socialLinks.portfolio').optional({ checkFalsy: true }).isURL().withMessage('Invalid portfolio URL'),
  body('socialLinks.twitter').optional({ checkFalsy: true }).isURL().withMessage('Invalid Twitter/X URL'),
  body('isDiscoverable').optional().isBoolean().withMessage('isDiscoverable must be a boolean'),
];

const educationValidator = [
  body('institution').trim().notEmpty().withMessage('Institution is required').isLength({ max: 150 }),
  body('degree').trim().notEmpty().withMessage('Degree is required').isLength({ max: 150 }),
  body('fieldOfStudy').optional().trim().isLength({ max: 150 }),
  body('startDate').isISO8601().withMessage('Valid start date is required'),
  body('endDate').optional({ checkFalsy: true }).isISO8601().withMessage('Invalid end date'),
  body('isCurrent').optional().isBoolean(),
  body('description').optional().trim().isLength({ max: 1000 }),
];

const experienceValidator = [
  body('company').trim().notEmpty().withMessage('Company is required').isLength({ max: 150 }),
  body('jobTitle').trim().notEmpty().withMessage('Job title is required').isLength({ max: 150 }),
  body('location').optional().trim().isLength({ max: 150 }),
  body('startDate').isISO8601().withMessage('Valid start date is required'),
  body('endDate').optional({ checkFalsy: true }).isISO8601().withMessage('Invalid end date'),
  body('isCurrent').optional().isBoolean(),
  body('description').optional().trim().isLength({ max: 1500 }),
];

const certificationValidator = [
  body('name').trim().notEmpty().withMessage('Certification name is required').isLength({ max: 150 }),
  body('issuingOrganization')
    .trim()
    .notEmpty()
    .withMessage('Issuing organization is required')
    .isLength({ max: 150 }),
  body('issueDate').optional({ checkFalsy: true }).isISO8601().withMessage('Invalid issue date'),
  body('expirationDate')
    .optional({ checkFalsy: true })
    .isISO8601()
    .withMessage('Invalid expiration date'),
  body('credentialId').optional().trim().isLength({ max: 100 }),
  body('credentialUrl').optional({ checkFalsy: true }).isURL().withMessage('Invalid credential URL'),
];

const subdocumentIdValidator = [param('itemId').isMongoId().withMessage('Invalid item id')];

const talentSearchValidator = [
  query('skills').optional().trim().isLength({ max: 300 }),
  query('location').optional().trim().isLength({ max: 150 }),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 50 }),
];

module.exports = {
  updateProfileValidator,
  educationValidator,
  experienceValidator,
  certificationValidator,
  subdocumentIdValidator,
  talentSearchValidator,
};
