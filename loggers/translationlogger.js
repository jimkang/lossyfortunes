function createTranslationLogger() {
  var entries = [];

  var translationLogger = {
    log: function translationLog(entry) {
      if (typeof entry.translationStep === 'object') {
        entries.push(entry.translationStep);
        console.log(entry);
      }
      else {
        console.log.apply(console.log, arguments);
      }
    },
    getEntries: function getEntries() {
      return entries;
    }
  };

  return translationLogger;
}

module.exports = {
  createTranslationLogger: createTranslationLogger
};
