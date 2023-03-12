export const ALREADY_LISTENING = '@trezor/transport: already listening' as const;
export const NATIVE_INTERFACE_NOT_AVAILABLE =
    '@trezor/transport: native interface not available' as const;

// todo: this error might mean the same as MALFORMED_DATA or maybe MALFORMED_PROTOBUF or MALFORMED_WIRE_FORMAT
export const PROTOCOL_HEADER_SIGNATURE =
    "@trezor/transport: Didn't receive expected header signature.";

// highlevel-checks
export const WRONG_RESULT_TYPE = 'Wrong result type.' as const;

export const SESSIONS_BACKGROUND_NOT_AVAILABLE = 'sessions background not available' as const;

// trezord-go protobuf.go
// https://github.dev/trezor/trezord-go/blob/8f35971d3c36ea8b91ff54810397526ef8e741c5/wire/protobuf.go#L14
export const BRIDGE_MALFORMED_PROTOBUF = 'malformed protobuf' as const;

// trezord-go wire/v1.go
// https://github.dev/trezor/trezord-go/blob/8f35971d3c36ea8b91ff54810397526ef8e741c5/wire/v1.go#L72
export const MALFORMED_WIRE_FORMAT = 'malformed wire format' as const;

export const WRONG_ENVIRONMENT = 'This transport can not be used in this environment' as const;

// trezord-go bus.go
// https://github.dev/trezor/trezord-go/blob/8f35971d3c36ea8b91ff54810397526ef8e741c5/usb/bus.go#L56
export const DEVICE_DISCONNECTED_DURING_ACTION = 'device disconnected during action' as const;
export const DEVICE_CLOSED = 'closed device' as const; // todo: not implemented
export const OTHER_CALL_IN_PROGRESS = 'other call in progress' as const;

// bridge
export const HTTP_ERROR = 'Network request failed' as const;

export const ABORTED_BY_SIGNAL = 'Aborted by signal' as const;
export const ABORTED_BY_TIMEOUT = 'Aborted by timeout' as const;
