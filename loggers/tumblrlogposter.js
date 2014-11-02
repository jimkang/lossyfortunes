var Tumblrwks = require('tumblrwks');
var _ = require('lodash');

function createLogPoster() {
  var postTitle = '';

  function postEntries(opts) {
    var tumblr = new Tumblrwks(opts.config, opts.config.blog);

    // Start the body with a bunch of spaces so that when Tumblr automatically 
    // shares this to Twitter, none of the body is shown. Just the title.
    var body = _.range(120).map(space).join('') + 
      opts.logs.map(getHTMLForTranslationStep).join('\n<hr />\n');

    setTimeout(function runPost() {
      tumblr.post('/post', {
        type: 'text',
        title: postTitle,
        body: body
      },
      opts.done);
    },
    opts.config.tumblrDelay);
  }

  function getHTMLForTranslationStep(step) {
    var html = '';

    if (step) {
      if (step.initialText) {
        html = '<p>' + step.initialText + '</p>';
      }
      else {
        html += '<p>';

        if (step.from) {
          html += ('<b>' + step.from + '</b>');
        }
        if (step.to) {
          html += (' to ' + '<b>' + step.to + '</b>:');
        }

        html += '</p>';

        if (step.translation) {
          html += ('<p><i>' + step.translation + '</i></p>');
        }
      }
    }

    return html;
  }

  function setPostTitle(title) {
    postTitle = title + ' translations';
  }

  return {
    postEntries: postEntries,
    setPostTitle: setPostTitle
  };
}

function space() {
  return '&nbsp;'
}

module.exports = {
  createLogPoster: createLogPoster
};
