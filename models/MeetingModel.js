const mongoose = require('mongoose');
const Schema   = mongoose.Schema;

const MeetingSchema = new Schema({
	host : {
		type: Schema.Types.ObjectId,
		ref: 'User'
	},
	title :{
		type: String,
		required: [true, "title is Required"],
		trim: true,
		minlength : 10
	},
	description : {
		type: String,
	},
	startAt : {
		type: Date,
		required: [true, "start date is Required"]
	},
	lat: {
		type: String,
		default: '-6.2607'
	},
	lng: {
		type: String,
		default: '106.7816'
	},
	participants : [{
		type: Schema.Types.ObjectId,
		ref: 'User'
	}],
	status : {
		type: String,
		default: 'upcoming'
	}
},{
	versionKey : false,
	timestamps : true
});

module.exports = mongoose.model('Meeting', MeetingSchema);
