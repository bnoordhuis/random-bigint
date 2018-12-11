// Copyright (c) 2018, Ben Noordhuis <info@bnoordhuis.nl>
//
// Permission to use, copy, modify, and/or distribute this software for any
// purpose with or without fee is hereby granted, provided that the above
// copyright notice and this permission notice appear in all copies.
//
// THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
// WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
// MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
// ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
// WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
// ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
// OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.

'use strict'

module.exports = random

const {randomBytes} = require('crypto')

function random(bits, cb) {
	if (bits < 0)
		throw new RangeError('bits < 0')

	const n = (bits >>> 3) + !!(bits & 7) // Round up to next byte.
	const r = 8*n - bits
	const s = 8 - r
	const m = (1 << s) - 1 // Bits to mask off from MSB.

	if (cb)
		return randomcb(n, m, cb)

	const bytes = randomBytes(n)

	maskbits(m, bytes)

	return bytes2bigint(bytes)
}

function randomcb(n, m, cb) {
	randomBytes(n, (err, bytes) => {
		if (err)
			return cb(err)

		maskbits(m, bytes)

		cb(null, bytes2bigint(bytes))
	})
}

// Note: mutates the contents of |bytes|.
function maskbits(m, bytes) {
	// Mask off bits from the MSB that are > log2(bits).
	// |bytes| is treated as a big-endian bigint so byte 0 is the MSB.
	if (bytes.length > 0)
		bytes[0] &= m
}

function bytes2bigint(bytes) {
	let result = 0n

	const n = bytes.length

	// Read input in 8 byte slices. This is, on average and at the time
	// of writing, about 35x faster for large inputs than processing them
	// one byte at a time.
	if (n >= 8) {
		const view = new DataView(bytes.buffer, bytes.byteOffset)

		for (let i = 0, k = n & ~7; i < k; i += 8) {
			const x = view.getBigUint64(i, false)
			result = (result << 64n) + x
		}
	}

	// Now mop up any remaining bytes.
	for (let i = n & ~7; i < n; i++)
		result = result * 256n + BigInt(bytes[i])

	return result
}

random.test = {bytes2bigint} // Exported for testing and nothing else.
