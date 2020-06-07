const homeJson = (user) => {
    return {
        "user_id": user,
        "view": {
            "type": "home",
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
                "text": "*CMS Changes: What would you like to do?*"
            }
        },
        {
            "type": "divider"
        },
        {
            "type": "section",
            "text": {
                "type": "mrkdwn",
                "text": ":calendar: *Create a new event*"
            },
            "accessory": {
                "type": "button",
                "text": {
                    "type": "plain_text",
                    "text": "Create event",
                    "emoji": true
                },
                "style": "primary",
                "action_id": "open_modal",
                "value": "create"
            }
        },
        {
            "type": "divider"
        },
        {
            "type": "section",
            "text": {
                "type": "mrkdwn",
                "text": ":pencil: *Edit an event*"
            },
            "accessory": {
                "type": "button",
                "text": {
                    "type": "plain_text",
                    "text": "Edit event",
                    "emoji": true
                },
                "style": "primary",
                "action_id": "open_modal",
                "value": "edit"
            }
        },
        {
            "type": "divider"
        },
        {
            "type": "section",
            "text": {
                "type": "mrkdwn",
                "text": ":x: *Delete an event*"
            },
            "accessory": {
                "type": "button",
                "text": {
                    "type": "plain_text",
                    "text": "Delete event",
                    "emoji": true
                },
                "style": "primary",
                "action_id": "open_modal",
                "value": "delete"
            }
        }
    ]
}

module.exports = {
    homeJson,
    homeJsonBlocks
}