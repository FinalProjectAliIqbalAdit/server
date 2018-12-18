const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const uniqueValidator = require('mongoose-unique-validator')

const UserSchema = new Schema({
	name: {
		type: String,
		required: [true, "Name Required"],
		trim: true,
		minlength : 4
	},
	email: {
		type: String,
		unique: true,
		trim: true,
		required: [true, "Email Required"],
	},
	password: {
		type: String,
		required: [true, "Password Required"]
	},
	avatar: {
		type: String,
		default : ''
	},
	lat: {
		type: String,
		default: '-6.1753924'
	},
	lng: {
		type: String,
		default: '106.8249641'
	},
	score: {
		type: Number,
		default : 100
    },
  notifications: [{
      type: String
  }],
	userMeetings : [{
		type: Schema.Types.ObjectId,
		ref: 'Meeting'
	}],
	meetingInvitation : [{
		type: Schema.Types.ObjectId,
		ref: 'Meeting'
	}],
}, {
	timestamps: true,
	versionKey: false
});

UserSchema.path('email').validate(function (email) {
	let emailRegex = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;
	return emailRegex.test(email); 
}, 'Please input valid Email')

UserSchema.plugin(uniqueValidator, { message: 'Error, expected {PATH} to be unique.' })

module.exports = mongoose.model('User', UserSchema);