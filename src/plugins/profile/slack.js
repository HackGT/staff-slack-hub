const { IncomingWebhook } = require('@slack/webhook');

const path = require('path');
const os = require('os');
const sharp = require('sharp');
const fetch = require('node-fetch');
const fs = require('fs');
const { Stream } = require('stream');

const config = require('../../config.json');

function addInteractions(slackInteractions, web, installer) {

    /* ------------------------------ SLACK ACTIONS ----------------------------- */

    slackInteractions.action({ actionId: 'profile_run' }, async (payload) => {
        try {
            const authorized = await installer.authorize({ teamId: payload.user.team_id, userId: payload.user.id });

            setNameAndImage(web, authorized.userToken, payload.response_url, payload.channel.id);
        } catch (error) {
            console.error(error);
        }
    });
}

const pipeToFile = async (stream, file) => {
    return new Promise(resolve => {
        stream.pipe(fs.createWriteStream(file)).on("finish", resolve);
    });
}

const setNameAndImage = async (web, token, webhookUrl, channelId) => {
    const webhook = new IncomingWebhook(webhookUrl);

    try {
        webhook.send({
            text: "Working on it..."
        })

        // Find matching group by channelId
        const group = config.groups.find(g => g.channelId === channelId);

        if (!group) {
            await webhook.send({
                text: "Sorry, no overlay is configured for this channel."
            });
            return;
        }

        const profile = (await web.users.profile.get({
            token: token
        })).profile

        if (!profile.display_name.startsWith(group.namePrefix)) {
            const resp = await web.users.profile.set({
                token: token,
                name: "display_name",
                value: group.namePrefix + profile.real_name
            })
        }

        if (!profile.image_original) {
            // User hasn't actually set a profile picture yet
            webhook.send({
                text: "Please set a profile picture first and then try again by typing /hub"
            })
            return;
        }

        let profilePath = path.join(os.tmpdir(), profile.avatar_hash + path.extname(profile.image_original));
        const profileFetch = await fetch(profile.image_original);
        await pipeToFile(profileFetch.body, profilePath);

        let profilePic = sharp(await fs.promises.readFile(profilePath));
        let profilePicData = await profilePic.metadata();

        let overlay = await sharp(group.overlayImagePath)
            .resize(profilePicData.width, profilePicData.height)
            .toBuffer();

        let output = await profilePic
            .composite([{
                input: overlay,
                blend: "over"
            }])
            .png()
            .toBuffer();

        const setPhoto = await web.users.setPhoto({
            token: token,
            image: output
        })

        if (setPhoto.ok) {
            webhook.send({
                text: "Successfully updated display name and profile overlay!"
            })
        } else {
            throw new Error();
        }
    } catch (error) {
        console.error(error)
        webhook.send({
            text: "Sorry, there was an error."
        })
    }
}

module.exports = {
    addInteractions,
    setNameAndImage
}