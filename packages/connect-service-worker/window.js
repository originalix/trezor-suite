(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["TrezorConnect"] = factory();
	else
		root["TrezorConnect"] = factory();
})(self, () => {
return /******/ (() => { // webpackBootstrap
var __webpack_exports__ = {};
const registerServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('connect-sw.js');
      console.log('registration', registration);
      if (registration.installing) {
        console.log('Service worker installing');
      } else if (registration.waiting) {
        console.log('Service worker installed');
      } else if (registration.active) {
        console.log('Service worker active');
      }
    } catch (error) {
      console.error(`Registration failed with ${error}`);
    }
  }
};
registerServiceWorker();
const initButton = document.getElementById('init');
if (initButton) {
  initButton.addEventListener('click', () => {
    if (navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'INIT'
      });
    }
  });
}
const setPinButton = document.getElementById('set-pin');
if (setPinButton) {
  setPinButton.addEventListener('click', () => {
    const pin = document.getElementById('pin').value;
    console.log('pin', pin);
    if (navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'set-pin',
        pin
      });
    }
  });
}
const setPassphraseButton = document.getElementById('set-passphrase');
if (setPassphraseButton) {
  setPassphraseButton.addEventListener('click', () => {
    const passphrase = document.getElementById('passphrase').value;
    console.log('passphrase', passphrase);
    if (navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'set-passphrase',
        passphrase
      });
    }
  });
}
const getAddressButton = document.getElementById('get-address');
if (getAddressButton) {
  getAddressButton.addEventListener('click', event => {
    console.log('test', event);
    if (navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'get-address'
      });
    }
  });
}
const getFeaturesButton = document.getElementById('get-features');
if (getFeaturesButton) {
  getFeaturesButton.addEventListener('click', event => {
    console.log(event);
    if (navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'get-features'
      });
    }
  });
}
__webpack_exports__ = __webpack_exports__["default"];
/******/ 	return __webpack_exports__;
/******/ })()
;
});