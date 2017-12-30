'use strict'

const React = require('react')
const IPFS = require('ipfs')

const stringToUse = 'hello world from webpacked IPFS'

let node

class App extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      id: null,
      version: null,
      protocol_version: null,
      added_file_hash: null,
      added_file_contents: null
    }
  }
  componentDidMount () {
    const self = this

    create()

    function create () {
      // Create the IPFS node instance

      node = new IPFS({ 
        EXPERIMENTAL: {
          pubsub: true // required, enables pubsub
        },
        //repo: String(Math.random() + Date.now()) 
      })

      node.once('ready', () => {
        console.log('IPFS node is ready')
        ops()

      //  node.swarm.connect('/ip4/192.168.14.81/tcp/9999/ws/ipfs/Qmcp2n4xufwfgYsdYXSkiUNufDzVhvb63ZeQJHnQZa9W9i', (err) => {
      //   // node.swarm.connect('/dns4/wss0.bootstrap.libp2p.io/tcp/443/wss/ipfs/QmZMxNdpMkewiVZLMRxaNxUeZpDUb34pWjZ1kZvsd16Zic', (err) => {
      //     console.log('err', err)
      //   })        

        // data should be a buffer
        const data = Buffer.from('some message content here')

        node.pubsub.publish('poc1', data, (err) => {
          if (err) {
            console.error('error publishing: ', err)
          } else {
            console.log('successfully published message')
          }
        })
      })
    }

    function ops () {
      node.id((err, res) => {
        if (err) {
          throw err
        }
        self.setState({
          id: res.id,
          version: res.agentVersion,
          protocol_version: res.protocolVersion
        })
      })

      node.files.add([Buffer.from(stringToUse)], (err, filesAdded) => {
        if (err) { throw err }

        const hash = filesAdded[0].hash
        self.setState({added_file_hash: hash})

        node.files.cat(hash, (err, data) => {
          if (err) { throw err }
          self.setState({added_file_contents: data.toString()})
        })
      })
    }
  }

  getId() {
    node.swarm.peers((err, peers) => {
      if (err) {
        console.error(err);
      }
      console.log(peers)
    })

  }

  pub() {
    // data should be a buffer
    const data = Buffer.from('some message content here')

    node.pubsub.publish('poc1', data, (err) => {
      if (err) {
        console.error('error publishing: ', err)
      } else {
        console.log('successfully published message')
      }
    })    
  }
  
  render () {
    return (
      <div style={{textAlign: 'center'}}>
        <h1>Everything is working!</h1>
        <p>Your ID is <strong>{this.state.id}</strong></p>
        <p>Your IPFS version is <strong>{this.state.version}</strong></p>
        <p>Your IPFS protocol version is <strong>{this.state.protocol_version}</strong></p>
        <hr />
        <div>
          Added a file! <br />
          {this.state.added_file_hash}
        </div>
        <br />
        <br />
        <p>
          Contents of this file: <br />
          {this.state.added_file_contents}
        </p>
        <p>
          <button onClick={this.getId}>getId</button>
          <button onClick={this.pub}>pub</button>
        </p>
      </div>
    )
  }
}
module.exports = App
