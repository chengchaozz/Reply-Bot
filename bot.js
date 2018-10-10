console.log("Bot starting...");
const Mastodon = require('mastodon-api');
const fs = require('fs');
const ENV = require('dotenv');
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const server = app.listen(8082, listening);
const data = fs.readFileSync('ml5.json');
const jsondata = JSON.parse(data);
let replydata;
let acct;
let id;
console.log(jsondata);
ENV.config();

function listening() {
  console.log(`listening...`);
}
app.use(express.static('ml5'));
app.get('/all', sendAll);

function sendAll(request, response) {
  response.send(jsondata);
  jsondata.what = 'nothing';
}
app.use(bodyParser.urlencoded({
  extended: false
}))
app.use(bodyParser.json());



function analyze(request, response) {
  console.log(request.body);
  response.send('thank you')
  replydata = request.body.cc;
  const reply = `@${acct}${replydata}`;
  toot(reply, id);
  console.log(`replied`);
}
const M = new Mastodon({
  client_key: process.env.CLIENT_KEY,
  client_secret: process.env.CLIENT_SECRET,
  access_token: process.env.ACCESS_TOKEN,
  timeout_ms: 60 * 1000,
  api_url: 'https://botsin.space/api/v1/'
});

//toot();
//setInterval(toot, 5000);

// steaming api
const listener = M.stream('streaming/user')
listener.on('message', msg => {
  //fs.writeFileSync('data_user_event.json', JSON.stringify(msg, null, 2));
  //console.log(msg.data.status.content);
  //console.log(msg);
  if (msg.event === 'notification') {
    acct = msg.data.account.acct;
    app.post('/analyze', analyze);
    if (msg.data.type === 'follow') {
      toot(`@${acct} hahaha`);
    } else if (msg.data.type === 'mention') {
      const regex1 = /(like|favourite)/i;
      const content = msg.data.status.content;
      id = msg.data.status.id;
      //var what;
      jsondata.what = content;
      console.log(jsondata);
      const data = JSON.stringify(jsondata, null, 2);
      fs.writeFile('ml5.json', data, finish);

      function finish(err) {
        console.log('set');
      }
      if (regex1.test(content)) {
        M.post(`statuses/${id}/favourite`, (error, data) => {
          if (error) console.error(error);
          else console.log(`favorited ${data.id}`)
        })
      }
      const regex2 = /(reblog)/i;
      //const content = msg.data.status.content;
      //const id = msg.data.status.id;
      if (regex2.test(content)) {
        M.post(`statuses/${id}/reblog`, (error, data) => {
          if (error) console.error(error);
          else console.log(`rebloged ${data.id}`)
        })
      }
      const regex3 = /\?/i;
      if (regex3.test(content)) {
        const reply = `@${acct}${replydata}`;
        toot(reply, id);
        console.log(`replied`);
      }
    }

  }
});
listener.on('error', err => console.log(err));
//

//toot, post function
function toot(content, id) {
  const params = {
    status: content,
    in_reply_to_id: id
  }
  M.post('statuses', params, (error, data) => {
    if (error) {
      console.error(error);
    } else {
      // fs.writeFileSync('data.json', JSON.stringify(data, null, 2));
      // console.log(data);
      console.log(`id:${data.id}  time:${data.created_at}`);
      console.log(data.content);
    }

  });
}
//