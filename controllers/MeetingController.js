const MeetingModel = require('../models/MeetingModel.js');
const UserModel = require('../models/UserModel.js');
const UserMeetingModel = require('../models/UserMeetingModel.js')
const { setDepartTime,substractMinute } = require('../helpers/helpers')
module.exports = {

    feedback(req,res){
        UserModel.findOneAndUpdate({ _id : req.body.participantId  },{
            score: req.body.feedbackScore
        },{})
            .then(()=>{
                res.status(200).json({
                    msg: `Score updated`
                })
            })
            .catch((err)=>{
                res.status(500).json({
                    msg: err
                })
            })
    },

    list(req, res) {
        MeetingModel.find()
            .populate('participants host', '_id avatar name email lat lng')
            .sort('-startAt')
            .exec()
            .then((result) => {
                res.status(200).json(result);
            }).catch((err) => {
                res.status(500).json({
                    message: 'Error when getting Meetings.',
                    error: err
                });
            });
    },

    show(req, res) {
        const id = req.params.id;
        MeetingModel.findById(id)
            .populate('participants host', '_id avatar name email lat lng')
            .exec()
            .then((meeting) => {
                if (!meeting) {
                    return res.status(404).json({
                        message: 'No such Meeting'
                    });
                }
                return res.status(200).json(meeting);
            }).catch((err) => {
                res.status(500).json({
                    message: 'Error when getting Meeting.',
                    error: err
                });
            });

    },

    getUserMeeting(req,res){
        const id = req.params.id
        UserMeetingModel.find({meeting: id})
            .populate('participant')
            .populate({
                path: 'meeting',
                populate: {path: 'host', select: '_id name email'}
            })
            .exec()
            .then((usermeeting)=>{
                return res.status(200).json(usermeeting)
            })
            .catch((err) => {
                res.status(500).json({
                    message: 'Error when getting UserMeeting.',
                    error: err
                });
            });
    },

    create(req, res) {

        MeetingModel.create({
            place: req.body.place,
            title : req.body.title,
			description : req.body.description,
			host : req.user._id, // from isLogin middleware
			lat : req.body.lat,
			lng : req.body.lng,
			startAt : req.body.startAt,
			participants : [req.user._id]
        })
        .then((meeting) => {
            return UserMeetingModel.create({
                meeting: meeting._id,
                participant: req.user._id,
                departTime: new Date() // 1jam sblum meeting startAt
            })
        })
        .then((userMeeting) => {
            return UserModel.findByIdAndUpdate(req.user._id, { 
                $push: { 
                    userMeetings: userMeeting.meeting
                } 
            })
        })
        .then((user) => {
            res.status(201).json({
                message : 'Create Meeting Succes'
            });
        }).catch((err) => {
            res.status(500).json({
                message: 'Error when creating Meeting',
                error: err
            });
        });

    },

    update(req, res) {

        const id = req.params.id;
        MeetingModel.findById(id, (err, meeting) => {
            if (err) {
                return res.status(500).json({
                    message: 'Error when getting Meeting',
                    error: err
                });
            }
            if (!meeting) {
                return res.status(404).json({
                    message: 'No such Meeting'
                });
            }

            meeting.title = req.body.title ? req.body.title : meeting.title;
			meeting.description = req.body.description ? req.body.description : meeting.description;
			meeting.host = req.body.host ? req.body.host : meeting.host;
			meeting.lat = req.body.lat ? req.body.lat : meeting.lat;
			meeting.lng = req.body.lng ? req.body.lng : meeting.lng;
			meeting.startAt = req.body.startAt ? req.body.startAt : meeting.startAt;
			meeting.participants = req.body.participants ? req.body.participants : meeting.participants;
			meeting.status = req.body.status ? req.body.status : meeting.status;
			
            meeting.save((err, meeting) => {
                if (err) {
                    return res.status(500).json({
                        message: 'Error when updating Meeting.',
                        error: err
                    });
                }

                return res.status(200).json(meeting);
            });
        })
        .populate('participants host', '_id avatar name email lat lng')

    },

    remove(req, res) {

        const id = req.params.id;
        MeetingModel.findByIdAndRemove(id, (err, meeting) => {
            if (err) {
                return res.status(500).json({
                    message: 'Error when deleting the Meeting.',
                    error: err
                });
            }
            return res.status(204).json();
        });

    },

    getAllUsersToInvite(req, res) {

        // Find users who doesn't have an invitation from this meeting or currently is not a participant of this meeting
        UserModel.find({
            meetingInvitation: {
                $ne: req.params.meetingId
            }, 
            userMeetings: {
                $ne: req.params.meetingId
            }
        })
            .then((users) => {
                res.status(200).json(users);
            })
            .catch((err) => {
                console.log('Get Users To Invite Error: ', err);
                res.status(500).json(err);
            });

    },

    inviteUserToMeeting(req, res) {

        const meetingId = req.params.id
        const userId = req.params.userId
        UserModel.findByIdAndUpdate(userId)
            .then((user) => {
                user.meetingInvitation.push(meetingId)
                return user.save()
            })
            .then((user) => {
                res.status(200).json({
                    message : 'Meeting invitation send to '+ user.name
                })
            }).catch((err) => {
                res.status(500).json({
                    message: 'Error when sending invitation.',
                    error: err
                });
            });

    },

    asignUserToMeeting(req, res) {

        const meetingId = req.params.id
        const userId = req.user._id // from middleware isLogin
        UserModel.findByIdAndUpdate(userId)
            .then((user) => {
                user.userMeetings.push(meetingId)
                let index = user.meetingInvitation.indexOf(String(meetingId))
                user.meetingInvitation.splice(index,1)
                return user.save()
            })
            .then((user) => {
              
              return MeetingModel.findByIdAndUpdate(meetingId, { 
                  $push: { 
                      participants: user._id
                  } 
              })
            })
            .then((meeting)=>{
                UserModel.findById(userId, async (err,user)=>{
                  const { msg } = await setDepartTime(meeting,user)
                  if (msg === 'success' ) {
                    let { output } = await setDepartTime(meeting,user)
                    console.log('process ini',output);
                    let departTimeML=substractMinute(String(meeting.startAt),Number(output))
                    console.log('meeting =>>>>',meeting.startAt,'perginya ===>',new Date(departTimeML));
                    return UserMeetingModel.create({
                        meeting: meetingId,
                        participant: userId,
                        departTime: new Date(String(departTimeML))//1jam sblum meeting startAt
                    })
                  }else{
                    throw err
                  }
                  
                })
                
            })
            .then((meeting) => {
                res.status(200).json({
                    message : 'Assign meeting succes',
                    data: meeting
                })   
            })
            .catch((err) => {
                res.status(500).json({
                    message: 'Error when accepting invitation.',
                    error: err
                });
            });    
          },

    refuseInvitation(req, res) {

        const meetingId = req.params.id

        UserModel.findByIdAndUpdate(req.user._id, {
            $pull: {
                meetingInvitation: meetingId
            }
        })
            .then((result) => {
                res.status(200).json({
                    message: `Successfully refused the invitation`
                });
            })
            .catch((err) => {
                console.log('Refuse Meeting Invitation Error: ', err);
                res.status(500).json(err);
            });
            
    }

};
