import React from 'react'
import Head from 'next/head'
import { ReactMic } from 'react-mic';
import absoluteUrl from 'next-absolute-url'
import io from 'socket.io-client';
const DOWNSAMPLING_WORKER = './downsampling_worker.js';
import TextTransition, { presets } from "react-text-transition";
import Progress from './progress'

class Mic extends React.Component {

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
      progress : 0
    }
  }

  componentDidMount() {
    document.addEventListener("keydown", this.onKeyDownHandler);
    let recognitionCount = 0;
    this.socket = io.connect('http://localhost:3000', {});
    this.socket.on('connect', () => {
      console.log('socket connected');
      this.setState({ connected: true });
    });

    this.socket.on('disconnect', () => {
      console.log('socket disconnected');
      this.setState({ connected: false });
      this.stopRecording();
    });

    this.socket.on('recognize', (results) => {
      console.log('recognized:', results);
      const { recognitionOutput } = this.state;
      results.id = recognitionCount++;
      recognitionOutput.unshift(results);
      this.setState({ recognitionOutput });
    });
  }

  renderTime() {
    return (<span>
      {(Math.round(this.state.recordingTime / 100) / 10).toFixed(1)}s
    </span>);
  }

  renderRecognitionOutput() {
    let r = this.state.recognitionOutput[0]
    if(r){
      console.log(r)
      return (
        <div className="row flexbox-center fullh">
          <div className="col-md-12">
          <TextTransition
            inline={true}
            delay={300}
            className={"big"}
            text={r.text}
            direction={"up"}
            springConfig={presets.gentle}
            spring={presets.gentle}
  
          />
          <br/>
          <TextTransition
            inline={true}
            delay={300}
            className={"big2"}
            text={r.guess}
            direction={"up"}
            springConfig={presets.gentle}
            spring={presets.gentle}
  
          />
          </div>

        </div>)
    }else{
      return <></>
    }

  }

  createAudioProcessor(audioContext, audioSource) {
    let processor = audioContext.createScriptProcessor(4096, 1, 1);

    const sampleRate = audioSource.context.sampleRate;

    let downsampler = new Worker(DOWNSAMPLING_WORKER);
    downsampler.postMessage({ command: "init", inputSampleRate: sampleRate });
    downsampler.onmessage = (e) => {
      if (this.socket.connected) {
        this.socket.emit('stream-data', e.data.buffer);
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
      }, 3000);


      this.setState({
        recording: true,
        recordingStart: new Date().getTime(),
        recordingTime: 0,
        progress : 0
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
    }
    else {
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
        progress : 0,
        recognitionOutput: []
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
      console.log(recording)
      if (recording) {      

        this.stopRecording()
      } else {

        this.startRecording()

      }
    }
  }


  render() {
    let { record,recording } = this.state
    return (
      <div>
        <h1>Press space for   {recording ? "stop" : "start"} recording</h1>
        {this.renderRecognitionOutput()}
       
      </div>
    )
  }
}


export default Mic
