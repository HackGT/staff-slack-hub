const { firstJson, secondJson, successJson, failureJson } = require('./views');
const { getEvents, getLocations, getEventData, getTypes, updateEvent } = require('../cms');

function addInteractions(slackInteractions, web, installer) {

    /* ------------------------------ SLACK ACTIONS ----------------------------- */

    slackInteractions.action({ actionId: 'schedule_open_primary' }, async (payload) => {
        const res = await web.views.open(firstJson(payload.trigger_id));
    });

    slackInteractions.action({ actionId: 'schedule_event_select' }, async (payload) => {
        let selected_event = payload.actions[0].selected_option;
        let data = await getEventData(selected_event.value);

        const res = await web.views.update(secondJson(payload.view.id, selected_event, data));
    });

    /* ------------------------- SLACK VIEW SUBMISSIONS ------------------------- */

    slackInteractions.viewSubmission('schedule_submit', async (payload) => {
        let queryInput = parseData(payload.view.state.values);
        queryInput.id = payload.view.private_metadata;

        const [err, data] = await updateEvent(queryInput);

        if (err) {
            return failureJson(err);
        } else {
            return successJson();
        }
    })

    /* ------------------------------ SLACK OPTIONS ----------------------------- */

    slackInteractions.options({ actionId: 'schedule_event_select' }, (payload) => {
        return getEvents(payload.value).catch(console.error);
    });

    slackInteractions.options({ actionId: "locationSelect" }, (payload) => {
        return getLocations().catch(console.error);
    });

    slackInteractions.options({ actionId: "typeSelect" }, (payload) => {
        return getTypes().catch(console.error);
    });
}

function parseData(data) {
    try {
        let parsed = {
            data: {
                name: data.name.nameInput.value,
                description: data.description.descriptionInput.value || '',
                startDay: data.startDay.startDayPicker.selected_date,
                startTime: data.startTime.startTimeSelect.selected_option.value,
                endDay: data.endDay.endDayPicker.selected_date,
                endTime: data.endTime.endTimeSelect.selected_option.value,
                location: {
                    connect: data.location.locationSelect.selected_options.map((option) => {
                        return {
                            "id": option.value
                        }
                    })
                },
                type: {
                    connect: {
                        id: data.type.typeSelect.selected_option.value
                    }
                }
            }
        }
        return parsed;
    } catch (error) {
        console.error(error);
    }
}

module.exports = {
    addInteractions
};