const app = require('express')()
const server = require('http').Server(app)
const io = require('socket.io')(server)
const next = require('next')
const DeepSpeech = require('deepspeech');
const VAD = require('node-vad');
const port = parseInt(process.env.PORT, 10) || 3000
const dev = process.env.NODE_ENV !== 'production'
const nextApp = next({ dev })
const nextHandler = nextApp.getRequestHandler()
const { LoadClassifier } = require("./DeepSpeech/corpus/classifier")


let DEEPSPEECH_MODEL = __dirname + '/DeepSpeech/models/'; // path to deepspeech italian model directory
let SILENCE_THRESHOLD = 200; // how many milliseconds of inactivity before processing the audio

const ALPHA = 0.75 // 0.75
const BETA = 1.85 //1.85

const VAD_MODE = VAD.Mode.VERY_AGGRESSIVE;
const vad = new VAD(VAD_MODE);

const createModel = (modelDir) => {
	let modelPath = modelDir + 'output_graph.pbmm';
	let scorerPath = modelDir + 'scorer';
	let model = new DeepSpeech.Model(modelPath);
	model.enableExternalScorer(scorerPath);
	model.setScorerAlphaBeta(ALPHA, BETA)
	return model;
}

let italianModel = createModel(DEEPSPEECH_MODEL);
let modelStream;
let recordedChunks = 0;
let silenceStart = null;
let recordedAudioLength = 0;
let endTimeout = null;
let silenceBuffers = [];

const processAudioStream = (data, callback) => {
	vad.processAudio(data, 16000).then((res) => {
		switch (res) {
			case VAD.Event.ERROR:
				console.log("VAD ERROR");
				break;
			case VAD.Event.NOISE:
				console.log("VAD NOISE");
				break;
			case VAD.Event.SILENCE:
				processSilence(data, callback);
				break;
			case VAD.Event.VOICE:
				processVoice(data);
				break;
			default:
				console.log('default', res);

		}
	});

	// timeout after 1s of inactivity
	clearTimeout(endTimeout);
	endTimeout = setTimeout(function () {
		console.log('timeout');
		resetAudioStream();
	}, 1000);
}

const endAudioStream = (callback) => {
	console.log('[end]');
	let results = intermediateDecode();
	if (results) {
		if (callback) {
			callback(results);
		}
	}
}

const resetAudioStream = () => {
	clearTimeout(endTimeout);
	console.log('[reset]');
	intermediateDecode(); // ignore results
	recordedChunks = 0;
	silenceStart = null;
}

const processSilence = (data, callback) => {
	if (recordedChunks > 0) { // recording is on
		process.stdout.write('-'); // silence detected while recording

		feedAudioContent(data);

		if (silenceStart === null) {
			silenceStart = new Date().getTime();
		}
		else {
			let now = new Date().getTime();
			if (now - silenceStart > SILENCE_THRESHOLD) {
				silenceStart = null;
				console.log('[end]');
				let results = intermediateDecode();
				if (results) {
					if (callback) {
						callback(results);
					}
				}
			}
		}
	}
	else {
		process.stdout.write('.'); // silence detected while not recording
		bufferSilence(data);
	}
}

const bufferSilence = (data) => {
	// VAD has a tendency to cut the first bit of audio data from the start of a recording
	// so keep a buffer of that first bit of audio and in addBufferedSilence() reattach it to the beginning of the recording
	silenceBuffers.push(data);
	if (silenceBuffers.length >= 3) {
		silenceBuffers.shift();
	}
}

const addBufferedSilence = (data) => {
	let audioBuffer;
	if (silenceBuffers.length) {
		silenceBuffers.push(data);
		let length = 0;
		silenceBuffers.forEach(function (buf) {
			length += buf.length;
		});
		audioBuffer = Buffer.concat(silenceBuffers, length);
		silenceBuffers = [];
	}
	else audioBuffer = data;
	return audioBuffer;
}

const processVoice = (data) => {
	silenceStart = null;
	if (recordedChunks === 0) {
		console.log('');
		process.stdout.write('[start]'); // recording started
	}
	else {
		process.stdout.write('='); // still recording
	}
	recordedChunks++;

	data = addBufferedSilence(data);
	feedAudioContent(data);
}

const createStream = () => {
	modelStream = italianModel.createStream();
	recordedChunks = 0;
	recordedAudioLength = 0;
}

const finishStream = () => {
	if (modelStream) {
		let start = new Date();
		let text = modelStream.finishStream();
		if (text) {
			console.log('');
			console.log('Recognized Text:', text);
			let recogTime = new Date().getTime() - start.getTime();
			let tmp = {
				text,
				recogTime,
				audioLength: Math.round(recordedAudioLength)
			}
			return {
				text,
				recogTime,
				audioLength: Math.round(recordedAudioLength)
			};
		}
	}
	silenceBuffers = [];
	modelStream = null;
}

const intermediateDecode = () => {
	let results = finishStream();
	createStream();
	return results;
}

const feedAudioContent = (chunk) => {
	recordedAudioLength += (chunk.length / 2) * (1 / 16000) * 1000;
	modelStream.feedAudioContent(chunk);
}


io.set('origins', '*:*');

io.on('connection', function (socket) {
	console.log('client connected');

	socket.once('disconnect', () => {
		console.log('client disconnected');
	});

	createStream();

	socket.on('stream-data', async function (data) {
		let { audio, useClassifier } = data
		processAudioStream(audio, async (results) => {
			socket.emit('recognize', { isstemp: true, results });
			let x = await LoadClassifier(results.text, results, useClassifier)
			socket.emit('recognize', x);
		});
	});

	socket.on('stream-end', async function () {
		let { audio, useClassifier } = data
		endAudioStream(async (results) => {
			let x = await LoadClassifier(results.text, results, useClassifier)
			socket.emit('recognize', x);
		});
	});

	socket.on('stream-reset', function () {
		resetAudioStream();
	});
});

nextApp.prepare().then(() => {

	app.get('*', (req, res) => {
		return nextHandler(req, res)
	})

	server.listen(port, err => {
		if (err) throw err
		console.log(`> Ready on http://localhost:${port}`)
	})
})