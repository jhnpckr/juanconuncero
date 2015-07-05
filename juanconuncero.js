var twit = require('twitter'),
    twitter = new twit({
      consumer_key: process.env.CONSUMER_KEY,
      consumer_secret: process.env.CONSUMER_SECRET,
      access_token_key: process.env.ACCESS_TOKEN_KEY,
      access_token_secret: process.env.ACCESS_TOKEN_SECRET
    }),
    https = require('https'),
    key = process.env.YANDEX_API_KEY;

String.prototype.rsplit = function(sep, maxsplit) {
    var split = this.split(sep);
    return maxsplit ? [ split.slice(0, -maxsplit).join(sep) ].concat(split.slice(-maxsplit)) : split;
}

var sendtweet = function(tweet) {
  if (tweet.length > 140) {
    var tweet1 = tweet.substr(0,137);
    tweet1 = tweet1.rsplit(' ', 1)[0];
    tweet2 = tweet.substr(tweet1.length+1);
    tweet1 = tweet1 + '...';
    tweet2 = '...' + tweet2;
    twitter.post('statuses/update', {status: tweet1},  function(error, tweetobj, response){
      if(error) throw error;
      console.log('Tweeted: ' + tweet1);
      twitter.post('statuses/update', {status: tweet2},  function(error, tweetobj, response){
        if(error) throw error;
        console.log('Tweeted: ' + tweet2);
      });
    });
  } else {
    twitter.post('statuses/update', {status: tweet},  function(error, tweetobj, response){
      if(error) throw error;
      console.log('Tweeted: ' + tweet);
    });
  }
}

var sendreply = function(tweet,status_id,screen_name) {
  console.log(tweet);
  console.log(status_id);
  console.log(screen_name);
  tweet = tweet.trim();
  tweet = '@' + screen_name + ' ' + tweet;
  if (tweet.length > 140) {
    var tweet1 = tweet.substr(0,137);
    tweet1 = tweet1.rsplit(' ', 1)[0];
    tweet2 = tweet.substr(tweet1.length+1);
    tweet1 = tweet1 + '...';
    tweet2 = '@' + screen_name + ' ' + '...' + tweet2;
    twitter.post('statuses/update', {status: tweet1, in_reply_to_status_id: status_id},  function(error, tweetobj, response){
      if(error) throw error;
      console.log('Tweeted: ' + tweet1);
      console.log(tweetobj);
      twitter.post('statuses/update', {status: tweet2, in_reply_to_status_id: status_id},  function(error, tweetobj, response){
        if(error) throw error;
        console.log('Tweeted: ' + tweet2);
      });
    });
  } else {
    twitter.post('statuses/update', {status: tweet, in_reply_to_status_id: status_id},  function(error, tweetobj, response){
      if(error) throw error;
      console.log('Tweeted: ' + tweet);
    });
  }
}

twitter.stream('statuses/filter', {follow: '19683971,2996730142'}, function(stream){

  stream.on('data', function(data){
    if (data.hasOwnProperty('text')) {
      if (data.user.id == 19683971 && data.text.substr(0,1) != '@') {
        https.get('https://translate.yandex.net//api/v1.5/tr.json/detect?key=' + key + '&text=' + encodeURIComponent(data.text), function(res) {
          res.on("data", function(detectlang) {
            var lang = JSON.parse(detectlang).lang;
            if (lang != 'es' && lang != '') {
              lang += '-es';
              https.get('https://translate.yandex.net//api/v1.5/tr.json/translate?key=' + key + "&lang=" + lang + '&text=' + encodeURIComponent(data.text), function(res) {
                res.on("data", function(translation) {
                  var tweet = JSON.parse(translation).text.pop();
                  sendtweet(tweet);
                });

              }).on('error', function(e) {
                console.error(e);
              });
            }
          });

        }).on('error', function(e) {
          console.error(e);
        });
      } else if (data.in_reply_to_user_id == 2996730142) {
        console.log(data.text);
        var text = data.text.replace('@juanconuncero ','');
        console.log(text);
        https.get('https://translate.yandex.net//api/v1.5/tr.json/detect?key=' + key + '&text=' + encodeURIComponent(text), function(res) {
          res.on("data", function(detectlang) {
            var lang = JSON.parse(detectlang).lang;
            if (lang != 'es' && lang != '') {
              lang += '-es';
              https.get('https://translate.yandex.net//api/v1.5/tr.json/translate?key=' + key + "&lang=" + lang + '&text=' + encodeURIComponent(text), function(res) {
                res.on("data", function(translation) {
                  var tweet = JSON.parse(translation).text.pop();
                  sendreply(tweet,data.id,data.user.screen_name);
                });

              }).on('error', function(e) {
                console.error(e);
              });
            }
          });

        }).on('error', function(e) {
          console.error(e);
        });
      }

      // console.log(data.text);
      // https.get('https://translate.yandex.net//api/v1.5/tr.json/detect?key=' + key + '&text=' + encodeURIComponent(data.text), function(res) {
      //
      //   res.on("data", function(chunk) {
      //     console.log(JSON.parse(chunk).lang);
      //   });
      //
      // }).on('error', function(e) {
      //   console.error(e);
      // });
      // stream.destroy();
    }


  });
});




// var tweet = "1. This text is over 140 characters. 2. This text is over 140 characters. 3. This text is over 140 characters. 4. This text is over 140 characters. 5. This text is over 140 characters."
// if (tweet.length > 140) {
//   var tweet1 = tweet.substr(0,137);
//   tweet1 = tweet1.rsplit(' ', 1)[0];
//   tweet2 = tweet.substr(tweet1.length+1);
//   tweet1 = tweet1 + '...';
//   tweet2 = '...' + tweet2;
//   console.log('Tweet is: ' + tweet);
//   console.log('Tweet 1 is: ' + tweet1);
//   console.log('Tweet 2 is: ' + tweet2);
// }
//
//
// twitter.post('statuses/update', {status: 'hola'},  function(error, tweet, response){
//   if(error) throw error;
//   console.log(tweet);  // Tweet body.
// });
//
//
//
//
// https.get('https://translate.yandex.net//api/v1.5/tr.json/detect?key=' + key + '&text=' + encodeURIComponent(txt), function(res) {
//
//   res.on("data", function(chunk) {
//     console.log(JSON.parse(chunk).lang);
//   });
//
// }).on('error', function(e) {
//   console.error(e);
// });
//
// var lang = 'en-es'
// var txt = 'What is this in Spanish?'
//
// https.get('https://translate.yandex.net//api/v1.5/tr.json/translate?key=' + key + "&lang=" + lang + '&text=' + encodeURIComponent(txt), function(res) {
//
//   res.on("data", function(chunk) {
//     console.log(JSON.parse(chunk).text.pop());
//   });
//
// }).on('error', function(e) {
//   console.error(e);
// });
