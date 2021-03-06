import React from 'react'
import { Modal, Button, Switch } from 'antd';

class Index extends React.Component {
    state = { visible: false,visible2: false };

    showModal = (e) => {
        e.preventDefault()
        this.props.stopRecording()
        this.setState({
            visible: true,
        });
    }


    handleCancel = e => {
        this.setState({
            visible: false,
        });
    }

    showModal2 = (e) => {
        e.preventDefault()
        this.props.stopRecording()
        this.setState({
            visible2: true,
        });
    }


    handleCancel2 = e => {
        this.setState({
            visible2: false,
        });
    }

    switch = (t, e) => {
        this.props.swichState(t, e)
    }

    render() {
        return (
            <footer className="text-left">
                <a style={{ color: "#fff" }} target="_blank" href="https://github.com/nicosh/faber-js">
                    <img style={{ height: 35 }} className="img-fluid" src="/git.png" /> gitHub
                    </a>
                <span style={{ color: "#fff" }} className="ml-3">/</span>
                <a onClick={(e) => { this.showModal2(e) }} className="ml-3" style={{ color: "#fff" }} target="_blank" href="https://github.com/nicosh/faber-js">
                    Info
                    </a>
                <span style={{ color: "#fff" }} className="ml-3">/</span>
                <a onClick={(e) => { this.showModal(e) }} className="ml-3" style={{ color: "#fff" }} target="_blank" href="https://github.com/nicosh/faber-js">
                    Settings
                    </a>
                <Modal
                    title="Settings"
                    footer={false}
                    visible={this.state.visible}
                    onCancel={this.handleCancel}
                >
                    <p>Use  Levenshtein Distance : <Switch onChange={(e) => { this.switch("useClassifier", !e) }} defaultChecked={!this.props.useClassifier} className="float-right" /></p>
                    <p>Show Recognized Text : <Switch onChange={(e) => { this.switch("showRecognizedText", e) }} className="float-right" defaultChecked={this.props.showRecognizedText} /></p>
                    <p>Show Debug Window : <Switch onChange={(e) => { this.switch("debug", e) }} className="float-right" defaultChecked={this.props.debug} /></p>
                    <p>Stop recording on recognition : <Switch onChange={(e) => { this.switch("StopRecordingOnRecognition", e) }} className="float-right" defaultChecked={this.props.StopRecordingOnRecognition} /></p>
                    <p>Show matched sentence (instead that song title)* : <Switch onChange={(e) => { this.switch("Showmatchedsentence", e) }} className="float-right" defaultChecked={this.props.Showmatchedsentence} /></p>
                     <small>*Only with Levenshtein</small>
                </Modal>
                <Modal
                    title="Info"
                    footer={false}
                    visible={this.state.visible2}
                    onCancel={this.handleCancel2}
                >
                    <p>
                       
                        This app will try to guess which song of De andrè you are singing, or better, reading.  <br/>
                        To increase chanches of have a consistent speech-to-text translation try to speak as louder and clearer as possible.
                    </p>
                </Modal>
            </footer>
        )
    }
}


export default Index
