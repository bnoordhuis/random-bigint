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

const assert = require('assert')
const random = require('./')

assert.throws(() => random(-1), /bits < 0/)
assert.strictEqual(typeof random(8), 'bigint')
assert.strictEqual(random(0), 0n)

for (let i = 0; i < 256; i++) {
	const x = random(1)
	assert(x >= 0n)
	assert(x <= 1n)
}

for (let i = 0; i < 256; i++) {
	const x = random(2)
	assert(x >= 0n)
	assert(x <= 3n)
}

for (let i = 0; i < 256; i++) {
	const x = random(7)
	assert(x >= 0n)
	assert(x <= 127n)
}

for (let i = 0; i < 256; i++) {
	const x = random(8)
	assert(x >= 0n)
	assert(x <= 255n)
}

for (let i = 0; i < 256; i++) {
	const x = random(9)
	assert(x >= 0n)
	assert(x <= 511n)
}

{
	const start = Date.now()
	random(65537)
	const end = Date.now()
	const duration = end - start
	// Generating a large bigint shouldn't take forever. Obviously not an
	// exact science because of differences in hardware but 100 ms seems
	// like a generous upper bound for a bigint in the range 0..2**65537.
	// It takes less than 4 milliseconds on a 2012 Intel Core i7-3770.
	assert(duration < 100)
}

{
	let numcalls = 0

	random(128, (err, x) => {
		numcalls++
		assert.ifError(err)
		assert.strictEqual(typeof x, 'bigint')
		assert(x >= 0n)
		assert(x <= 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFn)
	})

	process.on('exit', () => assert.strictEqual(numcalls, 1))
}

{
	const {bytes2bigint} = random.test
	assert.strictEqual(bytes2bigint(Buffer.from([])), 0n)
	assert.strictEqual(bytes2bigint(Buffer.from([1])), 1n)
	assert.strictEqual(bytes2bigint(Buffer.from([0,1])), 1n)
	assert.strictEqual(bytes2bigint(Buffer.from([1,0])), 256n)
	assert.strictEqual(
		bytes2bigint(Buffer.from([1,0,0,0,0,0,0,0,1])),
		1n + (1n << 64n))
}
