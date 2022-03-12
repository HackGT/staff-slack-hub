const homeJson = (user) => {
    return {
        "user_id": user,
        "view": {
            "type": "home",
            "title": {
                "type": "plain_text",
                "text": "Staff Hub",
                "emoji": true
            },
            "blocks": homeJsonBlocks()
        }
    }
}

const homeJsonBlocks = () => {
    return [
        {
            "type": "section",
            "text": {
                "type": "mrkdwn",
                "text": "*What would you like to do?*"
            }
        },
        {
            "type": "divider"
        },
        {
            "type": "section",
            "text": {
                "type": "mrkdwn",
                "text": "*Update Schedule* - Edit CMS events"
            },
            "accessory": {
                "type": "button",
                "text": {
                    "type": "plain_text",
                    "text": "Select",
                    "emoji": true
                },
                "style": "primary",
                "action_id": "schedule_open_primary"
            }
        },
        // {
        //     "type": "section",
        //     "text": {
        //         "type": "mrkdwn",
        //         "text": "*Send Notification* - Use buzzer to send announcements"
        //     },
        //     "accessory": {
        //         "type": "button",
        //         "text": {
        //             "type": "plain_text",
        //             "text": "Select",
        //             "emoji": true
        //         },
        //         "style": "primary",
        //         "action_id": "buzzer_open_primary"
        //     }
        // },
        {
            "type": "section",
            "text": {
                "type": "mrkdwn",
                "text": "*Promote User* - Add a name prefix and hackathon organizer overlay"
            },
            "accessory": {
                "type": "button",
                "text": {
                    "type": "plain_text",
                    "text": "Select",
                    "emoji": true
                },
                "style": "primary",
                "action_id": "profile_run"
            }
        }
    ]
}

const unauthorizedHomeJson = (user) => {
    return {
        "user_id": user,
        "view": {
            "type": "home",
            "title": {
                "type": "plain_text",
                "text": "Staff Hub",
                "emoji": true
            },
            "blocks": [
                {
                    "type": "section",
                    "text": {
                        "type": "mrkdwn",
                        "text": "*Please activate the app with the slash command first to see the available actions.*"
                    }
                }
            ]
        }
    }
}

const permissionJson = (url) => {
    return {
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
    }
}

module.exports = {
    homeJson,
    homeJsonBlocks,
    unauthorizedHomeJson,
    permissionJson
}