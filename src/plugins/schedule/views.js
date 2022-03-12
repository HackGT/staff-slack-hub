const { timeOptions } = require('../common');

const headerJson = (selected_event = undefined) => {
    return [
        {
            "type": "section",
            "text": {
                "type": "mrkdwn",
                "text": `*Choose an event to edit*`
            }
        },
        {
            "type": "actions",
            "elements": [
                {
                    "type": "external_select",
                    "action_id": "schedule_event_select",
                    "placeholder": {
                        "type": "plain_text",
                        "text": "Select event",
                        "emoji": true
                    },
                    "min_query_length": 0,
                    "initial_option": selected_event
                }
            ],
        }
    ]
}

const dividerJson = () => {
    return [
        {
            "type": "divider"
        }
    ]
}

// The data variable represents the initial value of the form
// If it is undefined, the form will have no initial values (ie. when creating an event)
const bodyJson = (data = undefined) => {
    return [
        {
            "type": "input",
            "block_id": "name",
            "element": {
                "type": "plain_text_input",
                "action_id": "nameInput",
                "initial_value": data ? data.name || '' : undefined,
                "placeholder": {
                    "type": "plain_text",
                    "text": "Enter event name"
                }
            },
            "label": {
                "type": "plain_text",
                "text": "Name",
                "emoji": true
            }
        },
        {
            "type": "input",
            "block_id": "description",
            "element": {
                "type": "plain_text_input",
                "action_id": "descriptionInput",
                "multiline": true,
                "initial_value": data ? data.description || '' : undefined,
                "placeholder": {
                    "type": "plain_text",
                    "text": "Enter event description"
                }
            },
            "label": {
                "type": "plain_text",
                "text": "Description",
                "emoji": true
            },
            "optional": true
        },
        {
            "type": "divider"
        },
        {
            "type": "input",
            "block_id": "startDay",
            "element": {
                "type": "datepicker",
                "action_id": "startDayPicker",
                "initial_date": data ? data.startDay || '' : undefined,
                "placeholder": {
                    "type": "plain_text",
                    "text": "Select start date",
                    "emoji": true
                }
            },
            "label": {
                "type": "plain_text",
                "text": "Start Time",
                "emoji": true
            }
        },
        {
            "type": "input",
            "block_id": "startTime",
            "element": {
                "type": "static_select",
                "action_id": "startTimeSelect",
                "initial_option": data ? {
                    "text": {
                        "type": "plain_text",
                        "text": data.startTime,
                        "emoji": true
                    },
                    "value": data.startTime
                } : undefined,
                "placeholder": {
                    "type": "plain_text",
                    "text": "Select start time",
                    "emoji": true
                },
                "options": timeOptions
            },
            "label": {
                "type": "plain_text",
                "text": " ",
                "emoji": true
            }
        },
        {
            "type": "divider"
        },
        {
            "type": "input",
            "block_id": "endDay",
            "element": {
                "type": "datepicker",
                "action_id": "endDayPicker",
                "initial_date": data ? data.endDay || '' : undefined,
                "placeholder": {
                    "type": "plain_text",
                    "text": "Select end date",
                    "emoji": true
                }
            },
            "label": {
                "type": "plain_text",
                "text": "End Time",
                "emoji": true
            }
        },
        {
            "type": "input",
            "block_id": "endTime",
            "element": {
                "type": "static_select",
                "action_id": "endTimeSelect",
                "initial_option": data ? {
                    "text": {
                        "type": "plain_text",
                        "text": data.endTime,
                        "emoji": true
                    },
                    "value": data.endTime
                } : undefined,
                "placeholder": {
                    "type": "plain_text",
                    "text": "Select end time",
                    "emoji": true
                },
                "options": timeOptions
            },
            "label": {
                "type": "plain_text",
                "text": " ",
                "emoji": true
            }
        },
        {
            "type": "divider"
        },
        {
            "type": "input",
            "block_id": "location",
            "element": {
                "type": "multi_external_select",
                "action_id": "locationSelect",
                "placeholder": {
                    "type": "plain_text",
                    "text": "Select event location",
                    "emoji": true
                },
                "initial_options": (data && data.location) ? data.location.map((location) => {
                    return {
                        "text": {
                            "type": "plain_text",
                            "text": location.name,
                            "emoji": true
                        },
                        "value": location.id
                    }
                }) : undefined,
                "min_query_length": 0
            },
            "label": {
                "type": "plain_text",
                "text": "Location",
                "emoji": true
            },
        },
        {
            "type": "input",
            "block_id": "type",
            "element": {
                "type": "external_select",
                "action_id": "typeSelect",
                "placeholder": {
                    "type": "plain_text",
                    "text": "Select event type",
                    "emoji": true
                },
                "initial_option": (data && data.type) ? {
                    "text": {
                        "type": "plain_text",
                        "text": data.type.name,
                        "emoji": true
                    },
                    "value": data.type.id
                } : undefined,
                "min_query_length": 0
            },
            "label": {
                "type": "plain_text",
                "text": "Type",
                "emoji": true
            },
        }
    ]
}

const firstJson = (trigger_id) => {
    return {
        "trigger_id": trigger_id,
        "view": {
            "type": "modal",
            'notify_on_close': true,
            "title": {
                "type": "plain_text",
                "text": "Edit Event"
            },
            "close": {
                "type": "plain_text",
                "text": "Cancel",
                "emoji": true
            },
            "blocks": headerJson()
        }
    }
}

const secondJson = (modal_id, selected_event, data) => {
    return {
        "view_id": modal_id,
        "view": {
            "type": "modal",
            "callback_id": "schedule_submit",
            'notify_on_close': true,
            "title": {
                "type": "plain_text",
                "text": "Edit Event"
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
            "private_metadata": selected_event.value,
            "blocks": headerJson(selected_event).concat(dividerJson(), bodyJson(data))
        }
    }
}

const successJson = () => {
    return {
        "response_action": "update",
        "view": {
            "type": "modal",
            "title": {
                "type": "plain_text",
                "text": "CMS Success"
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
                        "text": "*Yay! CMS was successfully updated.*"
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
                "text": "CMS Error"
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
                        "text": "*:( There was an error updating CMS. Please contact a member of the tech team.*"
                    }
                },
                {
                    "type": "section",
                    "text": {
                        "type": "mrkdwn",
                        "text": "Error: " + error
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