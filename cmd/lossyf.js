var lossyfortune = require('../lossyfortune');
var translationLocales = require('../translationLocales');
var request = require('request');
var hph = require('homophonizer');
var queue = require('queue-async');

var opts = {
  locales: translationLocales,
  date: new Date(2014, 9, ~~(Math.random() * 30), 22, 15, 0, 0),
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

var homophonizer = hph.phoneme.createHomophonizer();

opts.translator = function homophoneTranslator(params, translateDone) {
  var q = queue();
  var words = params.text.split(' ');
  words.forEach(function queueTranslation(word) {
    var word = word.replace(/[\.\-\,\?]/g, '');
    console.log('queuing word:', word);
    q.defer(homophonizer.getHomophones, word);
  });

  q.awaitAll(function done(error, translatedWords) {
    if (error) {
      console.log(error);
    }
    else {
      translatedWords = translatedWords.map(function getLast(words) {
        return words[words.length - 1]; 
      });


      translateDone(error, translatedWords.join(' '));
    }
  });
};

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

opts.fortuneSource = {
  // fortune: getFortuneFromBible
  
  fortune: function get(done) {
    setTimeout(function () {
  //     // done(null, 'Make conscientiousness and sincerity your grand object. Have no friends not equal to yourself. If you have done wrong, be not ashamed to make amends.');
      // done(null, 'Two of my currently-open browser tabs are pie recipes and most of the rest are lyrics to pop songs I\'ve been trying to sing to the babby');
  //     done(null, '[Intro: RZA]/See, sometimes/You gotta flash em back/See niggas don\'t know where this shit started/Y\'all know where it came from/I\'m saying we gonna take y\'all back to the source/Do the knowledge... yo!//[Hook: RZA, GZA]/When the MCs came to live out the name and to perform/Some had to snort cocaine to act insane before Pete Rock-ed it on/Now on with the mental plane to spark the brain with the building to be born/Yo RZA flip the track with the what to cut...//[Verse 1: GZA]/Fake niggas get flipped/In mic fights I swing swords and cut clowns/Shit is too swift to bite you record and write it down/I flow like the blood on a murder scene, like a syringe/On some wild out shit, to insert a fiend/But it was your op the shop stolen art/Catch a swollen heart from not rolling smart/I put mad pressure, on phony wack rhymes that get hurt/Shit\'s played like zodiac signs on sweatshirt/That\'s minimum, and feminine like sandals/My minimum table stacks a verse on a gamble/Energy is felt once the cards are dealt/With the impact of roundhouse kicks from black belts/That attack, the mic-fones like cyclones or typhoon/I represent from midnight to high noon/I don\'t waste ink, nigga I think/I drop megaton bombs more faster than you blink/Cause rhyme thoughts travel at a tremendous speed/Clouds of smoke, of natural blends of weed/Only under one circumstance that\'s if I\'m blunted/Turn that shit up, my clan in the front want it//[Hook]//[Verse 2: GZA]/I\'m on a mission that niggas say is impossible/But when I swing my swords they all choppable/I be the body dropper, the heartbeat stopper/Child educator, plus head amputator/Cause niggas styles are old like Mark 5 sneakers/Lyrics are weak like clock radio speakers/Don\'t even stop in my station and attack/While your plan failed, get derailed like Amtrak/What the fuck for? Down by law, I make law/I be justice, I sentence that ass two to four/Round the clock, that state pen time check it/With the pens I be sticking but you can\'t stick to crime/Came through with the Wu, slid off on the DL/I\'m low-key like seashells, I rock these bells/Now come aboard, it\'s Medina bound/Enter the chamber, and it\'s a whole different sound/It\'s a wide entrance, small exit like a funnel/So deep it\'s picked up on radios in tunnels/Niggas are fascinated how the shit begin/Get vaccinated, my logo is branded in your skin')
      // done(null, 'A pacifier setup is just one of those processes you need to go through with someone else a few times.');
      // done(null, 'So, my new Zojirushi rice cooker plays "Twinkle Twinkle" when it starts up. This feature would\'ve bowled me over in a 1976 Sears Wishbook.');
      // done(null, 'I would love to hear an NPR book review that didn\'t take the tone of Mr. Rogers pimping cauliflower to three-year-olds.');
      // done(null, 'Moreover, the skilful soldier in a secure position does not let pass the moment when the enemy should be attacked.');
      done(null, 'Come, you see plots everywhere. Who would dare to open your mail?');
      // done(null, 'psoriasis. no matter how many ways i try to cover up, my psoriasis keeps showing up http://archive.org/download/CNNW_20131026_220000_The_Situation_Room/CNNW_20131026_220000_The_Situation_Room.thumbs/CNNW_20131026_220000_The_Situation_Room_000526.jpg');
    },
    0);
  }
};

lossyfortune.runLossyFortune(opts);
