const mongoose = require('mongoose');

const { Schema } = mongoose;

const savedJobSchema = new Schema(
  {
    candidate: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    job: {
      type: Schema.Types.ObjectId,
      ref: 'Job',
      required: true,
    },
  },
  { timestamps: true },
);

// A candidate can only save a given job once.
savedJobSchema.index({ candidate: 1, job: 1 }, { unique: true });

module.exports = mongoose.model('SavedJob', savedJobSchema);
