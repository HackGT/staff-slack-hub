# Overview
The Staff Slack Hub seeks to combine multiple staff slack apps used during a hackathon into one bot. As of now, these include the schedule bot (for changing event timings), buzzer ui (to send notifications), and profile pic (to add the organizer overlay). The main goal is to increase code sharing between these 3 sub-apps and provide a better framework for future extension.

# Usage
To start using the app, use the slash command `/hub`. In order to have permission to use the app, a slack user must be in the “staff channel” as defined in `config.json`. The app will ask the user for OAuth permission to update their profile components and send messages as the user.

# Install to new Workspace
To install the app to a new workspace, visit the `/installation` url (ex. `https://staff-slack-hub.dev.hack.gt/installation`). Then, select the workspace from the dropdown in the top right of the page, and install it to the new workspace. Now, any user in the workspace can access the Staff Hub commands. To change the scopes requested from the user, look in the `app.js` file.

# Notes
From past usage, the profile pic plugin needs at least 350Mi of memory to process the images properly, so please provide at least this much in the YAML configuration. Additionally, please make sure to update the CMS and Buzzer secrets between deployments.