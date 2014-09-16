var assert = require('assert');
var translatron = require('../translatron');
var locales = require('../translationLocales');
var sinon = require('sinon');

describe('makeLossyRetranslation', function makeLossyRetranslationSuite() {
  var day25Locales = [locales[0], locales[2]]
  var day25Date = new Date(2014, 9, 25, 22, 15, 0, 0);

  var pickTranslationLocalesStub = sinon.stub();
  pickTranslationLocalesStub.returns(day25Locales);

  var translatorStub = sinon.stub();

  var translateChainStub = sinon.stub();
  translateChainStub.callsArgWith(3, null, 'Dr. Wiley is a friend bonus cat');

  it('should return text', function basicTest(testDone) {
    var targetText = 'Dr. Wily is a friend of Bonus Cat';
    var translatorStub = sinon.stub();

    var retranslationParams = {
      translateChain: translateChainStub,
      pickTranslationLocales: pickTranslationLocalesStub,
      translator: translatorStub,
      text: targetText,
      baseLocale: 'en',
      locales: locales,
      date: day25Date,
      done: checkRetranslationResult
    };

    translatron.makeLossyRetranslation(retranslationParams);

    function checkRetranslationResult(error, retranslation) {
      assert.ok(!error, error);

      assert.ok(pickTranslationLocalesStub.calledWith(day25Date, locales),
        'pickTranslationLocales not called.');

      assert.ok(translateChainStub.calledWith(
        translatorStub, targetText, day25Locales, checkRetranslationResult
      ), 'translateChain not called');

      assert.equal(retranslation, 'Dr. Wiley is a friend bonus cat');
      testDone();      
    }
  });

});
