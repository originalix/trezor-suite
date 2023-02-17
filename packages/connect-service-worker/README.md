# Connect Service Worker

## Dev
Browsers for security reasons do not allow to register Service Workers from filesystem, they have to be served either from https or localhost. There for here for development we use lite-server.

Build it:
```bash
yarn workspace @trezor/connect-service-worker build:inline
```
Run it:
```bash
yarn workspace @trezor/connect-service-worker dev
```

## Resources

* https://github.com/mdn/dom-examples/tree/main/service-worker/simple-service-worker
* https://www.digitalocean.com/community/tutorials/js-service-workers
* https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API/Using_Service_Workers