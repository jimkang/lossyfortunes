function createTranslationLogger(translationDoneCallback) {
  var entries = [];

  var translationLogger = {
    log: function translationLog(entry) {
      if (typeof entry.translationStep === 'object') {
        entries.push(entry.translationStep);
        console.log(entry);
        
        if (translationDoneCallback && entry.translationStep.translationEnded) {
          translationDoneCallback(entries);
        }
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
