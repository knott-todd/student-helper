// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// jsdom (CRA 5) has no Web Crypto; the Google sign-in popup needs getRandomValues.
if (!global.crypto || !global.crypto.getRandomValues) {
  Object.defineProperty(global, 'crypto', { value: require('crypto').webcrypto, configurable: true });
}
