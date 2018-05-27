import test from 'ava'
import later from 'later'
import range from 'lodash.range'

test('every unit', t => {
  t.deepEqual(later.parse.text('every second').schedules[0], { s: [0] })
  t.deepEqual(later.parse.text('every minute').schedules[0], { m: [0] })
  t.deepEqual(later.parse.text('every hour').schedules[0], { h: [0] })
  t.deepEqual(later.parse.text('every day').schedules[0], { D: [1] })
  t.deepEqual(later.parse.text('every week').schedules[0], { wy: [1] })
  t.deepEqual(later.parse.text('every month').schedules[0], { M: [1] })
})

test('every 2 units', t => {
  t.deepEqual(later.parse.text('every 2 hours').schedules[0], { h: range(0, 23, 2) })
  t.deepEqual(later.parse.text('every 2 days').schedules[0], { D: range(1, 32, 2) })
  t.deepEqual(later.parse.text('every 2 weeks').schedules[0], { wy: range(1, 55, 2) })
})

test('every 10 units', t => {
  t.deepEqual(later.parse.text('every 10 seconds').schedules[0], { s: range(0, 60, 10) })
  t.deepEqual(later.parse.text('every 10 minutes').schedules[0], { m: range(0, 60, 10) })
  t.deepEqual(later.parse.text('every 10 hours').schedules[0], { h: range(0, 24, 10) })
  t.deepEqual(later.parse.text('every 10 days').schedules[0], { D: range(1, 32, 10) })
})

test('weekdays', t => {
  t.deepEqual(later.parse.text('every weekday').schedules[0], { d: [2, 3, 4, 5, 6] })
  t.deepEqual(later.parse.text('every weekend').schedules[0], { d: [1, 7] })
  t.deepEqual(later.parse.text('every 2nd day of the week').schedules[0], { d: [1, 3, 5, 7] })
  // t.deepEqual(later.parse.text('every monday').schedules[0], {})
})
