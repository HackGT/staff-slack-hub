const locationsQuery = () => `
    query {
        allLocations {
            id
            name
            mapGTSlug
        }
    }
`;

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

const eventDataQuery = () => `
    query getEventData($id: ID!) {
        Event(where: { id: $id }) {
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
    mutation UpdateEvent($id: ID!, $data: EventUpdateInput) {
      updateEvent(id: $id, data: $data) {
        name
      }
    }
`;

module.exports = {
    eventsQuery,
    locationsQuery,
    typesQuery,
    eventDataQuery,
    updateEventMutation,
}