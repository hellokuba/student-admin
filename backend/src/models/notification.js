const mongoose = require('mongoose')

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['system', 'course', 'enrollment', 'grade', 'attendance'],
    default: 'system'
  },
  read: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
})

// 创建索引以提高查询性能
notificationSchema.index({ userId: 1, read: 1 })
notificationSchema.index({ createdAt: -1 })

const Notification = mongoose.model('Notification', notificationSchema)

module.exports = Notification 