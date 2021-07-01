var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const WebSocket = require('ws');
const os = require('os');
const crypto = require('crypto');
const wss = new WebSocket.Server({ port: 3000 });
const fs = require('fs-extra');

var indexRouter = require('./routes/index');
var welcomeRouter = require('./routes/welcome');
var thanksRouter = require('./routes/thanks');
var filename = require('./public/javascripts/filename')();
var uploadToCollection = require('./public/javascripts/mongoConnect');
var uploadFile = require('./public/javascripts/uploadFile');

var app = express();

var mac, o;

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use((req, res, next) => {
  // Giving user an Id
  let values = os.networkInterfaces();
  for (const key in values) {
    mac = values[key][0]['mac'];
  }
  mac = crypto.createHash('sha256').update(mac).digest('base64');
  next();
});

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', welcomeRouter);
app.use('/mainPage', indexRouter);
app.use('/thanks', thanksRouter);

wss.on('connection', (ws, req) => {
  ws.on('message', (message) => {
    console.log(typeof message);
    if (typeof message == 'object') {
      fs.writeFile(
        './public/audios/' + filename + '.wav',
        Buffer.from(new Uint8Array(message), function (err) {
          if (err) throw err;
          console.log('Upload success');
        })
      ).then(() => {
        uploadFile(filename + '.wav');

        uploadToCollection(o);
        //triggers onmessage in client side sending event.data as "uploaded" string
        ws.send('uploaded');
      });
    } else {
      var val = JSON.parse(message);
      o = {
        userId: mac,
        sentenceId: val.sentence_id,
        fileName: filename,
        gender: val.gender,
      };
    }
  });
});

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

app.listen(process.env.PORT || 8000, (err, done) => {
  if (err) {
    console.log('Error');
  } else {
    console.log('Running');
  }
});
