require('@testing-library/jest-dom');
/// <reference types="@testing-library/jest-dom" />

if (typeof global.TextEncoder === 'undefined') {
	global.TextEncoder = require('util').TextEncoder;
}
