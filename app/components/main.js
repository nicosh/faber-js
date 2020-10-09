import React from 'react'
import Head from 'next/head'
import { ReactMic } from 'react-mic';
import absoluteUrl from 'next-absolute-url'
import io from 'socket.io-client';
const DOWNSAMPLING_WORKER = './downsampling_worker.js';
import TextTransition, { presets } from "react-text-transition";
import Progress from './progress'
import Footer from './footer'

class Main extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      record: false,
      timer: null,
      connected: false,
      recording: false,
      recordingStart: 0,
      recordingTime: 0,
      recognitionOutput: [],
      progress: 0,
      useClassifier: false,
      showRecognizedText: true,
      debug: false,
      tempresults: {},
      StopRecordingOnRecognition : true
    }
  }

  componentDidMount() {
    document.addEventListener("keydown", this.onKeyDownHandler);
    let recognitionCount = 0;
    this.socket = io.connect();
    this.socket.on('connect', () => {
      console.log('socket connected');
      this.setState({ connected: true });
    });

    this.socket.on('disconnect', () => {
      console.log('socket disconnected');
      this.setState({ connected: false, tempresults: {} });
      this.stopRecording();
    });

    this.socket.on('recognize', (results) => {
      if (results.isstemp) {
        results.results.guess = ""
        this.state.StopRecordingOnRecognition ? this.stopRecording() : false
        this.setState({ recognitionOutput: [results.results] })
      } else {
        console.log('recognized:', results);
        const { recognitionOutput } = this.state;
        results.id = recognitionCount++;
        recognitionOutput.unshift(results);
        this.state.StopRecordingOnRecognition ? this.stopRecording() : false
        this.setState({ recognitionOutput });
      }
    });
  }

  swichState = (key, value) => {
    let tmp = this.state
    tmp[key] = value
    this.setState(tmp)
  }

  renderTime() {
    return (<span>
      {(Math.round(this.state.recordingTime / 100) / 10).toFixed(1)}s
    </span>);
  }

  renderRecognitionOutput() {
    let { showRecognizedText } = this.state
    let r = this.state.recognitionOutput[0]

    if (r) {

      return (
        <div className="row flexbox-center fullh">
          <div className="col-md-12">
            {showRecognizedText &&
              <TextTransition
                inline={true}
                delay={300}
                className={"big"}
                text={r.text}
                direction={"up"}
                springConfig={presets.gentle}
                spring={presets.gentle}

              />
            }
            <br />
            {r.guess == "" && 
              <TextTransition
              inline={true}
              delay={300}
              className={"big2"}
              text={<div className="loading text-center"></div>}
              direction={"up"}
              springConfig={presets.gentle}
              spring={presets.gentle}

            />
          }
            {r.guess !== "" && 
              <TextTransition
              inline={true}
              delay={300}
              className={"big2"}
              text={r.guess}
              direction={"up"}
              springConfig={presets.gentle}
              spring={presets.gentle}
            />
            }
          </div>

        </div>)
    } else {
      return <></>
    }

  }

  createAudioProcessor(audioContext, audioSource) {
    let { useClassifier,StopRecordingOnRecognition } = this.state
    let processor = audioContext.createScriptProcessor(4096, 1, 1);
    const sampleRate = audioSource.context.sampleRate;
    let downsampler = new Worker(DOWNSAMPLING_WORKER);
    downsampler.postMessage({ command: "init", inputSampleRate: sampleRate });
    downsampler.onmessage = (e) => {
      if (this.socket.connected) {
        this.socket.emit('stream-data', { audio: e.data.buffer, useClassifier });
      }
    };

    processor.onaudioprocess = (event) => {
      var data = event.inputBuffer.getChannelData(0);
      downsampler.postMessage({ command: "process", inputFrame: data });
    };

    processor.shutdown = () => {
      processor.disconnect();
      this.onaudioprocess = null;
    };

    processor.connect(audioContext.destination);
    return processor;
  }

  startRecording = e => {
    if (!this.state.recording) {
      this.recordingInterval = setInterval(() => {
        let recordingTime = new Date().getTime() - this.state.recordingStart;
        this.setState({ recordingTime });
      }, 100);


      this.setState({
        recording: true,
        recordingStart: new Date().getTime(),
        recordingTime: 0,
        recognitionOutput: [],
        progress: 0
      }, () => {
        this.startMicrophone();
      });
    }
  };

  startMicrophone() {
    this.audioContext = new AudioContext();
    const success = (stream) => {
      console.log('started recording');
      this.mediaStream = stream;
      this.mediaStreamSource = this.audioContext.createMediaStreamSource(stream);
      this.processor = this.createAudioProcessor(this.audioContext, this.mediaStreamSource);
      this.mediaStreamSource.connect(this.processor);
    };

    const fail = (e) => {
      console.error('recording failure', e);
    };

    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({
        video: false,
        audio: true
      })
        .then(success)
        .catch(fail);
    } else {
      navigator.getUserMedia({
        video: false,
        audio: true
      }, success, fail);
    }
  }

  stopRecording = e => {
    let { timer } = this.state

    if (this.state.recording) {
      if (this.socket.connected) {
        this.socket.emit('stream-reset');
      }
      clearInterval(this.recordingInterval);

      this.setState({
        recording: false,
        progress: 0
      }, () => {
        this.stopMicrophone();
      });
    }
  };

  stopMicrophone() {
    if (this.mediaStream) {
      this.mediaStream.getTracks()[0].stop();
    }
    if (this.mediaStreamSource) {
      this.mediaStreamSource.disconnect();
    }
    if (this.processor) {
      this.processor.shutdown();
    }
    if (this.audioContext) {
      this.audioContext.close();
    }
  }


  finishTimer = async () => {
    let { timer } = this.state
    this.stopRecording()
  }

  onKeyDownHandler = e => {
    let { timer, recording } = this.state
    if (e.keyCode == 32) {
      if (recording) {
        this.stopRecording()
      } else {
        this.startRecording()

      }
    }
  }

  render() {
    let { recordingTime, record, recording, useClassifier, showRecognizedText, debug, tempresults, recognitionOutput,StopRecordingOnRecognition } = this.state
    return (
      <div>
        {debug &&
          <div className="debugwindow">
            show RecognizedText : {showRecognizedText ? "yes" : "no"} <br />
            use Classifier : {useClassifier ? "yes" : "no"} <br />
            use Levenshtein Distance : {useClassifier ? "no" : "yes"} <br />
            recordingTime : {(Math.round(recordingTime / 100) / 10).toFixed(1)}s
            <pre>{JSON.stringify(recognitionOutput[0], null, 2)}</pre>
          </div>
        }
        <h1 className={`mt-4  dark ${recording ? "gradient-border" : ""}`}>Press space and   {recording ? "stop" : "start"} <span className={recording ? "mmh" : ""}>recording</span> </h1>
        {recording &&
          <div className="flexbox-center animated-container">
            <div className="container-c">
              <svg className="" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 340 340">
                <circle cx="170" cy="170" r="160" stroke="#fff" />
                <circle cx="170" cy="170" r="135" stroke="#fff" />
                <circle cx="170" cy="170" r="110" stroke="#fff" />
                <circle cx="170" cy="170" r="85" stroke="#fff" />
              </svg>
            </div>
          </div>
        }
        {this.renderRecognitionOutput()}
        <Footer 
        StopRecordingOnRecognition={StopRecordingOnRecognition}
        debug={debug} 
        showRecognizedText={showRecognizedText} 
        swichState={this.swichState} 
        useClassifier={useClassifier} 
        stopRecording={this.stopRecording} />
      </div>
    )
  }
}

export default Main
