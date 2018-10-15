let express = require('express');
let path = require('path');
let logger = require('morgan');
let cookieParser = require('cookie-parser');
let cors = require('cors');


let indexRouter = require('./routes/index');
let oauthRouter = require('./routes/oauth');
let usersRouter = require('./routes/users');

let app = express();

let corsOptions = {
    origin: true,
    methods: ['POST', 'GET'],
    credentials: false,
    maxAge: 3600
};

app.use(cors(corsOptions));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/api', oauthRouter);
app.use('/api/users', usersRouter);

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

//Uncaught Exception Handler
process.on('uncaughtException', function (err) {
    console.log('Fatal Error', err);
    console.log('Caught exception:', err.stack);
});

module.exports = app;
