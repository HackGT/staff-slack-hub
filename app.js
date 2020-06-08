require('dotenv').config();

const express = require('express');

const scheduleChanger = require('./scheduleChanger/scheduleChanger');

const { homeJson, homeJsonBlocks } = require('./views');

const { WebClient } = require('@slack/web-api');
const { createEventAdapter } = require('@slack/events-api');
const { createMessageAdapter } = require('@slack/interactive-messages');
const { InstallProvider } = require('@slack/oauth');

const web = new WebClient(process.env.SLACK_BOT_TOKEN);
const slackEvents = createEventAdapter(process.env.SLACK_SIGNING_SECRET);
const slackInteractions = createMessageAdapter(process.env.SLACK_SIGNING_SECRET);
const installer = new InstallProvider({
    clientId: process.env.SLACK_CLIENT_ID,
    clientSecret: process.env.SLACK_CLIENT_SECRET,
    stateSecret: 'my-state-secret'
});

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

app.use(express.urlencoded({ extended: true }));

app.post('/slack/promote', async (req, res) => {
    console.log('Promoting user');
    let url = await installer.generateInstallUrl({
        scopes: ['channels:read', 'groups:read'],
        userScopes: ['users.profile:read', 'users.profile:write', 'chat:write']
    });
    console.log(url);
    console.log(req.body);
    res.json({
        "response_type": "ephemeral",
        "text": `To use the Staff Hub, I need your permission first:`,
        "attachments": [{
            "fallback": url,
            "actions": [
                {
                    type: "button",
                    text: "Authorize via Slack",
                    url
                }
            ]
        }]
    });
});

const callbackOptions = {
    success: async (installation, installOptions, req, res) => {
        console.log(installation);
        const resp = await web.users.profile.get({
            token: installation.user.token
        })
        console.log(resp);

        res.send('successful!');
    },
    failure: async (error, installOptions, req, res) => {
        console.log(error);
        res.send('failure');
    },
}

app.get('/slack/oauth-redirect', async (req, res) => {
    await installer.handleCallback(req, res, callbackOptions);
})

app.get('/*', (req, res) => {
    res.send("Default get");

    console.log(req.url);
    console.log('Loading get');
})

app.post('/*', (req, res) => {
    res.send("Default post");

    console.log(req.url);
    console.log('Loading post');
})

app.listen(process.env.PORT, () => {
    console.log('App listening on port ' + process.env.PORT);
}) 