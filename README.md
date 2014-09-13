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

**pickArbitrary** deterministically picks members from an array based on a seed.

pickArbitrary(seed, sizeRange, array) =>
  - It will return an array, `selection`, containing members of `array`, where:
    - Its size will be between `sizeRange[0]` and `sizeRange[1]`, as determined by: `sizeRange[0] + ((sizeRange[1] - sizeRange[0]) % seed) + 1`
    - Each element in `selection` will be selected as such: `array[selection.length % seed]`

**makeLossyRetranslation** uses *pickArbitrary* to select locales to translate through and *translateChain* to create a lossy fortune from those locales. Then, it uses `twit` to post it to Twitter.

makeLossyRetranslation(translateChain, pickArbitrary, text, baseLocale, locales (excluding baseLocale), callback) =>
  - Calls pickArbitrary with a seed, sizeRange, and locales to get a set of `translationLocales`.
  - Calls translateChain with a translator, text, `translationLocales` + `baseLocale`, and callback.

**makeLossyFortune(baseLocale, locales (excluding baseLocale), callback)** uses `fortune` and `makeLossyRetranslation` to get a lossy fortune to callback.

Tests
-----

Run tests with `make test`.

License
-------

MIT.
