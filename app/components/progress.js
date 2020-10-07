import React from 'react'

class Progress extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
        intervalId : false,
        progress : 0

    }
  }

  componentDidMount() {
      console.log(this.props)
    if(this.props.rec){
        var intervalId = setInterval(this.timer, 500);
        this.setState({intervalId: intervalId});
    }else{
            clearInterval(this.state.intervalId);
    }

  }


 componentWillUnmount() {
    // use intervalId from the state to clear the interval
    clearInterval(this.state.intervalId);
 }

 timer = ()=>{
  let {progress} = this.state
  let n = progress >= 100 ? 0 : progress+25
  this.setState({progress : n})
 }

  render() {
    let {progress} = this.state

    return (
      <div className="loader-holder">
          <div style={{width : progress+"%"}} className="bar"></div>
      </div>
    )
  }
}


export default Progress
