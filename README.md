# Overview
The Staff Slack Hub seeks to combine multiple staff slack apps used during a hackathon into one bot. As of now, these include the schedule bot (for changing event timings), buzzer ui (to send notifications), and profile pic (to add the organizer overlay). The main goal is to increase code sharing between these 3 sub-apps and provide a better framework for future extension.

# Usage
To start using the app, use the slash command `/hub`. In order to have permission to use the app, a slack user must be in the “staff channel” as defined in `config.json`. The app will ask the user for OAuth permission to update their profile components and send messages as the user.