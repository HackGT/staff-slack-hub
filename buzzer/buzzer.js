const { firstJson, secondJson, successJson, failureJson } = require('./views');
const { getLocations } = require('../cms');

function addInteractions(slackInteractions, web) {

    /* ------------------------------ SLACK ACTIONS ----------------------------- */

    slackInteractions.action({ actionId: 'buzzer_open_primary' }, async (payload) => {
        const res = await web.views.open(firstJson(payload.trigger_id));
    })

    /* ------------------------- SLACK VIEW SUBMISSIONS ------------------------- */

    slackInteractions.viewSubmission('buzzer_select_platforms', async (payload) => {
        const selectedPlatforms = payload.view.state.values.platforms.platformsInput.selected_options;

        return secondJson(selectedPlatforms);
    })

    slackInteractions.viewSubmission('buzzer_submit', async (payload) => {
        console.log('Submitted');
    })

    /* ------------------------------ SLACK OPTIONS ----------------------------- */

    slackInteractions.options({ actionId: 'mapgt_location' }, (payload) => {
        return getLocations().catch(console.error);
    })

    slackInteractions.options({ actionId: 'slack_channels' }, (payload) => {
        return getConversations(payload.value, web).catch(console.error);
    })
}

async function getConversations(query, web) {
    const result = await web.conversations.list({
        token: process.env.SLACK_BOT_TOKEN,
        exclude_archived: true,
        limit: 258
    });

    convos = [];

    result.channels.forEach((conversation) => {
        convos.push(conversation["name"])
    });
    convos = convos.filter((event) => {
        return event.toLowerCase().replace(/\s/g, '').includes(query.toLowerCase().replace(/\s/g, ''));
    });

    let options = {
        "options": []
    };

    for (channel of convos) {
        options.options.push({
            text: {
                type: "plain_text",
                text: "#" + channel
            },
            value: channel
        })
    }
    
    return options;
}

module.exports = {
    addInteractions
}