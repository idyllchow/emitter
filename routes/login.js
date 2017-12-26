const passport = require('passport')

function login (app) {
  console.log("=======initUser=======");
  app.get('/', renderWelcome)
  // app.get('/index', passport.authenticationMiddleware(), renderProfile)
  app.post('/login', passport.authenticate('local', {
    successRedirect: '/index',
    failureRedirect: '/'
  }))
}

function renderWelcome (req, res) {
  res.render('/index')
}

function renderProfile (req, res) {
  res.render('/index')
}

module.exports = login
