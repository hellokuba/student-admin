const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
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
  date: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    required: true,
    enum: ['present', 'absent', 'late', 'excused']
  },
  remark: String
}, {
  timestamps: true
});

// Compound index to ensure a student can only have one attendance record per course per date
attendanceSchema.index({ studentId: 1, courseId: 1, date: 1 }, { unique: true });

const Attendance = mongoose.model('Attendance', attendanceSchema);

module.exports = Attendance; 