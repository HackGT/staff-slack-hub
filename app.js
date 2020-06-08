require('dotenv').config();

const express = require('express');

const schedule = require('./schedule/schedule');
const profile = require('./profile/profile');
const buzzer = require('./buzzer/buzzer');

const { errorJson, homeJson, homeJsonBlocks, permissionJson, unauthorizedHomeJson } = require('./views');
const { web, slackEvents, slackInteractions, installer } = require('./slack');

const app = express();

app.use('/slack/events', slackEvents.requestListener())

slackEvents.on('message', (event) => {
    console.log(`Received a message event: user ${event.user} in channel ${event.channel} says ${event.text}`);
})

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

schedule.addInteractions(slackInteractions, web);
profile.addInteractions(slackInteractions, web);
buzzer.addInteractions(slackInteractions, web);

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

const callbackOptions = {
    success: async (installation, installOptions, req, res) => {
        profile.setNameAndImage(web, installation.user.token, installOptions.metadata);

        res.send('Successful!');
    },
    failure: async (error, installOptions, req, res) => {
        console.log(error);
        if (error.name == "NotAuthorizedError") {
            res.send('Sorry, you are not authorized for this app.')
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