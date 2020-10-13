import React from 'react'
import Head from 'next/head'
import dynamic from 'next/dynamic'
const Main = dynamic(
  () => import('../components/main'),
  {
    ssr: false,
    loading: () => (
      <div className="tint text-center">
        <div className="flexbox-center fullh big">
          <p>Loading...</p>
        </div>
      </div>
    )
  }
)

class Index extends React.Component {
  render() {
    return (
      <div className="tint text-center">
        <Main />
      </div>
    )
  }
}


export default Index
