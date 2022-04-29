const path = require('path');
const {
  createReadStream,
  createWriteStream,
  readdir,
  readFileSync,
  writeFileSync
} = require("fs");
const directoryPath = path.join(__dirname, '../public');
const compress = require('brotli/compress');
const { createGzip } = require("zlib");

const brotliSettings = {
  extension: 'br',
  skipLarger: true,
  mode: 1, // 0 = generic, 1 = text, 2 = font (WOFF2)
  quality: 10, // 0 - 11,
  lgwin: 12 // default
};

readdir(directoryPath, function (err, files) {
  if (err) {
    return console.log('Unable to scan directory: ' + err);
  }

  files.forEach(function (file) {
    const filePath = `${directoryPath}/${file}`;
    if(filePath.endsWith('.js')) {
      console.log(`compressing ${filePath}`);
      const result = compress(readFileSync(filePath), brotliSettings);
      writeFileSync(`${filePath}.br`, result);

      console.log(`finished brotli compression and wrote ${filePath}.br to ${directoryPath}`);

      const stream = createReadStream(filePath);
      stream
        .pipe(createGzip())
        .pipe(createWriteStream(`${filePath}.gz`))
        .on("finish", () => {
          console.log(`finished gzip compression and wrote ${filePath}.gz to ${directoryPath}`);
        });
    }
  });
});
