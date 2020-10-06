require('dotenv').config();

const express = require('express');

const schedule = require('./plugins/schedule/slack');
const profile = require('./plugins/profile/slack');
const buzzer = require('./plugins/buzzer/slack');

const { homeJson, homeJsonBlocks, permissionJson, unauthorizedHomeJson } = require('./views');

const { WebClient } = require('@slack/web-api');
const { createEventAdapter } = require('@slack/events-api');
const { createMessageAdapter } = require('@slack/interactive-messages');
const { InstallProvider } = require('@slack/oauth');

const config = require('./config.json');
const { NotAuthorizedError, Token } = require('./db');

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
            if (result.channels.map((channel) => channel.name).includes(config.organizerChannel)) {
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

slackEvents.on('app_home_opened', async (event) => {
    try {
        const authorized = await installer.authorize({ teamId: event.view.team_id, userId: event.user });

        const res = await web.views.publish(homeJson(event.user));
    } catch (error) {
        const res = await web.views.publish(unauthorizedHomeJson(event.user));
    }
})

slackEvents.on('error', console.error);

app.use('/slack/actions', slackInteractions.requestListener());

schedule.addInteractions(slackInteractions, web, installer);
profile.addInteractions(slackInteractions, web, installer);
buzzer.addInteractions(slackInteractions, web, installer);

app.use(express.urlencoded({ extended: true }));

app.post('/slack/hub', async (req, res) => {
    try {
        const authorized = await installer.authorize({ teamId: req.body.team_id, userId: req.body.user_id });

        res.json({ "blocks": homeJsonBlocks() })
    } catch {
        let url = await installer.generateInstallUrl({
            scopes: ['channels:read', 'groups:read'],
            userScopes: ['users.profile:read', 'users.profile:write', 'chat:write', "groups:read"],
            metadata: req.body.response_url
        });
        res.json(permissionJson(url));
    }
});

// Generate URL to install Slack App to new workspace
app.get('/installation', async (req, res) => {
    let url = await installer.generateInstallUrl({
        scopes: ['channels:history', 'channels:join', 'chat:write', 'commands', 'groups:history', 'groups:read', 'im:history', 'usergroups:read'],
    });
    res.redirect(url);
});

const callbackOptions = {
    success: async (installation, installOptions, req, res) => {
        // Uncomment below to auto start profile setting when user first authenticates
        // profile.setNameAndImage(web, installation.user.token, installOptions.metadata);

        res.send('Successful! Please return to Slack to see the options.');
    },
    failure: async (error, installOptions, req, res) => {
        console.error(error);
        if (error.name == "NotAuthorizedError") {
            res.send('Sorry, only organizers can use this app.')
        } else {
            res.send('Sorry, a server error occurred.');
        }
    },
}

app.get('/slack/oauth-redirect', async (req, res) => {
    // Will save installation in db
    await installer.handleCallback(req, res, callbackOptions);
})

app.get('/*', (req, res) => {
    res.send("Default get");

    console.log('GET Request: ' + req.url);
})

app.post('/*', (req, res) => {
    res.send("Default post");

    console.log('POST Request: ' + req.url);
})

app.listen(process.env.PORT, () => {
    console.log('App listening on port ' + process.env.PORT);
})
