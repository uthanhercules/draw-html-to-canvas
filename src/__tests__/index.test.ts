import { Greeter } from '../index'

test('My Greeter', () => {
  expect(Greeter('Uthan')).toBe('Hello Uthan');
});