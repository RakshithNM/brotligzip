const express = require('express');
const app = express();
const cors = require('cors');
const port = 8000;
const path = require('path');
const {
  readdir,
} = require("fs");
const CLIENT_URL = "https://brotli-gzip.netlify.app";
//const CLIENT_URL = "http://localhost:3000";

const corsOptions = {
  origin: CLIENT_URL,
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}

app.use(cors(corsOptions));
app.use(express.json());

const setupCompressionMethod = async (req, res, next) => {
  app.use(express.static(path.join(__dirname, 'public')))
  app.locals.compressionMethod = req.body.method;
  next();
};

app.get('*.js', (req, res, next) => {
  if(app.locals.compressionMethod === 'brotli') {
    req.url = `${req.url}.br`;
    res.set('Content-Encoding', 'br');
    res.set('Content-Type', 'application/javascript; charset=UTF-8');
  }
  else if(app.locals.compressionMethod === 'gzip') {
    req.url = `${req.url}.gz`;
    res.set('Content-Encoding', 'gzip');
    res.set('Content-Type', 'application/javascript; charset=UTF-8');
  }
  next();
});

app.post('/file', setupCompressionMethod, (req, res) => {
  if(req.body.method === null || req.body.method === void 0) {
    return res.status(400).send({
      error: true,
      method: 'not known'
    });
  }
  res.send({
    error: false,
    method: req.body.method
  });
});

app.get('/fileNames', (req, res) => {
  const directoryPath = path.join(__dirname, '/public');
  readdir(directoryPath, (err, files) => {
    if (err) {
      return console.log('Unable to scan directory: ' + err);
    }

    files = files.filter((name) => name.endsWith('.js'));

    res.send({
      error: false,
      files: files
    });
  });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
