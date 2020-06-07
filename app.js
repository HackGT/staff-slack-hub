require('dotenv').config();

const express = require('express');

const scheduleChanger = require('./scheduleChanger/scheduleChanger');

const { homeJson, homeJsonBlocks } = require('./views');

const { WebClient } = require('@slack/web-api');
const { createEventAdapter } = require('@slack/events-api');
const { createMessageAdapter } = require('@slack/interactive-messages');

const web = new WebClient(process.env.SLACK_BOT_TOKEN);
const slackEvents = createEventAdapter(process.env.SLACK_SIGNING_SECRET);
const slackInteractions = createMessageAdapter(process.env.SLACK_SIGNING_SECRET);

const app = express();

app.use('/slack/events', slackEvents.requestListener())

slackEvents.on('message', (event) => {
    console.log(`Received a message event: user ${event.user} in channel ${event.channel} says ${event.text}`);
})

slackEvents.on('app_home_opened', async (event) => {
    const res = await web.views.publish(homeJson(event.user));
})

slackEvents.on('error', console.error);

scheduleChanger(slackInteractions, web);

app.get('/*', (req, res) => {
    res.send("Default get");

    console.log('Loading get');
})

app.post('/*', (req, res) => {
    res.send("Default post");
    console.log('Loading post');
})

app.listen(process.env.PORT, () => {
    console.log('App listening on port ' + process.env.PORT);
}) 