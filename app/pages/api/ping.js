var multiparty = require('multiparty');
let http = require('http')
let util = require('util')
const fs = require('fs');
const path = require('path');
var Busboy = require('busboy');
const os = require('os')
const babelfish = require("../../DeepSpeech/index.js")
const WaveFile = require('wavefile').WaveFile;
var getFileHeaders = require('wav-headers');

/*
export default (req, res) => {
    let form = new multiparty.Form({ renameFile:(name,file)=>"asd.wav",'encoding':'binary',uploadDir : "./public"});
    form.parse(req, (err, fields, files) => {
        console.log(fields, files,req.files)
        res.writeHead(200, { 'content-type': 'text/plain' });
        res.write('received upload: /n/n');
        res.end(util.inspect({ fields: fields, files: files }));
    });
}

*/

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
      var options = {
        channels: 1,
        sampleRate: 44100,
        bitDepth: 16,
      };
     const  wav = new WaveFile();

    var headersBuffer = getFileHeaders(options);
      fileBuffer = Buffer.concat(chunks)
      var fullBuffer = Buffer.concat([ headersBuffer, fileBuffer ]);

      babelfish("./DeepSpeech/models/test.wav", false,fullBuffer)

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


