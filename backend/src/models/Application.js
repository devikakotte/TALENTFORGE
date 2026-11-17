const mongoose = require('mongoose');

const { Schema } = mongoose;

const APPLICATION_STATUSES = ['applied', 'shortlisted', 'rejected', 'hired', 'withdrawn'];

const statusHistoryEntrySchema = new Schema(
  {
    status: { type: String, enum: APPLICATION_STATUSES, required: true },
    changedAt: { type: Date, default: Date.now },
  },
  { _id: false },
);

const applicationSchema = new Schema(
  {
    job: {
      type: Schema.Types.ObjectId,
      ref: 'Job',
      required: true,
    },
    candidate: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    recruiter: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    resumeSnapshot: {
      url: { type: String, trim: true },
      originalFileName: { type: String, trim: true },
    },
    coverLetter: {
      type: String,
      trim: true,
      maxlength: 5000,
    },
    status: {
      type: String,
      enum: APPLICATION_STATUSES,
      default: 'applied',
    },
    statusHistory: {
      type: [statusHistoryEntrySchema],
      default: () => [{ status: 'applied' }],
    },
    withdrawnAt: { type: Date },
  },
  { timestamps: true },
);

// A candidate can only apply once per job - enforced at the database
// level (not just in application code) to prevent duplicate
// applications even under concurrent requests.
applicationSchema.index({ job: 1, candidate: 1 }, { unique: true });
applicationSchema.index({ candidate: 1, status: 1 });
applicationSchema.index({ recruiter: 1, job: 1, status: 1 });

applicationSchema.methods.transitionTo = function transitionTo(newStatus) {
  this.status = newStatus;
  this.statusHistory.push({ status: newStatus, changedAt: new Date() });
  if (newStatus === 'withdrawn') {
    this.withdrawnAt = new Date();
  }
};

applicationSchema.statics.APPLICATION_STATUSES = APPLICATION_STATUSES;

module.exports = mongoose.model('Application', applicationSchema);
