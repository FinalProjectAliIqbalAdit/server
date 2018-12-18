process.env.NODE_ENV = 'test';
const app = require('../app.js');
const chai = require('chai');
const expect = chai.expect;
const chaiHttp = require('chai-http');
const helpers = require('../helpers/helpers.js')

chai.use(chaiHttp);
const UserModel = require('../models/UserModel.js');

describe('Connection', () => {
    it('should connnect express app', (done) => {
        chai.request(app)
            .get('/')
            .end((err, res) => {
                expect(res).to.have.status(200);
                done()
            })
    });
});

describe('User Register and Login', () => {

    let req = {
        body : {},
        headers : {}
    }
    
    beforeEach((done) => {
        req.body = {
            name : 'kosasih',
            email : 'kosasih@mail.com',
            password : 'kosasih'
        }
        done()
    });

    afterEach((done) => {
        UserModel.deleteMany({}, err => {
            done()
        })
    });

    describe('POST /register', () => {
        
        it('should create new user - status 201', (done) => {
            chai.request(app)
                .post('/register')
                .send(req.body)
                .end((err, res) => {
                    expect(res).to.have.status(201);
                    expect(res.body).to.have.property("message").eql('Register Success');
                    expect(res.body).to.have.property("token");
                    expect(res.body).to.have.property("user");
                    expect(res.body.user).to.have.property("_id");
                    expect(res.body.user).to.have.property("name").eql('kosasih');
                    expect(res.body.user).to.have.property("email").eql('kosasih@mail.com');
                    done()
                })
        });

        it('should not register without fullfill name field - 400', (done) => {
            req.body.name = undefined
            chai.request(app)
                .post('/register')
                .send(req.body)
                .end((err, res) => {
                    expect(res).to.have.status(400);
                    expect(res.body).to.have.property("errors");
                    expect(res.body.errors.name).to.have.property("message").eql('Name Required');
                    done()  
                })
        });

        it('should not register without fill name field with length < 4 - 400', (done) => {
            req.body.name = '123'
            chai.request(app)
                .post('/register')
                .send(req.body)
                .end((err, res) => {
                    expect(res).to.have.status(400);
                    expect(res.body).to.have.property("errors");
                    expect(res.body.errors.name).to.have.property("message")
                    done()  
                })
        });

        it('should not register without fullfill email field - 400', (done) => {
            req.body.email = ''
            chai.request(app)
                .post('/register')
                .send(req.body)
                .end((err, res) => {
                    expect(res).to.have.status(400);
                    expect(res.body).to.have.property("errors");
                    expect(res.body.errors.email).to.have.property("message").eql('Email Required');
                    done()  
                })
        });

        it('should not register without fullfill password field - 400', (done) => {
            req.body.password = undefined
            chai.request(app)
                .post('/register')
                .send(req.body)
                .end((err, res) => {
                    expect(res).to.have.status(400);
                    expect(res.body).to.have.property("errors");
                    expect(res.body.errors.password).to.have.property("message").eql('Password Required');
                    done()  
                })
        });

        it('should not register with existing email - 400', (done) => {
            UserModel.create(req.body)
            .then((result) => {
                
                chai.request(app)
                    .post('/register')
                    .send(req.body)
                    .end((err, res) => {
                                             
                        expect(res).to.have.status(400);
                        expect(res.body).to.have.property("errors");
                        expect(res.body.errors.email).to.have.property("message").eql('Error, expected email to be unique.');
                        done()  
                    })
                
            })
        });

    });

    describe('POST /login ', () => {
        
        it('should sign in user', (done) => {
            req.body.password = helpers.hash(req.body.password)            
            UserModel.create(req.body)
                .then((result) => {
                    chai.request(app)
                        .post('/login')
                        .send({
                            email : 'kosasih@mail.com',
                            password : 'kosasih'
                        })
                        .end((err, res) => {
                            expect(res).to.have.status(200);
                            expect(res.body).to.have.property("message").eql('Login Success');
                            expect(res.body).to.have.property("user");
                            expect(res.body).to.have.property("token");
                            done()
                        })
                })
        });

        it('should sign in with valid registered email', (done) => {
            req.body.password = helpers.hash(req.body.password)
            UserModel.create(req.body)
                .then((result) => {
                    chai.request(app)
                        .post('/login')
                        .send({
                            email: 'unregistered@email.com',
                            password: 'whatever'
                        })
                        .end((err, res) => {
                            expect(res).to.have.status(400);
                            expect(res.body).to.have.deep.property("message").eql('Wrong email & Password');
                            done()
                        })
                })
        });

        it('should sign in with correct account password', (done) => {
            req.body.password = helpers.hash(req.body.password)
            UserModel.create(req.body)
                .then((result) => {
                    chai.request(app)
                        .post('/login')
                        .send({
                            email: 'kosasih@mail.com', //correct
                            password: 'wrongaccountpass' //wrong
                        })
                        .end((err, res) => {
                            expect(res).to.have.status(400);
                            expect(res.body).to.have.deep.property("message").eql('Wrong email & Password');
                            done()
                        })
                })
        });

    });
});

describe('Users Listing', () => {

    let token = ''
    let auser = {
      name: 'user',
      email: 'user@mail.com',
      password: helpers.hash('user')
    }
    let user = {}
    
    beforeEach(async () => {
      const response = await chai
          .request(app)
          .post('/register')
          .send(auser);
      const login = await chai  
          .request(app)
          .post('/login')
          .send({name : 'user', password: 'user'});  
      console.log('===>',login);
    })
    
    afterEach((done) => {
        UserModel.deleteMany({}, err => {
            done()
        })
    });

      it('should get user by headers token and params id', (done) => {
          chai.request(app)
              .get(`/users/${user._id}`)
              .set('token',token)
              .end((err, res) => {
                  expect(res).to.have.status(200);
                  expect(res.body).to.be.a("object");
                  expect(res.body).to.have.property("_id")
                  expect(res.body).to.have.property("name")
                  expect(res.body).to.have.property("email")
                  done()
              })
      });
  
      // it('should not get user without valid headers token', (done) => {
      //     console.log(user);
      //     chai.request(app)
      //         .get(`/users/${user._id}`)
      //         .set('token','1nc0rrectt0k3n')
      //         .end((err, res) => {
      //             expect(res).to.have.status(500);
      //             expect(res.body).to.be.a("object");
      //             expect(res.body).to.have.property('message').eql('Invalid User Creditial')
      //             expect(res.body).to.have.property("error");
      //             done()
      //         })
      // });

      // it('should not get user without valid params id according to headers token', (done) => {
      //     chai.request(app)
      //         .get(`/users/1nc0rrect1D`)
      //         .set('token',token)
      //         .end((err, res) => {
      //             expect(res).to.have.status(500);
      //             expect(res.body).to.be.a("object");
      //             expect(res.body).to.have.property('message').eql('you\'re not auhtorized for doing this actions')
      //             done()
      //         })
      // });

      
  });