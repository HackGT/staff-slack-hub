const { firstJson, secondJson, successJson, failureJson } = require('./views');
const { getLocations } = require('../cms');

const fetch = require('node-fetch');

function addInteractions(slackInteractions, web, installer) {

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
        let clients = [];
        for (const block of payload.view.blocks) {
            if (!block.block_id.includes('none')) {
                clients.push(block.block_id);
            }
        }

        const authorized = await installer.authorize({ teamId: payload.user.team_id, userId: payload.user.id });

        values = payload.view.state.values;
        // values = [...new Set(values)];
        let clientSchema = await generateSchema(clients, values, authorized.userToken);
        let clientSchemaJson = {}
        clientSchema.map(client => {
            let index = Object.keys(client)[0];
            clientSchemaJson[index] = client[index];
        })
        const res = await makeBuzzerRequest(values.none1.message.value, clientSchemaJson);

        if (res.status == 200) {
            return successJson();
        }

        console.error("Buzzer Error: " + res.statusText)
        return failureJson();
    })

    /* ------------------------------ SLACK OPTIONS ----------------------------- */

    slackInteractions.options({ actionId: 'mapgt_location' }, (payload) => {
        return getLocations().catch(console.error);
    })

    slackInteractions.options({ actionId: 'slack_channels' }, async (payload) => {
        const authorized = await installer.authorize({ teamId: payload.user.team_id, userId: payload.user.id });

        return await getConversations(payload.value, web, authorized.userToken).catch(console.error);
    })
}

async function generateSchema(clients, values, userToken) {
    schema = [];
    for (const client of clients) {
        if (client == 'live_site') {
            schema.push(
                {
                    "live_site": {
                        "title": values.live_site.live_site_title.value
                        // "icon": values.none4.live_site_icon.value || null
                    }
                }
            )
        }
        else if (client == 'twitter') {
            schema.push(
                {
                    "twitter": {
                        "_": true
                    }
                }
            )
        }
        else if (client == 'slack') {
            selected_options = values.none10.slack_at.selected_options;
            let at_channel = false
            let at_here = false
            let beardell_bot = false
            for (let o in selected_options) {
                if (selected_options[o].value == 'channel') {
                    at_channel = true;
                }
                if (selected_options[o].value == 'here') {
                    at_here = true;
                }
                if (selected_options[o].value == 'beardell') {
                    beardell_bot = true;
                }
            }
            schema.push(
                {
                    "slack": {
                        "channels": values.slack.slack_channels.selected_options.map(channel => channel.value),
                        "at_channel": at_channel,
                        "at_here": at_here,
                        "user_token": beardell_bot ? '' : userToken
                    }
                }
            )
        }
        else if (client == 'mobile') {
            schema.push(
                {
                    "f_c_m": {
                        "header": values.mobile.mobile_header.value,
                        "id": "general"
                    }
                }
            )
        }
        else if (client == 'mapgt') {
            schema.push(
                {
                    "mapgt": {
                        "area": values.mapgt.mapgt_location.selected_option.value || null,
                        "title": values.none16.mapgt_title.value,
                        "time": values.none17.mapgt_time.selected_option.value
                    }
                }
            )
        }
    }
    return schema
}

async function getConversations(query, web, userToken) {
    const result = await web.conversations.list({
        token: userToken,
        exclude_archived: true,
        limit: 300
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


async function makeBuzzerRequest(message, clientSchemaJson) {
    const queryMessage = `
        query send_message($message: String!, $plugins: PluginMaster!) {
            send_message(message: $message, plugins: $plugins) {
                plugin
                errors {
                    error
                    message
                }
            }
        }
    `;

    const res = await fetch(process.env.BUZZER_URL, {
        method: 'POST',
        headers: {
            'Content-Type': `application/json`,
            'Accept': `application/json`,
            'Authorization': 'Basic ' + process.env.BUZZER_ADMIN_KEY
        },
        body: JSON.stringify({
            query: queryMessage,
            variables: {
                "message": message,
                "plugins": clientSchemaJson
            }
        })
    })

    return res;
}

module.exports = {
    addInteractions
}