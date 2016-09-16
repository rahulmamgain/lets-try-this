/**
 * Server Statup File
 */

var app = require('express')();
var server = require('http').Server(app);
var bodyParser      = require('body-parser');
var requestHandler = require('./handlers/request-handler');
var dbHandler = require('./handlers/dbHandler');
var config = require('./config/config');

var loginAndRegister = require('./routers/login_register.js');
var dataRouter = require('./routers/data.js');


var compression = require('compression');
var moment = require('moment');
var winston = require('winston');
var expressValidator = require('express-validator');
var PrepareEnvironment = require('./environment');
var cors = require('cors');
var path = require('path');
var filePath = path.join(__dirname, '../reports/');
var logger = new (winston.Logger)({
    level: config.logLevel,
    transports: [
        new (require('winston-daily-rotate-file'))({ 
            filename: filePath + 'tricon_pub_log',
            datePattern : '.yyyy-MM-dd',
            json : config.logJSONFormat
        })
    ]
});

var dbSettings = config.mongodb;
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());
app.use(expressValidator());
app.use(compression());

app.all('*', (req, res, next) => {
    req.logger = logger;
    next(); 
});

server.listen(443, function() {
    console.log('Server Started...'); // eslint-disable-line no-console
    dbHandler.connect(dbSettings, (err) => {
        if (err) {
            throw new Error(err.message);
        }
        else {
            console.log('Connected to the Database...'); // eslint-disable-line no-console
            PrepareEnvironment.prepare(config, logger);
        }
    });
});


app.use('/api/auth', loginAndRegister);
app.use('/api/data', dataRouter);

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/index.html');
});

app.get('/test', requestHandler.test);


process.on('uncaughtException', function(err) {
    console.log('uncaughtException exception: ' + err); // eslint-disable-line no-console
});

module.exports = app;
