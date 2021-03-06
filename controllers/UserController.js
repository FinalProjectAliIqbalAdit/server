const UserModel = require('../models/UserModel.js');
const helpers = require('../helpers/helpers.js');


const UserController = {

    verify(req, res) {

        let token = req.headers.token
        let id =  ''

        try {
            id = helpers.decodeToken(token)
            req.params.id = id
            UserController.findOneById(req, res) 
        } catch (error) {
            return res.status(401).json({
                message : 'Token expired'
            })          
        }

    },

    async list(req, res) {
        const users = await UserModel.find()
        res.status(200).json(users)
    },

    findOneById(req, res) {
        let id = req.params.id
        UserModel.findById(id)
            .populate('meetingInvitation userMeetings')
            .populate({
                path: 'userMeetings',
                populate: {path: 'host', select: '_id name email'}
            })
            .exec()
            .then((user) => {
                return res.status(200).json(user);
            })
            .catch((err) => {
                res.status(500).json({
                    message: 'you\'re not auhtorized for doing this actions',
                    error: err
                });
            });
    },

    register(req, res) {

        let newUser = {
            name: req.body.name,
            email: req.body.email,
            password: req.body.password ? helpers.hash(req.body.password) : undefined,
            lat: req.body.lat ? req.body.lat : undefined,
            lng: req.body.lng ? req.body.lng : undefined
        }

        UserModel.create( newUser )
            .then((result) => {
                let token = helpers.createToken({
                    _id: result._id.toString(),
                    name : result.name,
                    email : result.email,
                })

                res.status(201).json({
                    message: "Register Success",
                    token: token,
                    user : {
                        _id: result._id.toString(),
                        name : result.name,
                        email : result.email
                    }
                })
                
            })
            .catch((err) => {
                res.status(400).json(err);
            });

    },

   login(req, res) {

        UserModel.findOne({
                email: req.body.email
            })
            .then((user) => {
                
                if (user && helpers.compareSync(req.body.password, user.password)) {
                    let token = helpers.createToken({
                        _id: user._id.toString(),
                        name : user.name,
                        email : user.email
                    })
                    user.password = undefined
                    res.status(200).json({
                        token: token,
                        message: "Login Success",
                        user
                    })
                } else {
                    res.status(400).json({
                        message: "Wrong email & Password"
                    })
                }
            })

    },

    async update(req, res) {
        const id = req.params.id;
        let updateUser = {
            avatar : req.body.avatar,
            name : req.body.name,
        }
        
        if(req.body.password) {
            updateUser.password = helpers.hash(req.body.password)
        }
        
        const result = await UserModel.findByIdAndUpdate(id, updateUser, { new: true })
        res.status(200).json({
            message : `update user success`,
            data : result
        })

    },

    remove(req, res) {

        var id = req.params.id;
        UserModel.findByIdAndRemove(id, (err, user) => {
            return res.status(204).json();
        });
        
    }


};

module.exports = UserController