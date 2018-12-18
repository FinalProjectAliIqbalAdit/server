const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const tf = require('@tensorflow/tfjs');
const axios = require('axios');
const UserMeetingModel = require('../models/UserMeetingModel')
global.fetch = require('node-fetch');
// Load the binding (CPU computation)
// require('@tensorflow/tfjs-node')
require('dotenv').config()
module.exports = {

    createToken(tokenInfoObj) {
        return jwt.sign(tokenInfoObj, process.env.JWTSECRET, {
            expiresIn : '24h'
        })
    },

    decodeToken(token) {
        return jwt.verify(token, process.env.JWTSECRET);
    },

    hash(password) {
        return bcrypt.hashSync(password);
    },
    
    compareSync(password, hashedPassword) {
      return bcrypt.compareSync(password, hashedPassword);
    },
    getMinute(text){
      var arrDuration = text.split(' ')
      let menitTotal;
      if(arrDuration.indexOf('jam') !== -1){
        let menitJam = Number(arrDuration[0])*60
        let menit = Number(arrDuration[2])
        menitTotal = menitJam+menit
      }else{
        menitTotal = Number(arrDuration[0])
      }
      return menitTotal
    },
    substractMinute(str,minutes){
      var myEndDateTime = new Date(str)
      var MS_PER_MINUTE = 60000;
      var newDate = new Date(myEndDateTime - minutes * MS_PER_MINUTE);
      return newDate
    },
    async setDepartTime(meeting,user){   
      let { data } = await axios.get(`https://maps.googleapis.com/maps/api/distancematrix/json?units=metric&origins=${Number(meeting.lat)},${Number(meeting.lng)}&destinations=${Number(user.lat)},${Number(user.lng)}&departure_time=now&mode=driving&language=id&key=${process.env.API_KEY}`)

      var arrDistance = data.rows[0].elements[0].distance.text.split(' ')
      var toDot = arrDistance[0].split(',')
      var alreadyDot = Number(toDot.join('.'))
      var arrDuration = data.rows[0].elements[0].duration.text.split(' ');
      let menitTotal;
      if(arrDuration.indexOf('jam') !== -1){
        let menitJam = Number(arrDuration[0])*60
        let menit = Number(arrDuration[2])
        menitTotal = menitJam+menit
      }else{
        menitTotal = Number(arrDuration[0])
      }
      let myObj = {
        duration: menitTotal,
        distance: alreadyDot,
        score: Number(user.score),
        traffic_model: 'best_guess'
      }
      let input = []
      input.push(myObj)
      let testingData = tf.tensor2d(input.map(item => [item.duration,item.distance,item.score]))
      let myModel = await tf.loadModel('https://storage.googleapis.com/hacktivoverflow-storage/tes3.json')
      let result = await myModel.predict(testingData).data()
      let str = ''
      if (result[0] > result[1]) {
        str = 'best_guess'
      }else{
        str = 'pessimistic'
      }
      
      return new Promise((resolve,reject)=>{
        axios.get(`https://maps.googleapis.com/maps/api/distancematrix/json?units=metric&origins=${Number(meeting.lat)},${Number(meeting.lng)}&destinations=${Number(user.lat)},${Number(user.lng)}&traffic_model=${str}&departure_time=now&mode=driving&language=id&key=${process.env.API_KEY}`)
          .then(({ data })=>{
            resolve({
              msg: 'success',
              output: module.exports.getMinute(data.rows[0].elements[0].duration_in_traffic.text)
            })
          })
          .catch((err)=>{
            reject({
              msg: err
            })
          })
      })
    }
    
}