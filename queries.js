const queryMessage = () => `query send_message($message:String!, $plugins:PluginMaster!) {
  send_message(message: $message, plugins: $plugins) {
    plugin
    errors {
      error
      message
    }
  }
}`;

const locationsQuery = () => `
    query {
        allLocations {
            id
            name
            mapGTSlug
        }
    }
`

const typesQuery = () => `
    query {
        allTypes {
            id
            name
        }
    }
`

const eventsQuery = () => `
    query {
        allEvents {
            id
            name
            startDate
        }
    }
`;

const eventDataQuery = (id) => `
    query {
        Event(where: { id: "${id}" }) {
            id
            name
            description
            startTime
            startDay
            endTime
            endDay
            location {
                name
                id
            }
            type {
                name
                id
            }
        }
    }
`;

const updateEventMutation = () => `
    mutation UpdateEvent($event: updateEventbaseInput) {
      updateEventbase(input: $event) {
        eventbase {
          title
          start_time
          end_time
          id
        }
      }
    }
`

module.exports = {
    queryMessage,
    eventsQuery,
    locationsQuery,
    typesQuery,
    eventDataQuery,
    updateEventMutation,
}