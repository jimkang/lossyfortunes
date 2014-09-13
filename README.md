lossyfortunes
=============

This is the source for @lossyfortunes, a Twitter bot that sends <a href="http://en.wikipedia.org/wiki/Fortune_(Unix)">fortunes</a> through a translation from English into another language and back again, then tweets that.

It runs on Node and uses the excellent [twit](https://github.com/ttezel/twit) module to interact with Twitter, the [mstranslator module](https://github.com/nanek/mstranslator) to talk to the Microsoft Translator API, and a [fork](https://github.com/jimkang/fortune) of a [Node fortune module](https://github.com/williamfligor/fortune) to get fortunes.

Installation
------------

    npm install lossyfortunes

Then, create a `config.js` file in the project root that contains your [Twitter API keys](https://apps.twitter.com/) and your [Microsoft Translator API keys](http://msdn.microsoft.com/en-us/library/hh454950.aspx/). Example:

    module.exports = {
      twitter: {
        consumer_key: 'asdfkljqwerjasdfalpsdfjas',
        consumer_secret: 'asdfasdjfbkjqwhbefubvskjhfbgasdjfhgaksjdhfgaksdxvc',
        access_token: '9999999999-zxcvkljhpoiuqwerkjhmnb,mnzxcvasdklfhwer',
        access_token_secret: 'opoijkljsadfbzxcnvkmokwertlknfgmoskdfgossodrh'
      },
      mstranslate: {
        client_id: 'pkninuhiuh',
        client_secret: "siudhfo9y38riuhfiosuhdfgoisudfhg394ht98ysdfe"
      }
    };

Usage
-----

To post a re-translated fortune, run the command:

    node makelossyfortune.js

To make a re-translated and print it to the console, but not post it:

    node makelossyfortune.js --simulate

Specification
-------------

**translateChain** takes text through a series of specified translations.

translateChain(translator, text, [list of valid locale codes], callback) =>
  - `translator` is called with `intermediateText` and a locale code, for each locale code
    - Where `intermediateText` is different each call
  - `callback` is called like so callback(error, finalTranslation)
    - Where:
      - `error` is null
      - `finalTranslation` is a string that differs from the last `intermediateText`

translateChain(translator, text, [list of three locale codes, the second of which is invalid], callback) =>
  - `translator` is called with `intermediateText` and a locale code, twice
    - Where `intermediateText` is different each call
  - `callback` is called like so callback(error, finalTranslation)
    - Where:
      - `error` is a string returned by `translator`
      - `finalTranslation` is null

**clockworkPair** deterministically picks a pair of numbers from a range from 0 to *c* - 1, where *c* is the upper limit, and a seed, such that:
  - The first element of a pair generated from seed *s + 1* will follow the first element of a pair generated the  seed *s*.
    - Unless p[0] (the first element of the pair) generated from *s* is *c* - 1. In that case, p[0] for *s + 1* will be 0.
  - If `pickTranslationLocales` is called for every seed from 0 to *c* * *(c - 1)*, every pair combination will be generated.
  - Basically:
    clockworkPair(upperLimit, seed) =>
      - Let base = seed % upperLimit
      - Let gap = floor(seed/upperLimit) + 1
      - Let wraparound = fn(x, c) => x < c ? x : c - x
      - return [base, wraparound(base + gap)]


**pickTranslationLocales** gets a subset of translation locales that differ from day to day.

pickTranslationLocales(day, translationLocales) =>
  - If `day` is odd, returns the element in `translationLocales` at `(day - 1) % translationLocales.length`.
  - If `day` is even, returns the elements at the two indexes given by `clockworkPair(translationLocales.length, day - 1)`.

**makeLossyRetranslation** uses *pickTranslationLocales* to select locales to translate through and *translateChain* to create a lossy fortune from those locales. Then, it uses `twit` to post it to Twitter.

makeLossyRetranslation(translateChain, pickTranslationLocales, text, baseLocale, locales (excluding baseLocale), callback) =>
  - Calls pickTranslationLocales with a seed, sizeRange, and locales to get a set of `translationLocales`.
  - Calls translateChain with a translator, text, `translationLocales` + `baseLocale`, and callback.

**makeLossyFortune(baseLocale, locales (excluding baseLocale), callback)** uses `fortune` and `makeLossyRetranslation` to get a lossy fortune to callback.

Tests
-----

Run tests with `make test`.

License
-------

MIT.
