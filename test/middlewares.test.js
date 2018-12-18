process.env.NODE_ENV = 'test';
const app = require('../app.js');
const chai = require('chai');
const expect = chai.expect;
const chaiHttp = require('chai-http');
const helpers = require('../helpers/helpers.js')
const { isLogin } = require('../middlewares/auth')
chai.use(chaiHttp);
const UserModel = require('../models/UserModel.js');

describe(`isLogin`,()=>{
  let token = ''
  let user = {}
  let auser = {
    name: 'user',
    email: 'user@mail.com',
    password: 'user'
  }
  beforeEach(async () => {
    await chai
        .request(app)
        .post('/register')
        .send(auser);
    const response = await chai  
        .request(app)
        .post('/login')
        .send({email : 'user@mail.com', password: 'user'});  
    token = response.body.token;
    user = response.body.user;
  })
  
  afterEach((done) => {
    UserModel.deleteMany({}, err => {
        done()
    })
  });

  it('should return a function()', function() {
      expect(typeof(isLogin)).equals('function')
  });
  // it('should return User Credential Required if token does not exist', async () => {
  //   let req = {
  //     headers: {
  //       token: token
  //     },
  //     user: user
  //   }
  //   let res = {}
  //   var result = isLogin(req,res)
  //   console.log(res);
  //   // var myFunc = isLogin()
  // });
})