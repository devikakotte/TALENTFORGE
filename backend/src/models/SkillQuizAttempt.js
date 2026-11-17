const mongoose = require('mongoose');

const { Schema } = mongoose;

const PASS_THRESHOLD = 0.7; // 70% correct required to earn the verified badge

const quizQuestionSchema = new Schema(
  {
    question: { type: String, required: true, trim: true },
    options: {
      type: [String],
      required: true,
      validate: { validator: (arr) => arr.length >= 2 && arr.length <= 6, message: 'A question needs 2-6 options' },
    },
    // Never sent to the candidate until after submission (see
    // ai.service.js) - selected explicitly in submitSkillQuiz, never by
    // a default profile/population that could leak it early.
    correctIndex: { type: Number, required: true, min: 0 },
  },
  { _id: false },
);

const skillQuizAttemptSchema = new Schema(
  {
    candidate: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    skill: {
      type: String,
      required: true,
      trim: true,
    },
    questions: {
      type: [quizQuestionSchema],
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'passed', 'failed'],
      default: 'pending',
    },
    score: {
      type: Number, // 0-1 fraction correct, set on submission
    },
    submittedAt: { type: Date },
  },
  { timestamps: true },
);

skillQuizAttemptSchema.index({ candidate: 1, skill: 1, createdAt: -1 });
// A quiz left unanswered for a day is abandoned - clean it up automatically
// rather than letting stale attempts accumulate.
skillQuizAttemptSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: 60 * 60 * 24, partialFilterExpression: { status: 'pending' } },
);

skillQuizAttemptSchema.statics.PASS_THRESHOLD = PASS_THRESHOLD;

module.exports = mongoose.model('SkillQuizAttempt', skillQuizAttemptSchema);
