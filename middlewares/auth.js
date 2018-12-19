const UserModel = require('../models/UserModel.js')
const MeetingModel = require('../models/MeetingModel.js')
const jwt = require('jsonwebtoken')

module.exports = {

    isLogin(req, res, next) {
        let token = req.headers.token

        if (token) {
            jwt.verify(token, process.env.JWTSECRET, function (err, decoded) {
                if (!err) {
                      UserModel.findOne({
                            _id: decoded._id
                        })
                        .then((user) => {
                            req.user = user
                            next()
                        })
                } else {
                    res.status(500).json({
                        message: `Invalid User Credential`,
                        error : err
                    })
                }
            })
        } else {
            res.status(500).json({
                message: `User Credential Required`
            })
        }

    },

    isMeetingHost(req, res, next ) {
        let user = req.user // from auth.isLogin
        let meetingId = req.params.id

        MeetingModel.findById(meetingId)
            .then((meeting) => {
                if(!meeting) {
                    res.status(404).json({
                        message: `no such meeting`
                    })
                } else if (meeting.host.toString() != user._id) {
                    res.status(403).json({
                        message: `You are not authorized for doing this action`
                    })
                } else {
                    req.meeting = meeting
                    next()
                }
            }).catch((err) => {
                res.status(500).json({
                    error : err,
                    message: `Error when getting meeting`
                })
            });

    }

}