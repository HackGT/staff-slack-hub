const fetch = require('node-fetch');
const dateformat = require('dateformat');

const { eventsQuery, areasQuery, eventDataQuery, tagsQuery } = require('./queries');

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
    //headers['Authorization'] = `Bearer ${process.env.CMS_TOKEN}`

    const res = await fetch(process.env.CMS_URL, {
        method: "POST",
        headers: headers,
        body: JSON.stringify({
            query: query,
            variables: variables
        })
    })
    return res;
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
    const res = await makeCMSRequest(eventDataQuery(id))

    let data = await res.json();
    data = data.data.eventbases;

    if (data.length == 1) {
        console.log(data[0]);
        return data[0];
    } else {
        console.log("Error retrieving data for event id: " + id);
    }
}

async function getAreas() {
    const res = await makeCMSRequest(areasQuery());

    console.log("Fetched areas data");

    let data = await res.json();

    if (data.errors) {
        console.error(data.errors);
        return [];
    } else if (!data.data.areas) {
        return [];
    }

    data = data.data.areas;

    let options = {
        "options": []
    };

    for (area of data) {
        options.options.push({
            text: {
                type: "plain_text",
                text: area.name
            },
            value: area.id
        })
    }
    return options;
}

async function getTags() {
    const res = await makeCMSRequest(tagsQuery());

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
    const res = await makeCMSRequest(eventsQuery());

    console.log("Fetched event data");

    let data = await res.json();

    if (data.errors) {
        console.error(data.errors);
        return [];
    } else if (!data.data.eventbases) {
        return [];
    }

    data = data.data.eventbases;

    // Filters events based on what the user types in the dropdown box
    data = data.filter((event) => {
        if (!event.id || !event.title || !event.start_time) {
            return false;
        }
        return event.title.toLowerCase().replace(/\s/g, '').includes(query.toLowerCase().replace(/\s/g, ''));
    });

    for (i = 0; i < data.length; i++) {
        data[i].date = new Date(data[i].start_time);
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
                text: (timeString + " " + event.title).trunc(60)
            },
            value: event.id
        }

        options.option_groups[options.option_groups.length - 1].options.push(object);
    }

    return options;
}

module.exports = {
    getEventData,
    getAreas,
    getTags,
    getEvents
}