const { timeOptions } = require('../common');

const firstJson = (trigger_id) => {
    return {
        "trigger_id": trigger_id,
        "view": {
            "type": "modal",
            'notify_on_close': true,
            "callback_id": "buzzer_select_platforms",
            "title": {
                "type": "plain_text",
                "text": "Choose Platforms"
            },
            "close": {
                "type": "plain_text",
                "text": "Cancel",
                "emoji": true
            },
            "submit": {
                "type": "plain_text",
                "text": "Confirm",
                "emoji": true
            },
            "blocks": [
                {
                    "type": "input",
                    "block_id": "platforms",
                    "label": {
                        "type": "plain_text",
                        "text": "Which platform(s) would you like to notify?"
                    },
                    "element": {
                        "type": "multi_static_select",
                        "action_id": "platformsInput",
                        "placeholder": {
                            "type": "plain_text",
                            "text": "Select items",
                            "emoji": true
                        },
                        "options": [
                            {
                                "text": {
                                    "type": "plain_text",
                                    "text": "Live Site",
                                    "emoji": true
                                },
                                "value": "live_site"
                            },
                            {
                                "text": {
                                    "type": "plain_text",
                                    "text": "Twitter",
                                    "emoji": true
                                },
                                "value": "twitter"
                            },
                            {
                                "text": {
                                    "type": "plain_text",
                                    "text": "Slack",
                                    "emoji": true
                                },
                                "value": "slack"
                            },
                            {
                                "text": {
                                    "type": "plain_text",
                                    "text": "Mobile",
                                    "emoji": true
                                },
                                "value": "mobile"
                            },
                            {
                                "text": {
                                    "type": "plain_text",
                                    "text": "MapGT",
                                    "emoji": true
                                },
                                "value": "mapgt"
                            }
                        ]
                    }
                }
            ]
        }
    }
}

const secondJson = (selected_platforms) => {
    return {
        "response_action": "update",
        "view": {
            "type": "modal",
            "callback_id": "buzzer_submit",
            "notify_on_close": true,
            "title": {
                "type": "plain_text",
                "text": "Send Notifications",
                "emoji": true
            },
            "submit": {
                "type": "plain_text",
                "text": "Submit",
                "emoji": true
            },
            "close": {
                "type": "plain_text",
                "text": "Cancel",
                "emoji": true
            },
            "blocks": secondJsonBlocks(selected_platforms)
        }
    }
}

const secondJsonBlocks = (selected_platforms) => {
    let blocks = [];
    blocks.push(
        {
            "type": "input",
            "block_id": "none1",
            "element": {
                "type": "plain_text_input",
                "action_id": "message",
                "multiline": true,
                "placeholder": {
                    "type": "plain_text",
                    "text": "Enter your message here"
                }
            },
            "label": {
                "type": "plain_text",
                "text": "Message"
            }
        });
    for (let p in selected_platforms) {
        if (selected_platforms[p].value == "live_site") {
            blocks.push({
                "type": "divider",
                "block_id": "none2"
            });
            blocks.push({
                "type": "section",
                "block_id": "none3",
                "text": {
                    "type": "mrkdwn",
                    "text": "*Live Site*"
                }
            });
            blocks.push({
                "type": "input",
                "block_id": "live_site",
                "element": {
                    "type": "plain_text_input",
                    "action_id": "live_site_title",
                    "placeholder": {
                        "type": "plain_text",
                        "text": "Enter Title"
                    }
                },
                "label": {
                    "type": "plain_text",
                    "text": "Title",
                    "emoji": true
                }
            });
            // blocks.push({
            //     "type": "input",
            //     "block_id": "none4",
            //     "element": {
            //         "type": "plain_text_input",
            //         "action_id": "live_site_icon",
            //         "placeholder": {
            //             "type": "plain_text",
            //             "text": "Insert Icon"
            //         }
            //     },
            //     "label": {
            //         "type": "plain_text",
            //         "text": "Icon",
            //         "emoji": true
            //     }
            // });
        }
        if (selected_platforms[p].value == "twitter") {
            blocks.push({
                "type": "section",
                "block_id": "twitter",
                "text": {
                    "type": "mrkdwn",
                    "text": " "
                }
            });
        }
        if (selected_platforms[p].value == "slack") {
            blocks.push({
                "type": "divider",
                "block_id": "none8"
            });
            blocks.push({
                "type": "section",
                "block_id": "none9",
                "text": {
                    "type": "mrkdwn",
                    "text": "*Slack*"
                }
            });
            blocks.push({
                "type": "input",
                "block_id": "slack",
                "element": {
                    "type": "multi_external_select",
                    "action_id": "slack_channels",
                    "placeholder": {
                        "type": "plain_text",
                        "text": "Enter Channel",
                        "emoji": true
                    },
                    "initial_options": [{
                        text: {
                            type: "plain_text",
                            text: "#general"
                        },
                        value: "general"
                    }],
                    "min_query_length": 0
                },
                "label": {
                    "type": "plain_text",
                    "text": "Channel",
                    "emoji": true
                }
            });
            blocks.push({
                "type": "input",
                "block_id": "none10",
                "element": {
                    "type": "checkboxes",
                    "action_id": "slack_at",
                    "options": [
                        {
                            "text": {
                                "type": "plain_text",
                                "text": "@channel",
                                "emoji": true
                            },
                            "value": "channel"
                        },
                        {
                            "text": {
                                "type": "plain_text",
                                "text": "@here",
                                "emoji": true
                            },
                            "value": "here"
                        }
                    ]
                },
                "label": {
                    "type": "plain_text",
                    "text": " ",
                    "emoji": true
                },
                "optional": true
            });
        }
        if (selected_platforms[p].value == "mobile") {
            blocks.push({
                "type": "divider",
                "block_id": "none11"
            });
            blocks.push({
                "type": "section",
                "block_id": "none12",
                "text": {
                    "type": "mrkdwn",
                    "text": "*Mobile*"
                }
            });
            blocks.push({
                "type": "input",
                "block_id": "mobile",
                "element": {
                    "type": "plain_text_input",
                    "action_id": "mobile_header",
                    "placeholder": {
                        "type": "plain_text",
                        "text": "Enter header"
                    }
                },
                "label": {
                    "type": "plain_text",
                    "text": "Header",
                    "emoji": true
                }
            });
        }
        if (selected_platforms[p].value == "mapgt") {
            blocks.push({
                "type": "divider",
                "block_id": "none14"
            });
            blocks.push({
                "type": "section",
                "block_id": "none15",
                "text": {
                    "type": "mrkdwn",
                    "text": "*MapGT*"
                }
            });
            blocks.push(
                {
                    "type": "input",
                    "block_id": "mapgt",
                    "element": {
                        "type": "external_select",
                        "action_id": "mapgt_location",
                        "placeholder": {
                            "type": "plain_text",
                            "text": "Select location",
                            "emoji": true
                        },
                        "min_query_length": 0
                    },
                    "label": {
                        "type": "plain_text",
                        "text": "Location",
                        "emoji": true
                    },
                    "optional": true
                }
            );
            blocks.push({
                "type": "input",
                "block_id": "none16",
                "element": {
                    "type": "plain_text_input",
                    "action_id": "mapgt_title",
                    "placeholder": {
                        "type": "plain_text",
                        "text": "Enter title"
                    }
                },
                "label": {
                    "type": "plain_text",
                    "text": "Title",
                    "emoji": true
                }
            });
            blocks.push(
                {
                    "type": "input",
                    "block_id": "none17",
                    "element": {
                        "type": "static_select",
                        "action_id": "mapgt_time",
                        "placeholder": {
                            "type": "plain_text",
                            "text": "Select time",
                            "emoji": true
                        },
                        "options": timeOptions
                    },
                    "label": {
                        "type": "plain_text",
                        "text": "Time",
                        "emoji": true
                    }
                }
            );
        }
    }
    return blocks;
}

const successJson = () => {
    return {
        "response_action": "update",
        "view": {
            "type": "modal",
            "title": {
                "type": "plain_text",
                "text": "Buzzer Success"
            },
            "close": {
                "type": "plain_text",
                "text": "Done",
                "emoji": true
            },
            "blocks": [
                {
                    "type": "section",
                    "text": {
                        "type": "mrkdwn",
                        "text": "*Your buzzer notifications have been sent!*"
                    }
                }
            ]
        }
    }
}

const failureJson = (error) => {
    return {
        "response_action": "update",
        "view": {
            "type": "modal",
            "title": {
                "type": "plain_text",
                "text": "Buzzer Error"
            },
            "close": {
                "type": "plain_text",
                "text": "Done",
                "emoji": true
            },
            "blocks": [
                {
                    "type": "section",
                    "text": {
                        "type": "mrkdwn",
                        "text": "*:( There was an error sending your notification. Please contact a member of the tech team.*"
                    }
                }
            ]
        }
    }
}

module.exports = {
    firstJson,
    secondJson,
    successJson,
    failureJson
}