if (!window) var window = global;

var obtains = [
  'express',
  'body-parser',
  'fs',
  'express-fileupload',
  'express-session',
  'https',
  'http',
  'path',
];

if (!window.muse.server) window.muse.server = {
  base: null,
  router: null,
  http: null,
  https: null,
  sessionParser: null,
  express: null,
};

var server = window.muse.server;

obtain(obtains, (express, bodyParser, fs, fileUpload, session, https, http, path)=> {
  if (!server.base) {
    server.sessionParser = session({
      secret: 'secret',
      resave: true,
      saveUninitialized: true,
      cookie: { httpOnly: true, secure: false },
    });

    server.base = express();
    server.router = express.Router();

    server.router.use(bodyParser.json());
    server.router.use(fileUpload());

    server.base.use(server.sessionParser);

    server.base.set('view engine', 'pug');

    //muse.server.base.use('', express.static(path.join(root, '../../../client')));
    //muse.server.base.use('/common', express.static(path.join(root, '../../../common')));

    server.base.use(server.router);

    var httpApp = server.base;

    if (muse.useSSL) {
      const options = {
        cert: fs.readFileSync(`${global.tld}/sslcert/fullchain.pem`),
        key: fs.readFileSync(`${global.tld}/sslcert/privkey.pem`),
      };

      server.https = https.createServer(options, server.base).listen(443);

      httpApp = function (req, res) {
        res.writeHead(307, { Location: 'https://' + req.headers['host'] + req.url });
        res.end();
      };

    } else server.https = {};

    server.http = http.createServer(httpApp).listen(80);

    server.express = express;
  };

  exports.base = server.base;
  exports.router = server.router;
  exports.express = server.express;
  exports.http = server.http;
  exports.https = server.https;
  exports.sessionParser = server.sessionParser;

});
