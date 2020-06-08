require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');

const scheduleChanger = require('./scheduleChanger/scheduleChanger');

const { errorJson, homeJson, homeJsonBlocks } = require('./views');

const { WebClient } = require('@slack/web-api');
const { createEventAdapter } = require('@slack/events-api');
const { createMessageAdapter } = require('@slack/interactive-messages');
const { InstallProvider } = require('@slack/oauth');

const ORGANIZER_CHANNEL = "schedule-bot-test";
const NAME_PREFIX = "[staff] ";

class NotAuthorizedError extends Error {
    constructor(message) {
        super(message);
        this.name = "NotAuthorizedError"
    }
}

mongoose.connect(process.env.MONGO_URL, { useNewUrlParser: true });

let db = mongoose.connection;
db.on('error', console.error.bind(console), 'MongoDB connection error:');

let Token = mongoose.model('Token', new mongoose.Schema({
    appId: String,
    team: {
        id: String,
        name: String
    },
    user: {
        token: String,
        id: String,
        scopes: [String]
    }
}));

const web = new WebClient(process.env.SLACK_BOT_TOKEN);
const slackEvents = createEventAdapter(process.env.SLACK_SIGNING_SECRET);
const slackInteractions = createMessageAdapter(process.env.SLACK_SIGNING_SECRET);
const installer = new InstallProvider({
    clientId: process.env.SLACK_CLIENT_ID,
    clientSecret: process.env.SLACK_CLIENT_SECRET,
    stateSecret: 'my-state-secret',
    installationStore: {
        storeInstallation: async (installation) => {
            const result = await web.users.conversations({
                token: installation.user.token,
                types: "private_channel"
            })
            if (result.channels.map((channel) => channel.name).includes(ORGANIZER_CHANNEL)) {
                let store = new Token(installation);

                store.save();
            } else {
                throw new NotAuthorizedError('Not staff');
            }
        },
        fetchInstallation: async (installQuery) => {
            let query = Token.findOne({
                "team.id": installQuery.teamId,
                "user.id": installQuery.userId
            });
            let result = await query.exec();
            if (!result || result == []) {
                return undefined;
            }
            return result;
        }
    }
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

app.post('/slack/hub', async (req, res) => {
    try {
        const installation = await installer.authorize({ teamId: req.body.team_id, userId: req.body.user_id });
        res.json({
            "response_type": "ephemeral",
            "text": "Here is a list of options."
        })
    } catch {
        let url = await installer.generateInstallUrl({
            scopes: ['channels:read', 'groups:read'],
            userScopes: ['users.profile:read', 'users.profile:write', 'chat:write', "groups:read"],
            metadata: req.body.response_url
        });
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
    }
});

const callbackOptions = {
    success: async (installation, installOptions, req, res) => {
        console.log(installOptions);
        console.log(installation);
        // const resp = await web.users.profile.get({
        //     token: installation.user.token
        // })
        // console.log(resp);

        res.send('Successful!');
    },
    failure: async (error, installOptions, req, res) => {
        if (error.name == "NotAuthorizedError") {
            res.send('Sorry, you are not authorized for this app.')
        } else {
            res.send('Sorry, a server error occurred.');
        }
    },
}

app.get('/slack/oauth-redirect', async (req, res) => {
    // Will save installation
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