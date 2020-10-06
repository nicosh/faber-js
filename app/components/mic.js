import React from 'react'
import Head from 'next/head'
import { ReactMic } from 'react-mic';

class Mic extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            record: false
        }
    }

    startRecording = () => {
        this.setState({ record: true });
      }
    
      stopRecording = () => {
        this.setState({ record: false });
      }
    
      onData(recordedBlob) {
        console.log('chunk of real-time data is: ', recordedBlob);
      }
    
      onStop(recordedBlob) {
        console.log('recordedBlob is: ', recordedBlob);
      }

    render() {
        return (
            <div>
                <ReactMic
                    record={this.state.record}
                    className="sound-wave"
                    onStop={this.onStop}
                    onData={this.onData}
                    strokeColor="#000000"/>
                <button onClick={this.startRecording} type="button">Start</button>
                <button onClick={this.stopRecording} type="button">Stop</button>
            </div>
        )
    }
}


export default Mic
