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


module.exports = {
    web,
    slackEvents,
    slackInteractions,
    installer
}