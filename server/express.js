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

obtain(obtains, (express, bodyParser, fs, fileUpload, session, https, http, path)=> {
  exports.setup = (root)=> {
    muse.server.sessionParser = session({
      secret: 'secret',
      resave: true,
      saveUninitialized: true,
      cookie: { httpOnly: true, secure: false },
    });

    muse.server.base = express();
    muse.server.router = express.Router();

    muse.server.router.use(bodyParser.json());
    muse.server.router.use(fileUpload());

    muse.server.base.use(window.expressServer.sessionParser);

    muse.server.base.set('view engine', 'pug');

    //muse.server.base.use('', express.static(path.join(root, '../../../client')));
    //muse.server.base.use('/common', express.static(path.join(root, '../../../common')));

    muse.server.base.use(muse.server.router);

    var httpApp = muse.server.base;

    if (muse.useSSL) {
      const options = {
        cert: fs.readFileSync(`${global.tld}/sslcert/fullchain.pem`),
        key: fs.readFileSync(`${global.tld}/sslcert/privkey.pem`),
      };

      muse.server.https = https.createServer(options, muse.server.base).listen(443);

      httpApp = function (req, res) {
        res.writeHead(307, { Location: 'https://' + req.headers['host'] + req.url });
        res.end();
      };

    } else muse.server.https = {};

    muse.server.http = http.createServer(httpApp).listen(80);

    muse.server.express = express;
  };

  exports.base = muse.server.base;
  exports.router = muse.server.router;
  exports.express = muse.server.express;
  exports.http = muse.server.http;
  exports.https = muse.server.https;
  exports.sessionParser = muse.server.sessionParser;

});
