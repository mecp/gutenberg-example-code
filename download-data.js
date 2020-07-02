const wget = require('wget-improved');
const decompress = require('decompress');
const decompressTarbz = require('decompress-tarbz2');
const logUpdate = require('log-update');

const src = 'http://www.gutenberg.org/cache/epub/feeds/rdf-files.tar.bz2';
const downloadedTarName = 'gutenberg-data.tar.bz2';
const extractedDirName = 'gutenberg-data';

let download = wget.download(src, downloadedTarName, {});

download.on('error', (err) => {
  console.log(err);
  process.exit(1);
});

download.on('start', (fileSize) => {
  console.log(`Total size: ${fileSize} bytes`);
});

download.on('end', () => {
  logUpdate.done();
  logUpdate(`Downloaded ${downloadedTarName}`);

  logUpdate(`Now extracting to ${extractedDirName}`);
  decompress(downloadedTarName, extractedDirName, {
    plugins: [decompressTarbz()],
    strip: 1
  })
    .then(() => {
      logUpdate(`Successfully extracted to ${extractedDirName}`);
      process.exit(0);
    })
    .catch((err) => {
      console.log(err);
      process.exit(1);
    });
});

download.on('progress', (progress) => {
  logUpdate(`Downloading ${Number(progress * 100).toFixed(0)} %`);
});
