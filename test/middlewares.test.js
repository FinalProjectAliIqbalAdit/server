process.env.NODE_ENV = 'test';
const app = require('../app.js');
const chai = require('chai');
const expect = chai.expect;
const chaiHttp = require('chai-http');
const jwt = require("jsonwebtoken");
const helpers = require('../helpers/helpers.js')
const { 
  decodeToken,
  createToken,
  hash,
  compareSync,
  getMinute,
  substractMinute,
  setDepartTime
} = require('../helpers/helpers')
chai.use(chaiHttp);
require('dotenv').config()

describe(`token`,()=>{
  let tokenInfoObj = {
    email: 'testing@mail.com',
    name: 'testing'
  }
  let token = jwt.sign(tokenInfoObj, process.env.JWTSECRET, {
                  expiresIn : '24h'
              })
  it('Function createToken should return a token', function() {
      const result = createToken(tokenInfoObj)
      
      expect(typeof(result)).equals('string')
      expect(result.split('.')).to.have.length(3)
  });
  it('Function decodeToken should return a token',()=>{
      const result = decodeToken(token)
      expect(typeof(result)).equal('object')
      expect(result).to.have.property('iat')
      expect(result).to.have.property('exp')
      expect(result.email).equal(tokenInfoObj.email)
      expect(result.name).equal(tokenInfoObj.name)
  })
  it('Function hash should return hashed password',()=>{
    const result = hash('testingpassword')
    expect(typeof(result)).equal('string')
    expect(result).not.equal('testingpassword')
  })    
  it('Function compareSync',()=>{
    const result = compareSync('asdf','$2a$10$oBRp9CiSXyWRZ86aEA9bX.aPdOoWSD3bREk8rAL3Fl.UnDxwUcS1e')
    expect(typeof(result)).equal('boolean')
    expect(result).equal(true)
  })
  it('Function getMinute should return menitTotal',()=>{
    const result = getMinute('2 jam 30 menit')
    
    expect(typeof(result)).equal('number')
    expect(result).equal(150)
  })
  it(('Function substractMinute should return date'),()=>{
    const result = substractMinute("2018-12-21T06:40:09.000Z",9)
    expect(typeof(result)).equal('object')
  })
})

describe('Function setDepartTime testing',async ()=>{
  let meeting = { lat: '-6.260698', lng: '106.781618' }
  let user = {lat: '-6.261537',lng: '106.782842', score: 87}
  it('should return a prediction',async ()=>{
    const result = await setDepartTime(meeting,user)
    expect(typeof(result)).equal('object')
    expect(result).to.have.property('msg').equal('success')
    expect(result).to.have.property('output')
  })
  it('should success if durations longer than 1 hour', async ()=>{
    const result = await setDepartTime({ lat: '-8.253762', lng: '113.725711' },user)
    expect(typeof(result)).equal('object')
    expect(result).to.have.property('msg').equal('success')
    expect(result).to.have.property('output')
  })
})