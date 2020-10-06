const DeepSpeech = require('deepspeech');
const Fs = require('fs');
const Sox = require('sox-stream');
const MemoryStream = require('memory-stream');
const Duplex = require('stream').Duplex;
const Wav = require('node-wav');
const N_FEATURES = 26;
const N_CONTEXT = 9;
const ALPHABET = './models/alphabet.txt'
const BEAM_WIDTH = 500;
const MODEL_PREFIX = "transfer_model_"

const babelfish = (file, usetransfer) => {
	const pathprefix = usetransfer ? MODEL_PREFIX : ""
	let modelPath = `./models/${pathprefix}output_graph.pbmm`;
	const model = new DeepSpeech.Model(
		modelPath,
		N_FEATURES,
		N_CONTEXT,
		ALPHABET,
		BEAM_WIDTH
	);

	let desiredSampleRate = model.sampleRate();
	let scorerPath = `./models/${pathprefix}scorer`;

	model.enableExternalScorer(scorerPath);
	let audioFile = file;
	if (!Fs.existsSync(audioFile)) {
		console.log('file missing:', audioFile);
		process.exit();
	}

	const buffer = Fs.readFileSync(audioFile);
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

		const audioLength = (audioBuffer.length / 2) * (1 / desiredSampleRate);
		console.log('audio length', audioLength);

		let result = model.stt(audioBuffer);

		console.log('result:', result);
	})
}

babelfish("./models/test3.wav", false)