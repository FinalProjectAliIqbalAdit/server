const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

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
    
}