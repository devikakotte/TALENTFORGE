const { body, param } = require('express-validator');
const Application = require('../models/Application');

const applyToJobValidator = [
  param('jobId').isMongoId().withMessage('Invalid job id'),
  body('coverLetter').optional().trim().isLength({ max: 5000 }).withMessage('Cover letter is too long'),
];

const applicationIdValidator = [param('applicationId').isMongoId().withMessage('Invalid application id')];

const updateApplicationStatusValidator = [
  param('applicationId').isMongoId().withMessage('Invalid application id'),
  body('status')
    .isIn(Application.APPLICATION_STATUSES.filter((status) => status !== 'withdrawn'))
    .withMessage('Invalid status'),
];

module.exports = {
  applyToJobValidator,
  applicationIdValidator,
  updateApplicationStatusValidator,
};
