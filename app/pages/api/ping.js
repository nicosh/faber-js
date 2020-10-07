const fs = require('fs');
const path = require('path');
var Busboy = require('busboy');
const os = require('os')
const babelfish = require("../../DeepSpeech/index.js")
const getFileHeaders = require('wav-headers');


export default (req, res) => {
  var busboy = new Busboy({ headers: req.headers });
  busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
    var saveTo = path.join(os.tmpDir(), path.basename(fieldname));
    let chunks = [];
    let fileBuffer;
    file.once('error', (err) => {
      console.error(err);
    });

    file.once('end', () => {
      fileBuffer = Buffer.concat(chunks)
      var options = {
        channels: 1,
        sampleRate: 16000,
        bitDepth: 16,
        dataLength: Buffer.byteLength(fileBuffer)
      };
      var headersBuffer = getFileHeaders(options);
      var fullBuffer = Buffer.concat([ headersBuffer, fileBuffer ]);
      babelfish(false, false,fullBuffer)
    }); 

    file.on('data', (chunk) => {
      chunks.push(chunk); // push data chunk to array
    })
  });
  busboy.on('finish', function() {
    res.writeHead(200, { 'Connection': 'close' });
    res.end("That's all folks!");
  });
  return req.pipe(busboy);

}


export const config = {
    api: {
      bodyParser: false,
    },
  }


