import fetch from "node-fetch";
import DiscordDBError from "./error.js";

const verifyToken = (token) => {
	return new Promise(async (resolve, reject) => {
		const statusCode = await fetch("https://discord.com/api/v9/users/@me", {
			headers: {
				"Authorization": `Bot ${token}`
			}
		});

		statusCode.status === 401 ? reject("Invalid token.") : resolve(true);
	});
};

const loadCollections = async (client) => {
	const channels = await fetch(`https://discord.com/api/v9/guilds/${client.guildId}/channels`, {
		headers: {
			"Authorization": `Bot ${client.token}`
		}
	}).then(res => res.json());
    
	if (channels.length === 0) throw new DiscordDBError("Collections category is empty.");
	const collections = [];
	for (const channel of channels) {
		if (channel.parent_id !== client.categoryId) continue;
		collections.push(channel);
	}
	return collections;
};

export { verifyToken, loadCollections };