import React from 'react'
import Head from 'next/head'
import dynamic from 'next/dynamic'


const Mic = dynamic(
  () => import('../components/mic'),
  { ssr: false }
)
class Index extends React.Component {
  constructor(props) {
    super(props)
    this.state = {

    }
  }


  componentDidMount() {

  }

  render() {
    let {reactmic} = this.state
    return (
      <div className="tint">
        <Mic/>
      </div>
    )
  }
}


export default Index
