var clockworkPair = require('./clockworkPair');
var assert = require('assert');
var _ = require('lodash');

function pickTranslationLocales(date, translationLocales, numberOfPairsToPick) {
  var hour = date.getHours();
  var day = date.getDate();
  var locales = [];
  var seed = day - 1;
  if (!numberOfPairsToPick) {
    numberOfPairsToPick = 3;
  }

  var indexes = [];

  for (var i = 0; i < numberOfPairsToPick; ++i) {
    indexes = indexes.concat(
      clockworkPair(translationLocales.length, seed + i * 2)
    );
  }

  // TODO: _.uniq is a stopgap fix here. Should figure out why duplicates are 
  // returned by clockworkPair.
  return _.uniq(indexes.map(function getLocaleForIndex(index) {
    return translationLocales[index];
  }));
}

module.exports = pickTranslationLocales;
