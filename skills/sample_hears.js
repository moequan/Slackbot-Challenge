/*
WHAT IS THIS?
This module demonstrates simple uses of Botkit's `hears` handler functions.
In these examples, Botkit is configured to listen for certain phrases, and then
respond immediately with a single line response.
*/
var wordfilter = require('wordfilter');
const fetch = require('node-fetch');
module.exports = function(controller) {
  /* Collect some very simple runtime stats for use in the uptime/debug command */
  var stats = {
    triggers: 0,
    convos: 0
  };
  controller.on('heard_trigger', function() {
    stats.triggers++;
  });
  controller.on('conversationStarted', function() {
    stats.convos++;
  });
  controller.hears(['^uptime', '^debug'], 'direct_message,direct_mention', function(bot, message) {
    bot.createConversation(message, function(err, convo) {
      if (!err) {
        convo.setVar('uptime', formatUptime(process.uptime()));
        convo.setVar('convos', stats.convos);
        convo.setVar('triggers', stats.triggers);
        convo.say(
          'My main process has been online for {{vars.uptime}}. Since booting, I have heard {{vars.triggers}} triggers, and conducted {{vars.convos}} conversations.'
        );
        convo.activate();
      }
    });
  });
  controller.hears(['^say (.*)', '^say'], 'direct_message,direct_mention', function(bot, message) {
    if (message.match[1]) {
      if (!wordfilter.blacklisted(message.match[1])) {
        bot.reply(message, message.match[1]);
      } else {
        bot.reply(message, '_sigh_');
      }
    } else {
      bot.reply(message, 'I will repeat whatever you say.');
    }
  });
  controller.hears(['^hello$'], 'direct_message,direct_mention', function(bot, message) {
    bot.reply(message, {
      attachments: [
        {
          title: 'Do you want to watcha movie with me? (◑␣ ◑)',
          callback_id: 'movie_select',
          attachment_type: 'default',
          actions: [
            {
              name: 'yes',
              text: 'Sure',
              value: 'yaas',
              type: 'button'
            },
            {
              name: 'no',
              text: 'Leave me alone machine!',
              value: 'nope',
              type: 'button'
            }
          ]
        }
      ]
    });
  });
  controller.on('interactive_message_callback', async function(bot, message) {
    const reply = message.actions[0].value;
    if (reply === 'yaas') {
      //GET A MOVIE
      const url = 'https://movies-api-coral.now.sh/movies/random';
      const data = await (await fetch(url)).json();
      bot.reply(message, `What about "${data.title}"`);
      bot.reply(message, `${data.url}`);
    } else {
      bot.reply(message, 'Cool, whatever, bye bye!!');
    }
  });
  /* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */
  /* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */
  /* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */
  /* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */
  /* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */
  /* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */
  /* Utility function to format uptime */
  function formatUptime(uptime) {
    var unit = 'second';
    if (uptime > 60) {
      uptime = uptime / 60;
      unit = 'minute';
    }
    if (uptime > 60) {
      uptime = uptime / 60;
      unit = 'hour';
    }
    if (uptime != 1) {
      unit = unit + 's';
    }
    uptime = parseInt(uptime) + ' ' + unit;
    return uptime;
  }
};
