const { body, param, query } = require('express-validator');
const Job = require('../models/Job');

const createJobValidator = [
  body('title').trim().notEmpty().withMessage('Job title is required').isLength({ max: 150 }),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Job description is required')
    .isLength({ max: 8000 }),
  body('responsibilities').optional().isArray(),
  body('requirements').optional().isArray(),
  body('skills').optional().isArray({ max: 50 }),
  body('category').isIn(Job.JOB_CATEGORIES).withMessage('Invalid job category'),
  body('jobType').isIn(Job.JOB_TYPES).withMessage('Invalid job type'),
  body('experienceLevel').isIn(Job.EXPERIENCE_LEVELS).withMessage('Invalid experience level'),
  body('location').optional().trim().isLength({ max: 150 }),
  body('isRemote').optional().isBoolean(),
  body('salaryMin').optional({ checkFalsy: true }).isFloat({ min: 0 }),
  body('salaryMax').optional({ checkFalsy: true }).isFloat({ min: 0 }),
  body('currency').optional().trim().isLength({ max: 10 }),
  body('applicationDeadline').optional({ checkFalsy: true }).isISO8601(),
];

const updateJobValidator = [
  body('title').optional().trim().isLength({ max: 150 }),
  body('description').optional().trim().isLength({ max: 8000 }),
  body('responsibilities').optional().isArray(),
  body('requirements').optional().isArray(),
  body('skills').optional().isArray({ max: 50 }),
  body('category').optional().isIn(Job.JOB_CATEGORIES).withMessage('Invalid job category'),
  body('jobType').optional().isIn(Job.JOB_TYPES).withMessage('Invalid job type'),
  body('experienceLevel')
    .optional()
    .isIn(Job.EXPERIENCE_LEVELS)
    .withMessage('Invalid experience level'),
  body('location').optional().trim().isLength({ max: 150 }),
  body('isRemote').optional().isBoolean(),
  body('salaryMin').optional({ checkFalsy: true }).isFloat({ min: 0 }),
  body('salaryMax').optional({ checkFalsy: true }).isFloat({ min: 0 }),
  body('currency').optional().trim().isLength({ max: 10 }),
  body('applicationDeadline').optional({ checkFalsy: true }).isISO8601(),
];

const jobIdValidator = [param('jobId').isMongoId().withMessage('Invalid job id')];

const browseJobsValidator = [
  query('search').optional().trim().isLength({ max: 200 }),
  query('category').optional().isIn(Job.JOB_CATEGORIES).withMessage('Invalid job category'),
  query('jobType').optional().isIn(Job.JOB_TYPES).withMessage('Invalid job type'),
  query('experienceLevel')
    .optional()
    .isIn(Job.EXPERIENCE_LEVELS)
    .withMessage('Invalid experience level'),
  query('isRemote').optional().isBoolean(),
  query('location').optional().trim().isLength({ max: 150 }),
  query('sort').optional().isIn(['newest', 'oldest', 'salaryHigh', 'salaryLow']),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 50 }),
];

module.exports = {
  createJobValidator,
  updateJobValidator,
  jobIdValidator,
  browseJobsValidator,
};
