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

Do the same for `behavior.js`. Example:

    var bibleTries = 0;

    function getFortuneFromBible(done) {
      request('http://labs.bible.org/api/?passage=random', 
        function sendVerse(error, response, body) {
          bibleTries += 1;
          var verse = body.replace(/<\/?b>/g, '');

          if (error || verse.length > 140) {
            if (bibleTries >= 5) {
              console.log('Too many bible tries!');
              done(error, verse);
            }
            else {
              getFortuneFromBible(done);
            }
          }
          else {
            done(error, verse);
          }
        }
      );
    }

    var behaviorSettings = {
      fortuneSource: {
        fortune: getFortuneFromBible    
      }
    };

    module.exports = behaviorSettings;

Usage
-----

To post a re-translated fortune, run the command:

    node cmd/lossyf.js

To make a re-translated and print it to the console, but not post it:

    node cmd/lossyf --simulate-tweet

To simulate re-translating a fortune without actually making translator API calls:

    node cmd/lossyf --simulate-translate "Dr. Wiley is a bonus feline friend."

To simulate both:

    node cmd/lossyf --simulate-translate --simulate-tweet

By default, it will use `./config.js`. However, you can set --config to change that. e.g.

    node cmd/lossyf.js --config configs/wilyconfig.js

For behaviors, `./behavior.js` will be the default. You can change that as well.

    node cmd/lossyf.js --behavior behaviors/wilybehavior.js

Specification
-------------

**translateChain** takes text through a series of specified translations.

translateChain(translator, text, [list of valid locale codes], logger, callback) =>
  - `translator` is called with `intermediateText` and a locale code, for each locale code
    - Where `intermediateText` is different each call
  - `callback` is called like so callback(error, finalTranslation)
    - Where:
      - `error` is null
      - `finalTranslation` is a string that differs from the last `intermediateText`

translateChain(translator, text, [list of three locale codes, the second of which is invalid], logger. callback) =>
  - `translator` is called with `intermediateText` and a locale code, twice
    - Where `intermediateText` is different each call
  - Calls `logger.log` with the `intermediateText` and the `from` and `to` locales used to translate.
  - `callback` is called like so callback(error, finalTranslation)
    - Where:
      - `error` is a string returned by `translator`
      - `finalTranslation` is null

**clockworkPair** deterministically picks a pair of numbers from a range from 0 to *c* - 1, where *c* is the upper limit, and a seed, such that:
  - The first element of a pair generated from seed *s + 1* will follow the first element of a pair generated the  seed *s*.
    - Unless p\[0] (the first element of the pair) generated from *s* is *c* - 1. In that case, p[0] for *s + 1* will be 0.
  - If `pickTranslationLocales` is called for every seed from 0 to *c* * *(c - 1)*, every pair combination will be generated.
  - Basically:
    clockworkPair(upperLimit, seed) =>
      - Let base = seed % upperLimit
      - Let gap = floor(seed/upperLimit) + 1
      - Let wraparound = fn(x, c) => x < c ? x : x - c
      - return [base, wraparound(base + gap)]
  - If seed >= *c* * *(c - 1)*, seed will be seed % *c* * *(c - 1)*.

**pickTranslationLocales** gets a subset of translation locales that differ from day to day.

pickTranslationLocales(date, translationLocales) =>
  - Returns the elements at the two indexes given by `clockworkPair(translationLocales.length, day)`.

If there are 24 locales, this means that all the 2-locale permutations will be picked in a 24-day span, and all the permutations for all of the locales will complete in 576 days.

**makeLossyRetranslation** uses *pickTranslationLocales* to select locales to translate through and *translateChain* to create a lossy fortune from those locales. Then, it uses `twit` to post it to Twitter.

makeLossyRetranslation(translateChain, pickTranslationLocales, translator, baseLocale, locales (excluding baseLocale), date, text, callback) =>
  - Calls pickTranslationLocales with a date and locales to get a set of `translationLocales`.
  - Calls translateChain with a translator, text, `baseLocale`, prepended and appended to `translationLocales`, and the callback.
      - If `translateChain` completes with an error, `makeLossyRetranslation` calls the callback with the error and no translation.
      - If the final translation is the same as the initial text, `makeLossyRetranslation` calls the callback with the error and no translation.

**makeLossyFortune(fortuneSource, lossyTranslate, callback)** uses `fortuneSource` and `lossyTranslate` to get a lossy fortune to the callback.

makeLossyFortune(fortuneSource, lossyTranslate, callback) =>
  - Where `lossyTranslate` is a curried `makeLossyRetranslation` that already has every parameter set except for `text` and `done`.
      - `lossyTranslate`'s locales are all valid.
  - Calls `fortuneSource.fortune(callback)` to get text.
  - Calls `lossyTranslate` with that text and a callback.
  - That callback is called with null for the error and a lossy translation of the fortune for the value.
      - If `lossyTranslate` has an invalid locale, an error string will be returned, as per makeLossyRetranslation.

**postLossyFortune(lossyFortuneMaker, twit, logger, date, done)** uses lossyFortuneMaker and date to create a lossy fortune, then uses twit to post it, while updating via logger.

postLossyFortune(lossyFortuneMaker, twit, logger, date, done) =>
  - Calls `lossyFortuneMaker` (a curried `makeLossyFortune`) with a callback to get a lossy fortune.
  - Calls `logger.log` with the date and the generated fortune.
    - Logs the error if there was an error in generating the fortune.
    - Does not proceed if no fortune could be generated.
  - Calls `twit.post` with 'statuses/update' and the lossy fortune as the status.
  - Calls `logger.log` with a timestamp, what was posted, and the Twitter response and error.
  - Calls `done` with null and twitter post result status.

**runLossyFortune(twit, translator, logger, locales, date)** builds a `lossyFortuneMaker` and then calls `postLossyFortune`. None of the parameters are required. Defaults are as follows:

    {
        twit: twit (instantiated using ./config.js),
        translator: mstranslatorInstance.translate,
        logger: console,
        locales: whatever's in ./locales.js,
        date: new Date()
    }

runLossyFortune(twit, translator, logger, locales, date) =>
  - Calls [masala](https://github.com/imbcmdth/masala) with `makeLossyRetranslation` and the opts `translateChain`, `pickTranslationLocales`, translator, `en`, locales (excluding baseLocale), date to get `lossyTranslate`.
  - Calls `masala` on `makeLossyFortune` with `fortune` and `lossyTranslate` to get `lossyFortuneMaker`.
  - Calls `postLossyFortune` with `lossyFortuneMaker`, `twit`, `logger`, and `date`.

Tests
-----

Run tests with `make test`.

License
-------

MIT.
