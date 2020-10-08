import React from 'react'
import Head from 'next/head'
import dynamic from 'next/dynamic'
const Main = dynamic(
  () => import('../components/main'),
  { ssr: false }
)

class Index extends React.Component {
  render() {
    return (
      <div className="tint text-center">
        <Main/>
      </div>
    )
  }
}


export default Index
