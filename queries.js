const queryMessage = () => `query send_message($message:String!, $plugins:PluginMaster!) {
  send_message(message: $message, plugins: $plugins) {
    plugin
    errors {
      error
      message
    }
  }
}`;

const tagsQuery = () => `
    query {
        tags(start: 0) {
            name
            slug
        }
    }
`

const areasQuery = () => `
    query {
        areas(start: 0) {
            id
            name
            mapgt_slug
        }
    }
`

const eventsQuery = () => `
    query {
        eventbases(start: 0) {
            id
            title
            start_time
        }
    }
`;

const eventDataQuery = (id) => `
    query {
        eventbases(where: { _id: "${id}" }) {
            title
            description
            start_time
            end_time
            area {
                name
                id
            }
            type
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
    tagsQuery,
    eventsQuery,
    areasQuery,
    eventDataQuery,
    updateEventMutation,
}