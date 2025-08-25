const test = require('brittle')
const { Channel } = require('.')

test('basic', (t) => {
  t.plan(3)

  const channel = new Channel('my.channel')

  const subscription = (data) => t.is(data, 42)

  channel.subscribe(subscription)

  channel.publish(42)

  t.is(channel.unsubscribe(subscription), true)
  t.is(channel.unsubscribe(subscription), false)

  channel.publish(21)
})
