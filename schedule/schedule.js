const { firstJson, secondJson, successJson, failureJson } = require('./views');
const { getEvents, getAreas, getEventData } = require('../cms');

function addInteractions(slackInteractions, web) {
    slackInteractions.action({ actionId: 'schedule_open_primary' }, async (payload) => {
        console.log('Opening Schedule');
        const res = await web.views.open(firstJson(payload.trigger_id));
    });

    slackInteractions.action({ actionId: 'schedule_event_select' }, async (payload) => {
        console.log('Event selected; Updating modal');

        let selected_event = payload.actions[0].selected_option;
        let data = await getEventData(selected_event.value);

        data.startDate = new Date(data.start_time);
        data.endDate = new Date(data.end_time);

        const res = await web.views.update(secondJson(payload.view.id, selected_event, data));
    });

    slackInteractions.options({ actionId: 'schedule_event_select' }, (payload) => {
        console.log('Getting events');

        return getEvents(payload.value).catch(console.error);
    });

    slackInteractions.options({ actionId: "areaSelect" }, (payload) => {
        console.log('Getting areas');

        return getAreas().catch(console.error);
    });
}

module.exports = {
    addInteractions
};