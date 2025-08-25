class DiagnosticsChannel {
  static _channels = new Map()

  constructor(name) {
    this._name = name
    this._subscribers = []

    DiagnosticsChannel._channels.set(name, this)
  }

  get name() {
    return this._name
  }

  get hasSubscribers() {
    return this._subscribers.length > 0
  }

  subscribe(subscription) {
    this._subscribers = [...this._subscribers, subscription]
  }

  unsubscribe(subscription) {
    const i = this._subscribers.indexOf(subscription)

    if (i === -1) return false

    this._subscribers = [
      ...this._subscribers.slice(0, i),
      ...this._subscribers.slice(i + 1)
    ]

    return true
  }

  publish(data) {
    const subscribers = this._subscribers

    for (let i = 0, n = subscribers.length; i < n; i++) {
      try {
        subscribers[i](data, this._name)
      } catch (err) {
        setImmediate(() => {
          throw err
        })
      }
    }
  }
}

module.exports = exports = DiagnosticsChannel

exports.Channel = DiagnosticsChannel

function channel(name) {
  const channel = DiagnosticsChannel._channels.get(name)

  if (channel !== undefined) return channel

  return new DiagnosticsChannel(name)
}

exports.channel = channel

exports.subscribe = function subscribe(name, subscription) {
  return channel(name).subscribe(subscription)
}

exports.unsubscribe = function unsubscribe(name, subscription) {
  return channel(name).unsubscribe(subscription)
}

exports.hasSubscribers = function hasSubscribers(name) {
  const channel = DiagnosticsChannel._channels.get(name)

  if (channel === undefined) return false

  return channel.hasSubscribers
}
