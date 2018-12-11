# random-bigint

Because the generation of random numbers is too important to be left to chance.

## purpose

This module generates cryptographically strong pseudo-random [BigInt][]s.

## usage

```js
const random = require('random-bigint')

// synchronous api, generates a random number between 0 and 2**128-1
const num = random(128) // 128 bits
console.log(typeof num) // 'bigint'
console.log(num) // e.g. 248612378658540041399850947464384774729n

// asynchronous api
random(128, function(err, num) {
	if (err)
		throw err

	console.log(num) // e.g. 248612378658540041399850947464384774729n
})
```

## api

This module exports a single function that is documented below.

### random(bits[, cb])

* `bits` {number} Number of bits.
* `cb` {Function} Optional `(err, num)` callback.

Generate a random [BigInt][] in the range `0..2**bits-1`.

Uses [`crypto.randomBytes()`][] to generate the raw random bits and
hence produces cryptographically strong pseudo-random numbers.

`random()` operates synchronously when the callback is omitted.
Generating large numbers may block the event loop for a long time.

Bias the result to generate random numbers less than zero:

```js
const random = require('random-bigint')

const bits = 7
const bias = 2n ** BigInt(bits)
const num = random(1 + bits) - bias

console.log(num) // bigint in the range -128n..127n
```

## license

ISC, see the LICENSE file in the top-level directory.

[BigInt]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/BigInt
[`crypto.randomBytes()`]: https://nodejs.org/docs/latest-v10.x/api/crypto.html#crypto_crypto_randombytes_size_callback
