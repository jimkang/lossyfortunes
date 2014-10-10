var wardboss = require('wardboss');
var boss = wardboss.createBoss('lossyboss');
var request = require('request');
var lossyfortune = require('../lossyfortune');
var fortune = require('fortune-tweetable');

boss.addConstituent('lossyfortune');
boss.addConstituent('lossybible');

boss.addFn({
  fn: lossyfortune.runLossyFortune,
  providers: {
    lossyfortune: provideRunLossyFortuneOptsForLossyFortune,
    lossybible: provideRunLossyFortuneOptsForLossyBible
  }
});

// Providers

function provideRunLossyFortuneOptsForLossyFortune(context, providerDone) {
  sendNextTick({
    fortuneSource: {
      fortune: asyncFortune
    },
  },
  providerDone);
}

function provideRunLossyFortuneOptsForLossyBible(context, providerDone) {
  sendNextTick({
    fortuneSource: {
      fortune: getFortuneFromBible
    }
  },
  providerDone);
}

// Fortune functions

function asyncFortune(done) {
  sendNextTick(fortune.fortune(), done);
}

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

// Utils

function sendNextTick(params, done) {
  process.nextTick(function callDone() {
    done(null, params);
  },
  0);  
}

module.exports = boss;
