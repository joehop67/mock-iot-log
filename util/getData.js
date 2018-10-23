import uuid from 'uuid/v4'

function getRandom () {
  const isError = (Math.floor(Math.random() * 2) == 0)
  const messages = [
    'Error Connecting to device',
    'Error Connecting to server',
    'Device communication error',
    'Network error',
    'Segmentation Fault',
    'Kernel Panic',
    'Memory Allocation Error'
  ]
  const data = {
    status: isError ? 'ERROR' : 'OK',
    code: isError ? Math.floor((Math.random() * 100) + 400) : 200,
    message: isError ? messages[Math.floor(Math.random() * messages.length)] : 'Connection OK'
  }
  return data
}

export function registerRandomDevices (num = 5) {
  for (var i = 0; i < num; i++) {
    const item = [getRandom(), getRandom(), getRandom(), getRandom()]
    localStorage.setItem(`device-${i}`, JSON.stringify(item))
  }
}

export function registerDevice (id) {
  const item = [getRandom(), getRandom(), getRandom(), getRandom()]
  const data = {owned: true, logs: item}
  localStorage.setItem(id, JSON.stringify(data))
  return Promise.resolve({})
}

export function fetchData (id = '') {
  if (id) {
    if (typeof localStorage !== 'undefined') {
      const data = JSON.parse(localStorage.getItem(id))
      if (data.owned) {
        data.logs.push(getRandom())
        localStorage.setItem(id, JSON.stringify(data))
        return Promise.resolve(data.logs)
      }
      data.push(getRandom())
      localStorage.setItem(id, JSON.stringify(data))
      return Promise.resolve(data)
    } else {
      Promise.resolve([])
    }
  } else {
    const data = []
    if (typeof localStorage !== 'undefined') {
      for (var i = 0; i <= localStorage.length - 1; i++) {
        const items = JSON.parse(localStorage.getItem(localStorage.key(i)))
        if (items.owned) {
          const owned = items.logs.map(item => {
            item.device = localStorage.key(i)
            return item
          })
          data.push(owned)
        } else {
          const non = items.map(item => {
            item.device = localStorage.key(i)
            return item
          })
          data.push(non)
        }
      }
    } else {
      data.push(getRandom())
    }
    return Promise.resolve(data)
  }
}

export function getOwnedDevices () {
  if (typeof localStorage !== 'undefined') {
    const devices = []
    for (var i = 0; i<= localStorage.length - 1; i++) {
      const data = JSON.parse(localStorage.getItem(localStorage.key(i)))
      if (data.owned) devices.push(localStorage.key(i))
    }
    return Promise.resolve(devices)
  } else return Promise.resolve([])
}

export function getDeviceList () {
  const devices = []
  if (typeof localStorage !== 'undefined') {
    for (var i = 0; i <= localStorage.length - 1; i++) {
      devices.push(localStorage.key(i))
    }
  } else {
    devices.push('device')
  }
  return Promise.resolve(devices)
}