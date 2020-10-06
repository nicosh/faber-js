import React from 'react'
import Head from 'next/head'
import { ReactMic } from 'react-mic';
import absoluteUrl from 'next-absolute-url'

class Mic extends React.Component {
  
    constructor(props) {
        super(props)
        this.state = {
            record: false,
            timer: null

        }
    }

    componentDidMount(){
      document.addEventListener("keydown", this.onKeyDownHandler);
    }
    
    finishTimer = async () =>{
      let {timer} = this.state
      clearTimeout(timer);
      this.setState({record : false})
    }



    onKeyDownHandler = e => {
      let {record,timer} = this.state
      timer = setTimeout(() =>  this.finishTimer(), 3000)

      if(e.keyCode == 32){
        this.setState({record : !record})
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
    
      onStop = async (record)=> {
        //console.log('recordedBlob is: ', recordedBlob);
        console.log(record)
        const { origin } = absoluteUrl(this.props.req)
        const apiURL = `${origin}/api/ping`
        const data = new FormData();
        data.append('file', record.blob)

        
        
        let datax = await fetch(apiURL, {
          method : "POST",
          body: data,
        })
        
        
      }

    render() {
      let {record} = this.state
        return (
            <div>      
                <ReactMic
                    record={this.state.record}
                    visualSetting="sinewave"
                    mimeType="audio/wav"    
                    className="sound-wave"
                    onStop={this.onStop}
                    onData={this.onData}
                    strokeColor="#FFF"
                    backgroundColor="#00000"
                    sampleRate={16000}      
                    channelCount={1}    
                    bitRate={256000} 

                    />
            </div>
        )
    }
}


export default Mic
