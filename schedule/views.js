const dateformat = require('dateformat');

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
            "block_id": "title",
            "element": {
                "type": "plain_text_input",
                "action_id": "titleInput",
                "initial_value": data ? data.title || '' : undefined,
                "placeholder": {
                    "type": "plain_text",
                    "text": "Enter event title"
                }
            },
            "label": {
                "type": "plain_text",
                "text": "Title",
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
            "block_id": "startDate",
            "element": {
                "type": "datepicker",
                "action_id": "startDatePicker",
                "initial_date": data ? dateformat(data.startDate, 'UTC:yyyy-mm-dd') : undefined,
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
                        "text": dateformat(data.startDate, 'UTC:h:MM TT'),
                        "emoji": true
                    },
                    "value": dateformat(data.startDate, 'UTC:h:MM TT')
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
            "block_id": "endDate",
            "element": {
                "type": "datepicker",
                "action_id": "endDatePicker",
                "initial_date": data ? dateformat(data.endDate, 'UTC:yyyy-mm-dd') : undefined,
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
                        "text": dateformat(data.endDate, 'UTC:h:MM TT'),
                        "emoji": true
                    },
                    "value": dateformat(data.endDate, 'UTC:h:MM TT')
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
            "block_id": "area",
            "element": {
                "type": "external_select",
                "action_id": "areaSelect",
                "placeholder": {
                    "type": "plain_text",
                    "text": "Select event location",
                    "emoji": true
                },
                "initial_option": (data && data.area) ? {
                    "text": {
                        "type": "plain_text",
                        "text": data.area.name,
                        "emoji": true
                    },
                    "value": data.area.id
                } : undefined,
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
                "type": "static_select",
                "action_id": "typeSelect",
                "placeholder": {
                    "type": "plain_text",
                    "text": "Select event type",
                    "emoji": true
                },
                "initial_option": (data && data.type) ? {
                    "text": {
                        "type": "plain_text",
                        "text": data.type.capitalize(),
                        "emoji": true
                    },
                    "value": data.type
                } : undefined,
                "options": [
                    {
                        "text": {
                            "type": "plain_text",
                            "text": "Workshop",
                            "emoji": true
                        },
                        "value": "workshop"
                    },
                    {
                        "text": {
                            "type": "plain_text",
                            "text": "Talk",
                            "emoji": true
                        },
                        "value": "talk"
                    },
                    {
                        "text": {
                            "type": "plain_text",
                            "text": "Minievent",
                            "emoji": true
                        },
                        "value": "minievent"
                    },
                    {
                        "text": {
                            "type": "plain_text",
                            "text": "Meal",
                            "emoji": true
                        },
                        "value": "meal"
                    },
                    {
                        "text": {
                            "type": "plain_text",
                            "text": "Other",
                            "emoji": true
                        },
                        "value": "other"
                    },
                ]
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
    console.log('here')
    return {
        "view_id": modal_id,
        "view": {
            "type": "modal",
            "callback_id": "edit_modal_callback_id",
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
                        "text": "*:( There was an error updating CMS. Please contact a member of the tech team*"
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