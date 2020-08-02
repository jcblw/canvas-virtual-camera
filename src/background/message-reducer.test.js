import { reducer } from './message-reducer'

test('reducer should return true', () => {
  const mockResponse = jest.fn()
  expect(reducer({}, {}, mockResponse)).toBe(true)
  expect(mockResponse).toBeCalledWith({ success: true })
})
