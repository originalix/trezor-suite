// DOMException from webusb
export const UNABLE_TO_CLAIM_INTERFACE = 'Unable to claim interface' as const;
export const DATA_TRANSFER_ERROR = 'A transfer error has occurred.' as const;
export const DEVICE_DISCONNECTED_WEBUSB = 'The device was disconnected.' as const;

// our errors
export const UNABLE_TO_OPEN_DEVICE = 'Unable to open device' as const;
export const UNABLE_TO_CLOSE_DEVICE = 'Unable to close device' as const;

// for easier standardization we re-use interface related errors from bridge
// trezord-go bus.go
// https://github.dev/trezor/trezord-go/blob/8f35971d3c36ea8b91ff54810397526ef8e741c5/usb/bus.go#L56
export const DEVICE_NOT_FOUND = 'device not found' as const;

// custom errors
export const DEVICE_UNREADABLE = 'Device unreadable'; // device was found but we can't read it
