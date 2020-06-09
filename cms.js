const fetch = require('node-fetch');
const dateformat = require('dateformat');

const { eventsQuery, locationsQuery, typesQuery, eventDataQuery, tagsQuery } = require('./queries');

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

    let data = await res.json();

    if (data.errors) {
        console.error(data.errors);
        return null;
    } else if (!data.data) {
        return null;
    }

    return data;
}

async function makeRequest(message, clientSchemaJson, adminkey) {
    ret = failureJson()
    const res = await fetch(process.env.BUZZER_URL, {
        method: 'POST',
        headers: {
            'Content-Type': `application/json`,
            'Accept': `application/json`,
            'Authorization': 'Basic ' + adminkey
        },
        body: JSON.stringify({
            query: queryMessage,
            variables: {
                "message": message,
                "plugins": clientSchemaJson
            }
        })
    }).then(res => {
        if (res.status == 200) {
            console.log("Buzzer Success")
            ret = successJson();
        } else {
            console.log("My name is rahul and im dumb")
        }
        return res.json()
    }).then(res => {
        console.log("response received")
        console.log(JSON.stringify(res))
    })
    return ret;
}

async function getEventData(id) {
    let data = await makeCMSRequest(eventDataQuery(id))

    if (!data) {
        return {};
    }

    return data.data.Event;
}

async function getLocations() {
    let data = await makeCMSRequest(locationsQuery());

    console.log("Fetched locations data");

    if (!data) {
        return [];
    }

    data = data.data.allLocations;

    let options = {
        "options": []
    };

    for (location of data) {
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
    let data = await makeCMSRequest(typesQuery());

    console.log("Fetched types data");

    if (!data) {
        return [];
    }

    data = data.data.allTypes;

    let options = {
        "options": []
    };

    for (type of data) {
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
    let res = await makeCMSRequest(tagsQuery());

    console.log("Fetched tags data");

    let data = await res.json();

    if (data.errors) {
        console.error(data.errors);
        return [];
    } else if (!data.data.tags) {
        return [];
    }

    data = data.data.tags;

    let options = {
        "options": []
    };

    for (tag of data) {
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
    let data = await makeCMSRequest(eventsQuery());

    console.log("Fetched event data");

    if (!data) {
        return [];
    }

    data = data.data.allEvents;

    // Filters events based on what the user types in the dropdown box
    data = data.filter((event) => {
        if (!event.id || !event.name || !event.startDate) {
            return false;
        }
        return event.name.toLowerCase().replace(/\s/g, '').includes(query.toLowerCase().replace(/\s/g, ''));
    });

    for (i = 0; i < data.length; i++) {
        data[i].date = new Date(data[i].startDate);
    }

    data = data.sort((a, b) => a.date - b.date);

    let options = {
        "option_groups": []
    };

    let dates = [];

    for (event of data) {
        let timeString = dateformat(event.date, 'UTC:hh:MM TT');
        let dateString = dateformat(event.date, 'UTC:ddd, mmm dd, yyyy');

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

module.exports = {
    getEventData,
    getLocations,
    getTypes,
    getTags,
    getEvents
}