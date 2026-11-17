const { param } = require('express-validator');

const notificationIdValidator = [
  param('notificationId').isMongoId().withMessage('Invalid notification id'),
];

module.exports = { notificationIdValidator };
