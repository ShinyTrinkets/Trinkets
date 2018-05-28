import test from 'ava'
import ms from 'ms'
import time from '../lib/timeParse'

test('numbers', t => {
  t.is(time(1234), 1234)
  t.is(time(3.14), 3.14)
  t.is(time(0), 0)
  t.is(time(-9.9), -9.9)
})

test('numeric strings', t => {
  t.is(time('1234'), 1234)
  t.is(time('0'), 0)
})

test('expressions', t => {
  t.is(time('1 millisecond'), 1)
  t.is(time('9 milliseconds'), 9)

  t.is(time('1 second'), 1000)
  t.is(time('2 seconds'), ms('1sec') * 2)
  t.is(time('1 Minute'), ms('1sec') * 60)
  t.is(time('3 Minutes'), ms('1min') * 3)
  t.is(time('1 Hour'), ms('1min') * 60)
  t.is(time('2 Hours'), ms('1h') * 2)
  t.is(time('3 WEEKS'), ms('1w') * 3)

  t.is(time('1s + 1s'), 2000)
  t.is(time('1s & 1s'), 2000)
  t.is(time('1 second and 1 sec'), 2000)

  t.is(time('2 minute + 3 seconds'), ms('2min') + ms('3sec'))
  t.is(time('3 h + 9 mins'), ms('3h') + ms('9min'))
  t.is(time('3h + 4min'), ms('3h') + ms('4min'))
  t.is(time('4h : 2m'), ms('4h') + ms('2min'))
  t.is(time('12h:30m'), ms('12h') + ms('30min'))

  t.is(time('1 second + 2 seconds'), 3000)
  t.is(time('5 minuTES 15 sEConds'), 315000)
  t.is(time('2 Hours, 5 Minutes and 15 Seconds'), 7515000)

  t.is(time('20H 5M 15S'), ms('20h') + ms('5min') + ms('15sec'))
  t.is(time('1 week, 3 days, 4h'), ms('1w') + ms('3d') + ms('4h'))
})

test('float decimals ignored', t => {
  t.is(time('1.5h'), ms('1.5h'))
  t.is(time('3.1m'), ms('3.1m'))
  t.is(time('3.14'), 3.14)
})

test('weird patterns', t => {
  t.is(time('every 1 millisecond'), 1)
  t.is(time('2 min or 2 sec'), ms('2min') + ms('2sec'))
  t.is(time('foo, bar12 a3m 1 milliseconds + 5ms + 4ms hello world'), 10)
})
