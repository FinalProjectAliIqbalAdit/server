const express = require('express');
const router = express.Router();
const MeetingController = require('../controllers/MeetingController.js');
const auth = require('../middlewares/auth.js')

router.put('/feedback',auth.isLogin, auth.isMeetingHost,MeetingController.feedback)
router.get('/invite/:id/:userId', auth.isLogin, MeetingController.inviteUserToMeeting);
router.get('/accept/:id', auth.isLogin, MeetingController.asignUserToMeeting);
router.get('/refuse/:id', auth.isLogin, MeetingController.refuseInvitation);
router.get('/userstoinvite/:meetingId', auth.isLogin, MeetingController.getAllUsersToInvite);
router.get('/', MeetingController.list);
router.get('/:id', MeetingController.show);
router.get('/users/:id', MeetingController.getUserMeeting);
router.post('/', auth.isLogin, MeetingController.create);
router.put('/:id', auth.isLogin, auth.isMeetingHost,  MeetingController.update);
router.delete('/:id', auth.isLogin, auth.isMeetingHost, MeetingController.remove);
module.exports = router;
