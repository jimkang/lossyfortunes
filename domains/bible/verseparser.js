// http://labs.bible.org/api/?passage=random format.
var verseRegExp = /<b>(.*)<\/b>\s+(.*)/;

function parse(verse) {
  var result = verse.match(verseRegExp);
  var parsed;

  if (result && result.length === 3) {
    var captured = result.slice(1);
    parsed = {
      citation: captured[0],
      text: captured[1]
    };
  }

  return parsed;
}

module.exports = {
  parse: parse
};
