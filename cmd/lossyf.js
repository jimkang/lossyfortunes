var lossyfortune = require('../lossyfortune');
var translationLocales = require('../translationLocales');

var opts = {
  locales: translationLocales,
  date: new Date(),
  done: function done() {
    console.log('lossyf completed.');
  }
};

var cmdOpts = require('nomnom')
   .option('simulateTranslate', {
      abbr: 'str',
      full: 'simulate-translate',
      metavar: '<translation>',
      help: 'Simulate translation instead of calling API'
   })
   .option('simulateTweet', {
      abbr: 'stw',
      full: 'simulate-tweet',
      flag: true,
      help: 'Simulate tweeting instead of really tweeting'
   })
   .parse();

if (cmdOpts.simulateTranslate) {
  opts.translator = function mockTranslator(params, translateDone) {
    setTimeout(function callDone() {
      translateDone(null, cmdOpts.simulateTranslate);
    },
    0);
  };
}

if (cmdOpts.simulateTweet) {
  opts.twit = {
    post: function post(endpoint, params, done) {
      setTimeout(function callDone() {
        done(null, 'Posted!' + JSON.stringify(params));
      },
      0);
    }
  };
}

lossyfortune.runLossyFortune(opts);
