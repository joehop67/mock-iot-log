import React from 'react'
import {Jumbotron, ListGroup, ListGroupItem, Button, Modal, ModalHeader, ModalBody, ModalFooter} from 'reactstrap'
import {registerDevice, fetchData, registerRandomDevices, getDeviceList, getOwnedDevices} from '../util/getData'
import async from '../util/async'

export default class ListPage extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      page: 'log',
      filter: 'device',
      register: false
    }
  }

  componentDidMount () {
    if (localStorage.length < 1) {
      registerRandomDevices(5)
    }
  }

  render () {
    const {page, filter} = this.state
    const id = this.props.url.query.id
    return (
      <div className='homepage'>
        <style jsx>{`
          .homepage {
            display: flex;
            flex-direction: column;
            width: 100%;
            height: 100%;
            align-items: center;
            background: linear-gradient(to bottom, #7d7e7d 0%,#0e0e0e 100%);
            padding-bottom: 2rem;
          }
          .list-container {
            margin-top: 5rem;
            width: 75%;
          }
          .new-device {
            width: 100%;
            height: 2rem;
            border-radius: .25rem;
            border: 2px solid grey;
          }
          ul {
            list-style-type: none;
            display: flex;
            flex-direction: row;
            padding: 0;
          }
          li {
            margin-right: 2rem;
            font-size: 2rem;
          }
          a {
            color: #292b2c;
          }
          a:hover {
            color: #292b2c;
          }
          li:hover {
            cursor: pointer;
            text-decoration: underline;
          }
          .owned {
            min-height: 15rem;
          }
        `}</style>
        <div className='list-container'>
          <ul>
            {id ? <li><a href='/'>Full Log</a></li> : <li onClick={() => this.setState({page: 'log'})}>Full Log</li>}
            <li onClick={() => this.setState({page: 'devices'})}>All Devices</li>
            <li onClick={() => this.setState({page: 'owned'})}>My Devices</li>
            <li onClick={() => this.setState({register: true})}>Register New Device</li>
          </ul>
          <Modal isOpen={this.state.register}>
            <ModalHeader toggle={() => this.setState({register: false})}>Register New Device</ModalHeader>
            <form onSubmit={(e) => {
              e.preventDefault()
              const device = e.target.id.value
              registerDevice(device).then(() => {
                document.location = `/?id=${device}`
              })
            }}>
              <ModalBody>
                <input className='new-device' name='id' type='text' placeholder='Device ID' />
              </ModalBody>
              <ModalFooter><Button>Register</Button><Button type='button' onClick={() => this.setState({register: false})}>Cancel</Button></ModalFooter>
            </form>
          </Modal>
          <Jumbotron>
            {page === 'log' 
            ? <div>
                {id ? <h1>{id} Log</h1> : <h1>Full Log</h1>}
                <Logs id={id || false} filter={filter} setFilter={(filter) => this.setState({filter: filter})} />
              </div>
            : page === 'owned'
              ? <div className='owned'>
                  <h1>My Registered Devices</h1>
                  <MyDeviceList />
                </div>
              : <div>
                  <h1>All Devices</h1>
                  <DeviceList />
                </div>}
          </Jumbotron>
        </div>
      </div>
    )
  }
}

function DeviceList (props) {
  return async(getDeviceList(), devices => {
    console.log(devices)
    if (devices.length > 0) return (
      <ListGroup>
        {devices.map(device => {
          return <ListGroupItem><a href={`/?id=${device}`}>{device}</a></ListGroupItem>
        })}
      </ListGroup>
    )
    else return <h1>Loading</h1>
  })
}

function MyDeviceList (props) {
  return async(getOwnedDevices(), devices => {
    if (devices.length > 0) return (
      <ListGroup>
        {devices.map(device => {
          return <ListGroupItem><a href={`/?id=${device}`}>{device}</a></ListGroupItem>
        })}
      </ListGroup>
    )
    else return <h1>Loading</h1>
  })
}

function Logs (props) {
  const {id, filter} = props
  return async(fetchData(id), (data) => {
    if (data.length > 0) {
      const errors = []
      const ok = []
      if (filter === 'status') {
        data.map(log => {
          if (log.length > 0) log.map(item => {
            if (item.status === 'ERROR') errors.push(item)
            else ok.push(item)
          })
          else {
            if (log.status === 'ERROR') errors.push(log)
            else ok.push(log)
          }
        })
      }
      const all = errors.concat(ok)
      return (
        <ListGroup>
          <style jsx>{`
            :global(.message-list) {
              display: flex;
              flex-direction: row;
              justify-content: space-between;
            }
            :global(.error-item) {
              background: red;
              color: #fff;
            }
            :global(.sort:hover) {
              text-decoration: underline;
              cursor: pointer;
            }
            :global(.message-list > span) {
              width: 10rem;
            }
          `}</style>
          <ListGroupItem className='message-list'><span className='sort status' onClick={() => props.setFilter('status')}>STATUS {filter === 'status' && String.fromCharCode(9660)}</span><span className='code'>STATUS CODE</span><span className='message'>STATUS MESSAGE</span><span className='sort device' onClick={() => props.setFilter('device')}>DEVICE {filter === 'device' && String.fromCharCode(9660)}</span></ListGroupItem>
          {filter === 'device' && data.map(log => {
            if (log.length > 0) return log.map(item => {
              return <ListGroupItem className={item.code == 200 ? 'message-list' : 'error-item message-list'}><span className='status'>{item.status}</span><span className='code'>{item.code}</span><span className='message'>{item.message}</span><span className='device'><a href={`/?id=${item.device}`}>{item.device}</a></span></ListGroupItem>
            })
            else return <ListGroupItem className={log.code == 200 ? 'message-list' : 'error-item message-list'}><span className='status'>{log.status}</span><span className='code'>{log.code}</span><span className='message'>{log.message}</span><span className='device'><a href={`/?id=${id}`}>{id}</a></span></ListGroupItem>
          })}
          {filter === 'status' && all.map(item => {
            return <ListGroupItem className={item.code == 200 ? 'message-list' : 'error-item message-list'}><span className='status'>{item.status}</span><span className='code'>{item.code}</span><span className='message'>{item.message}</span><span className='device'><a href={`/?id=${item.device || id}`}>{item.device || id}</a></span></ListGroupItem>
          })}
        </ListGroup>
      ) 
    }
    else return (
      <h1>Loading</h1>
    )
  })
}