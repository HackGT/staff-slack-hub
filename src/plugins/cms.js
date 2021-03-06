const fetch = require('node-fetch');
const { DateTime } = require('luxon');

const { eventsQuery, locationsQuery, typesQuery, eventDataQuery, tagsQuery, updateEventMutation } = require('./queries');

// Slack will not display options data if text or value is greater than 75 characters so it must be shortened
String.prototype.trunc = String.prototype.trunc ||
    function (n) {
        return (this.length > n) ? this.substr(0, n - 1) + '...' : this;
    };

String.prototype.capitalize = String.prototype.capitalize ||
    function () {
        return this.charAt(0).toUpperCase() + this.slice(1);
    };

async function makeCMSRequest(query, variables = {}) {
    headers = {
        "Content-Type": `application/json`,
        Accept: `application/json`
    }
    headers['Authorization'] = `Bearer ${process.env.CMS_TOKEN}`

    const res = await fetch(process.env.CMS_URL, {
        method: "POST",
        headers: headers,
        body: JSON.stringify({
            query: query,
            variables: variables
        })
    })

    const data = await res.json();

    if (res.status != 200 || data.errors) {
        console.error(data.errors);
        return [res.statusText, null];
    }

    return [null, data];
}

async function getEventData(id) {
    const [err, data] = await makeCMSRequest(eventDataQuery(), { id: id })

    if (err) {
        return {};
    }

    return data.data.Event;
}

async function getLocations() {
    const [err, data] = await makeCMSRequest(locationsQuery());

    if (err) {
        return [];
    }

    let options = {
        "options": []
    };

    for (location of data.data.allLocations) {
        options.options.push({
            text: {
                type: "plain_text",
                text: location.name
            },
            value: location.id
        })
    }

    return options;
}

async function getTypes() {
    const [err, data] = await makeCMSRequest(typesQuery());

    if (err) {
        return [];
    }

    let options = {
        "options": []
    };

    for (type of data.data.allTypes) {
        options.options.push({
            text: {
                type: "plain_text",
                text: type.name
            },
            value: type.id
        })
    }

    return options;
}

async function getTags() {
    const [err, data] = await makeCMSRequest(tagsQuery());

    if (err) {
        return [];
    }

    let options = {
        "options": []
    };

    for (tag of data.data.tags) {
        if (!tag.slug) {
            continue
        }
        options.options.push({
            text: {
                type: "plain_text",
                text: tag.name
            },
            value: tag.slug
        })
    }

    return options;
}

async function getEvents(query) {
    const [err, data] = await makeCMSRequest(eventsQuery());

    if (err) {
        return [];
    }

    let eventData = data.data.allEvents;

    // Filters events based on what the user types in the dropdown box
    eventData = eventData.filter((event) => {
        if (!event.id || !event.name || !event.startDate) {
            return false;
        }
        return event.name.toLowerCase().replace(/\s/g, '').includes(query.toLowerCase().replace(/\s/g, ''));
    });

    for (i = 0; i < eventData.length; i++) {
        const jsDate = new Date(eventData[i].startDate);
        eventData[i].date = DateTime.fromJSDate(jsDate, { zone: 'America/New_York' });
    }

    eventData = eventData.sort((a, b) => a.date - b.date);

    let options = {
        "option_groups": []
    };

    let dates = [];

    for (const event of eventData) {
        let timeString = event.date.toFormat("hh:mm a");
        let dateString = event.date.toLocaleString(DateTime.DATE_MED_WITH_WEEKDAY);

        if (!(dates.includes(dateString))) {
            options.option_groups.push({
                label: {
                    type: "plain_text",
                    text: dateString
                },
                options: []
            })

            dates.push(dateString);
        }

        let object = {
            text: {
                type: "plain_text",
                text: (timeString + " " + event.name).trunc(60)
            },
            value: event.id
        }

        options.option_groups[options.option_groups.length - 1].options.push(object);
    }

    return options;
}

async function updateEvent(queryInput) {
    const [err, data] = await makeCMSRequest(updateEventMutation(), queryInput);

    return [err, data];
}

module.exports = {
    getEventData,
    getLocations,
    getTypes,
    getTags,
    getEvents,
    updateEvent
}