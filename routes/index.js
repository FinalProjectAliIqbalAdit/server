const router = require("express").Router();
const UserController = require('../controllers/UserController.js');
const Pusher = require('pusher')

let pusher = new Pusher({ 
    appId: process.env.APP_ID, 
    key: process.env.APP_KEY, 
    secret:  process.env.APP_SECRET,
    cluster: process.env.APP_CLUSTER, 
});

router.get('/',(req,res)=>{res.status(200).send('Connected - Express App')})

router.post('/register', UserController.register);
router.post('/login', UserController.login);
router.get('/verify', UserController.verify);

router.use('/users', require('./UserRoutes.js'));
router.use('/meetings', require('./MeetingRoutes.js'));

router.post('/pusher/auth', (req, res) => {
    let socketId = req.body.socket_id;
    let channel = req.body.channel_name;
    let auth = pusher.authenticate(socketId, channel);  
    let app_key = req.body.app_key;
    if(app_key == process.env.UNIQUE_KEY){
      let auth = pusher.authenticate(socketId, channel);
      res.send(auth);
    }

    res.send(auth);
});

module.exports = router;
