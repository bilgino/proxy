// *********** DEPENDENCIES *************** //

const url = require('url');
const path = require('path');
const http = require('http');
const https = require('https');
const express = require('express');
const cors = require('cors');
const favicon = require('serve-favicon');
const bodyParser = require('body-parser');
const config = require('./config.js');
const app = express();

// *********** SECURITY SETTINGS ********** //

app.disable('x-powered-by');

// *********** ENV VARIABLES ************** //

app.set('env', process.env.NODE_ENV || config.server.env);
app.set('port', process.env.PORT || config.server.port);
app.set('apiBaseUrl', process.env.API_BASE_URL || config.apiBaseUrl);

// *********** CORS OPTIONS *************** //

const whitelist = config.cors.whitelist;

const corsOptions = (req, callback) => {
  let corsOptions;
  if(whitelist.indexOf(req.header('Origin')) !== -1){
     corsOptions = { origin: true };
  }else{
     corsOptions = { origin: false };
  }
  callback(null, corsOptions);
};

/*
{
  origin: ["http://localhost:3001"],
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
  preflightContinue: false,
}
*/

// *********** MONITORING ***************** //

// Middleware for logging incoming requests to the terminal.
if (app.get('env') === 'development') {
  app.use((req, res, next) => {
     console.log(`REQUESTED: ${req.method} TO ${req.url}`);
     next();
  });
}

// *********** UTIL MIDDLEWARE ************ //

// The server side decides from which origin it's service could be consumed.
// Default policy is Same-origin and only the server side can override this policy be adding the CORS header.
app.use(cors(corsOptions));
// Allow OPTIONS on all resources. Due to security concerns, complex requests require an preflight HTTP OPTIONS.
// The Owner-domain can not even know what is allowed on the remote target API, thus a preflight is mandatory.
app.options('*', cors());
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true, limit: 10000}));
app.use('/css', express.static(path.join(__dirname, '/node_modules/bootstrap/dist/css')));
app.use('/js', express.static(path.join(__dirname, '/node_modules/bootstrap/dist/js')));
app.use('/js', express.static(path.join(__dirname, '/node_modules/jquery/dist')));
app.use(express.static(path.join(__dirname, 'public')));

// *********** START SERVER *************** //

app.listen(app.get('port'), () => {
  console.log(`CORS is enabled on the web server running at ${config.server.host}${app.get('port')}`);
});

// *********** ROUTES ********************* //

app.get('/', (req, res) => {
  res.sendFile('index.html', { root: __dirname });
});

app.post('/update', (req, res) => {
    
  config.req.headers['x-consumer-name'] = req.body.name || '';
  config.req.headers['x-broker-rest-version'] = req.body.version || '';
  config.req.headers['x-correlation-id'] = req.body.correlation || '';
  config.req.headers['Cookie'] = req.body.cookie || '';
  res.statusCode = 200;
  res.json({ message: 'Session was successfully updated!' });
});

if (app.get('env') === 'development') {
  app.get('/config', (req, res) => {
     res.json({config : config.req });
  });
  app.delete('/delete', (req, res) => {
     res.json({message: 'HTTP DELETE: Preflight is expected!'})
  });
}

app.get('/ping', (req, res) => {
  res.send('pong');
});

app.use(app.get('apiBaseUrl'), (req, res) => {
 
  // Apply incoming request url path to the in-memory config object.
   config.req.path = new url.URL(`https://${config.req.hostname}${req.url}`).pathname;
  config.req.method = req.method;

  // Send request to the remote target server and pipe the response back.
  const proxyRequest = https.request(config.req, (proxyResponse) => {
    
     if(proxyResponse.statusCode === 302){
        res.statusCode = 401;
        return res.json({ message: 'Service not available! Please validate session values!' });
     }
    
     proxyResponse.on('data', (data) => {
        res.write(data, 'binary');
     });
    
     proxyResponse.on('end', () => {
        res.end();
     });
    
     // Adopt status code and response header from the target server.  
     res.writeHead(proxyResponse.statusCode, proxyResponse.headers);
  });

  proxyRequest.on('error', (err) => {
    console.error(err);
    new Error('Error: Not able connecting to target server');
  });
 
  proxyRequest.end();
 
  req.on('end',() => {
     proxyRequest.end();
  });
});

// *********** ERROR HANDLING ************* //

// Middleware for 404 status code handling.
app.use((req, res) => {
  res.statusCode = 404;
  res.statusReason = http.STATUS_CODES[404];
  res.send('Resource not found!');
});

// Middleware for application wide error handling.
app.use((err, req, res, next) => {
   console.error(err.stack);
  res.statusReason = http.STATUS_CODES[500];
   res.statusCode = 500;
  res.send('Internal Server Error!');
});

