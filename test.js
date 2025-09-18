const test = require('brittle')
const { channel, Channel, tracingChannel } = require('.')

test('channel', (t) => {
  t.plan(5)

  const channel = new Channel('my.channel')

  const subscription = (data) => t.is(data, 42)

  channel.subscribe(subscription)
  t.is(channel.hasSubscribers, true)

  channel.publish(42)

  t.is(channel.unsubscribe(subscription), true)
  t.is(channel.unsubscribe(subscription), false)
  t.is(channel.hasSubscribers, false)

  channel.publish(21)
})

test('tracing channel', (t) => {
  t.plan(8)

  const channels = tracingChannel({
    start: channel('tracing:my.channel:start'),
    end: channel('tracing:my.channel:end'),
    error: channel('tracing:my.channel:error')
  })

  const start = (message) => t.alike(message, { some: 'thing' })
  const end = (message) => t.alike(message, { some: 'thing', result: 42 })
  const error = (message) => t.fail()

  channels.subscribe({ start, end, error })
  t.is(channels.hasSubscribers, true)

  channels.traceSync(
    (...args) => {
      t.alike(args, ['first arg', 'second arg'])

      return 42
    },
    { some: 'thing' },
    this,
    'first arg',
    'second arg'
  )

  t.is(channels.unsubscribe({}), true)
  t.is(channels.unsubscribe({ start, end, error }), true)
  t.is(channels.unsubscribe({ start }), false)
  t.is(channels.hasSubscribers, false)
})

test('tracing channel - error', (t) => {
  t.plan(1)

  const channels = tracingChannel('my.channel')

  channels.subscribe({
    error: (message) => t.is(message.error.message, 'boom!')
  })

  try {
    channels.traceSync(() => {
      throw new Error('boom!')
    })
  } catch {}
})
