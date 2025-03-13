const mongoose = require('mongoose');

const gradeSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  score: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  type: {
    type: String,
    required: true,
    enum: ['midterm', 'final', 'assignment', 'quiz']
  },
  comment: String
}, {
  timestamps: true
});

// Compound index to ensure a student can only have one grade per course per type
gradeSchema.index({ studentId: 1, courseId: 1, type: 1 }, { unique: true });

const Grade = mongoose.model('Grade', gradeSchema);

module.exports = Grade; 