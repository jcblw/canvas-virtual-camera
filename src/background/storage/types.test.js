import { serializers, deserializers } from './types'

test('serializers.object should convert a object to a string', () => {
  expect(serializers.object({})).toEqual('{}')
})

test('serializers.object should convert undefined to a null string', () => {
  expect(serializers.object(undefined)).toEqual('null')
})

test('serializers.number should convert a number to a string number', () => {
  expect(serializers.number(2)).toEqual('2')
})

test('serializers.string should convert a string to a string', () => {
  expect(serializers.string('foo')).toEqual('foo')
})

test('serializers.boolean should convert a boolean to a string', () => {
  expect(serializers.boolean(true)).toEqual('true')
})

test('deserializers.object should convert a string to an object', () => {
  expect(deserializers.object('{}')).toEqual({})
})

test('deserializers.object if fails to convert returns null', () => {
  expect(deserializers.object('undefined')).toEqual(null)
})

test('deserializers.number should convert a string to a number', () => {
  expect(deserializers.number('2')).toEqual(2)
})

test('deserializers.string should convert a string to a string', () => {
  expect(deserializers.string('foo')).toEqual('foo')
})

test('deserializers.boolean should convert a string to a boolean', () => {
  expect(deserializers.boolean('true')).toEqual(true)
})
