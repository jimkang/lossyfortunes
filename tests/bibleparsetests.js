var assert = require('assert');
var verseparser = require('../domains/bible/verseparser');

var parsingsForVerses = [
  {
    verse: '<b>Isaiah 48:2</b> Indeed, they live in the holy city; they trust in the God of Israel, whose name is the Lord who commands armies.',
    parsing: {
      citation: 'Isaiah 48:2',
      text: 'Indeed, they live in the holy city; they trust in the God of Israel, whose name is the Lord who commands armies.'
    }
  },
  {
    verse: '<b>1 Chronicles 29:28</b> He died at a good old age, having enjoyed long life, wealth, and honor. His son Solomon succeeded him.',
    parsing: {
      citation: '1 Chronicles 29:28',
      text: 'He died at a good old age, having enjoyed long life, wealth, and honor. His son Solomon succeeded him.'
    }
  },
  {
    verse: '<b>Esther 1:16</b> Memucan then replied to the king and the officials, “The wrong of Queen Vashti is not against the king alone, but against all the officials and all the people who are throughout all the provinces of King Ahasuerus.',
    parsing: {
      citation: 'Esther 1:16',
      text: 'Memucan then replied to the king and the officials, “The wrong of Queen Vashti is not against the king alone, but against all the officials and all the people who are throughout all the provinces of King Ahasuerus.'
    }
  }
];

describe('verseparser', function bibleParseSuite() {
  it('should parse the verses correctly', function testParse() {
    parsingsForVerses.forEach(function parseAndCheck(pair) {
      var parsed = verseparser.parse(pair.verse);
      assert.equal(parsed.citation, pair.parsing.citation);
      assert.equal(parsed.text, pair.parsing.text);
    });
  });
});
