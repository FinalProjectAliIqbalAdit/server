const mongoose = require('mongoose');
const Schema   = mongoose.Schema;

const UserMeetingSchema = new Schema({
  participant : {
		type: Schema.Types.ObjectId,
		ref: 'User'
  },
  meeting: {
    type: Schema.Types.ObjectId,
		ref: 'Meeting'
  },
  departTime: Date
})

module.exports = mongoose.model('UserMeeting', UserMeetingSchema);