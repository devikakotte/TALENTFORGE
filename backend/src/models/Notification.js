const mongoose = require('mongoose');

const { Schema } = mongoose;

const NOTIFICATION_TYPES = [
  'application_status_change',
  'new_applicant',
  'job_published',
  'job_closed',
];

const notificationSchema = new Schema(
  {
    recipient: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: NOTIFICATION_TYPES,
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
    link: {
      type: String,
      trim: true,
      maxlength: 300,
    },
    relatedJob: {
      type: Schema.Types.ObjectId,
      ref: 'Job',
    },
    relatedApplication: {
      type: Schema.Types.ObjectId,
      ref: 'Application',
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    readAt: {
      type: Date,
    },
  },
  { timestamps: true },
);

notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });

notificationSchema.statics.NOTIFICATION_TYPES = NOTIFICATION_TYPES;

module.exports = mongoose.model('Notification', notificationSchema);
