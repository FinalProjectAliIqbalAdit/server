const express = require('express');
const router = express.Router();
const UserController = require('../controllers/UserController.js');
const Auth = require('../middlewares/auth.js')

router.get('/', UserController.list)
router.get('/:id', Auth.isLogin, UserController.findOneById)
router.put('/:id', Auth.isLogin, UserController.update);
router.delete('/:id', Auth.isLogin, UserController.remove);


module.exports = router;
