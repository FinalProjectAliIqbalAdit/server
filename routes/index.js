const router = require("express").Router();
const UserController = require('../controllers/UserController.js');



router.get('/',(req,res)=>{res.status(200).send('Connected - Express App')})

router.post('/register', UserController.register);
router.post('/login', UserController.login);
router.get('/verify', UserController.verify);

router.use('/users', require('./UserRoutes.js'));
router.use('/meetings', require('./MeetingRoutes.js'));


module.exports = router;
