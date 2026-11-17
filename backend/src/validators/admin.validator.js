const { body, param, query } = require('express-validator');

const companyIdValidator = [param('companyId').isMongoId().withMessage('Invalid company id')];
const jobIdValidator = [param('jobId').isMongoId().withMessage('Invalid job id')];

const setUserActiveValidator = [
  param('userId').isMongoId().withMessage('Invalid user id'),
  body('isActive').isBoolean().withMessage('isActive must be a boolean'),
];

const listUsersValidator = [
  query('role').optional().isIn(['candidate', 'recruiter', 'admin']),
  query('isActive').optional().isBoolean(),
  query('search').optional().trim().isLength({ max: 150 }),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
];

module.exports = {
  companyIdValidator,
  jobIdValidator,
  setUserActiveValidator,
  listUsersValidator,
};
