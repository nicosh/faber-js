import React from 'react'
import { Modal, Button, Switch } from 'antd';

class Index extends React.Component {
    state = { visible: false };

    showModal = (e) => {
        e.preventDefault()
        this.props.stopRecording()
        this.setState({
            visible: true,
        });
    };


    handleCancel = e => {
        this.setState({
            visible: false,
        });
    };
 
    switch = (t,e)=>{
        this.props.swichState(t,e)
    }

    render() {
        return (
                <footer className="text-left">
                    <a style={{ color: "#fff" }} target="_blank" href="https://github.com/nicosh/faber-js">
                         <img style={{ height: 35 }} className="img-fluid" src="/git.png" /> gitHub
                    </a>
                     <span style={{ color: "#fff" }} className="ml-3">/</span>
                    <a className="ml-3" style={{ color: "#fff" }} target="_blank" href="https://github.com/nicosh/faber-js">
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
                    <p>Use  Levenshtein Distance : <Switch onChange={(e)=>{this.switch("useClassifier",!e)}} defaultChecked={!this.props.useClassifier} className="float-right" /></p>
                    <p>Show Recognized Text : <Switch  onChange={(e)=>{this.switch("showRecognizedText",e)}} className="float-right" defaultChecked={this.props.showRecognizedText} /></p>
                    <p>Show Debug Window : <Switch   onChange={(e)=>{this.switch("debug",e)}} className="float-right" defaultChecked={this.props.debug} /></p>
                    
                </Modal>
            </footer>
        )
    }
}


export default Index
