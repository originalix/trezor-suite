// following errors are returned by bridge
// https://github.dev/trezor/trezord-go/blob/8f35971d3c36ea8b91ff54810397526ef8e741c5/core/core.go#L138
// we reuse them here too
export const WRONG_PREVIOUS_SESSION = 'wrong previous session' as const;
export const SESSION_NOT_FOUND = 'session not found' as const;

// webusb
export const TIMEOUT = 'sessions background did not respond' as const;
