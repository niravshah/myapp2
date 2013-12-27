
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes/main');
var http = require('http');
var path = require('path');
var upload = require('jquery-file-upload-middleware');

var app = express();


upload.configure({
    uploadDir: '/home/refrew/myapp2/public/images/rewards/',
    uploadUrl:'/images/rewards',
    imageVersions: {
        thumbnail: {
            width: 80,
            height: 80
        }
    }
});

// all environments

app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine','ejs');

app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.cookieParser('your secret here'));
app.use(express.session());
app.use(app.router);
app.use(require('stylus').middleware(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));

var ejs = require('ejs');
ejs.open = "{{";
ejs.close="}}";
app.engine('html', ejs.renderFile);

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/cc', routes.cc);
app.get('/reward', routes.reward);
app.get('/recruit', routes.recruit);
app.get('/jobs/:jobid', routes.job);

app.use('/upload', function (req, res, next) {
            console.log('Upload 2', req.query.rid);
            upload.fileHandler({
                uploadDir: function () {
                    return '/home/refrew/myapp2/public/images/rewards/' + req.query.rid;
                },
                uploadUrl: function () {
                    return '/images/rewards/' + req.query.rid;
                }
            })(req, res, next);
});

//app.use('/upload', upload.fileHandler());


http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
