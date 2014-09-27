var fortuneSource = require('fortune-tweetable');
var MsTranslator = require('mstranslator');

// Second parameter to constructor (true) indicates that 
// the token should be auto-generated.
var client = new MsTranslator({
  client_id: "goodluck"
  , client_secret: "5KsTQ6QnXoFDtj835/rZKA0NP34jcOm1XkH/j6ji+z4="
}, true);

var fortune = fortuneSource.fortune();
// fortune = 'fortune translation robot';
console.log(fortune);

var params = { 
  text: fortune //'How\'s it going?'
  , from: 'en'
  , to: 'fr'
};

// Don't worry about access token, it will be auto-generated if needed.
client.translate(params, function(err, data) {
  console.log(data);
  client.translate({
    text: data,
    from: 'fr',
    to: 'en'
  },
  function useReverseTranslation(err, data) {
    console.log(data);
  }
  )
});


// var languages;

// client.getLanguagesForTranslate(function saveLanguages(error, data) {
//   languages = data;
//   console.log(languages);
// });

 // 'ar',
 //  'bg',
 //  'ca',
 //  'zh-CHS',
 //  'zh-CHT',
 //  'cs',
 //  'da',
 //  'nl',
 //  'en',
 //  'et',
 //  'fi',
 //  'fr',
 //  'de',
 //  'el',
 //  'ht',
 //  'he',
 //  'hi',
 //  'mww',
 //  'hu',
 //  'id',
 //  'it',
 //  'ja',
 //  'tlh',
 //  'tlh-Qaak',
 //  'ko',
 //  'lv',
 //  'lt',
 //  'ms',
 //  'mt',
 //  'no',
 //  'fa',
 //  'pl',
 //  'pt',
 //  'ro',
 //  'ru',
 //  'sk',
 //  'sl',
 //  'es',
 //  'sv',
 //  'th',
 //  'tr',
 //  'uk',
 //  'ur',
 //  'vi',
 //  'cy' ]
