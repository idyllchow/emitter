var express = require('express');
var router = express.Router();
const passport = require('passport')
const bcrypt = require('bcrypt')
const LocalStrategy = require('passport-local').Strategy

const authenticationMiddleware = require('./middleware')

// Generate Password
const saltRounds = 10
const myPlaintextPassword = '111111'
const salt = bcrypt.genSaltSync(saltRounds)
const passwordHash = bcrypt.hashSync(myPlaintextPassword, salt)

const user = {
  username: 'user',
  passwordHash,
  id: 1
}

router.get('/', function(req, res, next) {
  res.render('../index', {title:"主页"});
});

function findUser (username, callback) {
  if (username === user.username) {
    return callback(null, user)
  }
  return callback(null)
}

passport.serializeUser(function (user, cb) {
  cb(null, user.username)
})

passport.deserializeUser(function (username, cb) {
  findUser(username, cb)
})

function initPassport () {

  console.log("=======initPassport=====");
  passport.use(new LocalStrategy(
    (username, password, done) => {
      findUser(username, (err, user) => {
        if (err) {
          return done(err)
        }

        // User not found
        if (!user) {
          console.log('User not found')
          return done(null, false)
        }

        // Always use hashed passwords and fixed time comparison
        bcrypt.compare(password, user.passwordHash, (err, isValid) => {
          if (err) {
            return done(err)
          }
          if (!isValid) {
            console.log("ooo, please check you password!");
            return done(null, false)
          }
          console.log("congratinations, you are login!");
          return done(null, user)
        })
      })
    }
  ))

  passport.authenticationMiddleware = authenticationMiddleware
}

module.exports = initPassport
