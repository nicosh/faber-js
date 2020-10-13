const DeepSpeech = require('deepspeech');
const Fs = require('fs');
const Sox = require('sox-stream');
const MemoryStream = require('memory-stream');
const Duplex = require('stream').Duplex;
const Wav = require('node-wav');
const MODEL_PREFIX = "transfer_model_"
const ALPHA = 0.25 // 0.75
const BETA = 1.85 //1.85
const babelfish = async (file, usetransfer) => {
	var path = require("path");
	const pathprefix = usetransfer ? MODEL_PREFIX : ""
	let modelPath = path.resolve(`./models/${pathprefix}output_graph.pbmm`);
	const model = new DeepSpeech.Model(modelPath);
	let desiredSampleRate = model.sampleRate();
	let scorerPath = path.resolve(`./models/${pathprefix}scorer`);
	let audioFile = path.resolve(file);
	model.enableExternalScorer(scorerPath);
	model.setScorerAlphaBeta(ALPHA, BETA)


	
	if (!Fs.existsSync(audioFile)) {
		console.log('file missing:', audioFile);
		process.exit();
	}

	const buffer = Fs.readFileSync(audioFile)
	const result = Wav.decode(buffer);

	if (result.sampleRate < desiredSampleRate) {
		console.error('Warning: original sample rate (' + result.sampleRate + ') is lower than ' + desiredSampleRate + 'Hz. Up-sampling might produce erratic speech recognition.');
	}

	function bufferToStream(buffer) {
		let stream = new Duplex();
		stream.push(buffer);
		stream.push(null);
		return stream;
	}

	let audioStream = new MemoryStream();
	bufferToStream(buffer).
		pipe(Sox({
			global: {
				'no-dither': true,
			},
			output: {
				bits: 16,
				rate: desiredSampleRate,
				channels: 1,
				encoding: 'signed-integer',
				endian: 'little',
				compression: 0.0,
				type: 'raw'
			}
		})).
		pipe(audioStream);

	audioStream.on('finish', () => {
		let audioBuffer = audioStream.toBuffer();
		let result = model.stt(audioBuffer);
		console.log('speech to text:', result);
	})
}
exports.babelfish = babelfish
