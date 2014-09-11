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

**translatechain** takes text through a series of specified translations.

**picktranslateloop** picks a loop of translations to go through based on given variability parameters.

**makelossyfortune** uses `translatechain` and `picktranslateloop` to create a lossy fortune and post it to Twitter.

Tests
-----

Run tests with `make test`.

License
-------

MIT.
