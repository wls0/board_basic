var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const methodOverride = require('method-override');
const passport = require('passport');
const session = require('express-session');
const flash = require('connect-flash');
const MySQLStore = require('express-mysql-session')(session);
var compression = require('compression')
var models = require('./models');
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var loginRouter = require('./routes/login');
var authRouter = require('./routes/auth');
var translatorRouter = require('./routes/translator');

models.sequelize.sync().then(() => {
  console.log(" DB 연결 성공");
}).catch(err => {
  console.log("연결 실패");
  console.log(err);
});

var app = express();

var options = {
  host: 'localhost',
  user: 'root',
  password: 'abcd1',
  database: 'board',
  clearExpired: true,
  checkExpirationInterval: 900000,
  expiration: 24000 * 60 * 60,
};

app.use(session({
  key: 'sid',
  secret: 'asdasdzxc',
  resave: false,
  saveUninitialized: true,
  store: new MySQLStore(options)
}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function (user, done) {
  console.log('serializeUser', user.idUser)
  done(null, user.name);
});

passport.deserializeUser(function (user, done) {
  console.log('deserializeUser', user);
  // models.user.findAll(id, function (err, user) {
  done(null, user);
  // });
});

app.use(compression());
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/public', express.static('public'));
app.use(methodOverride('_method'));
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/login', loginRouter);
app.use('/auth', authRouter);
app.use('/translator', translatorRouter);


// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
