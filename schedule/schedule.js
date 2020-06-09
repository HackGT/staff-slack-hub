const { firstJson, secondJson, successJson, failureJson } = require('./views');
const { getEvents, getLocations, getEventData, getTypes } = require('../cms');

function addInteractions(slackInteractions, web) {
    slackInteractions.action({ actionId: 'schedule_open_primary' }, async (payload) => {
        console.log('Opening Schedule');
        
        const res = await web.views.open(firstJson(payload.trigger_id));
    });

    slackInteractions.action({ actionId: 'schedule_event_select' }, async (payload) => {
        console.log('Event selected; Updating modal');

        let selected_event = payload.actions[0].selected_option;
        let data = await getEventData(selected_event.value);

        const res = await web.views.update(secondJson(payload.view.id, selected_event, data));
    });

    slackInteractions.viewSubmission('schedule_submit', async (payload) => {
        console.log('Schedule submitted');
    })

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

module.exports = {
    addInteractions
};