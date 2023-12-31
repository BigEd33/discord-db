import fetch from "node-fetch";
import DiscordDBError from "./error.js";

const getChannels = async (token, guildId) => {
  const response = await fetch(`https://discord.com/api/v9/guilds/${guildId}/channels`, {
    headers: { "Authorization": `Bot ${token}` }
  });
  const channels = await response.json();
	
  if (!channels.retry_after) return channels;
  return new Promise((resolve) => {
    setTimeout(async () => {
      const channelsRetry = await fetch(`https://discord.com/api/v9/guilds/${guildId}/channels`, {
        headers: { "Authorization": `Bot ${token}` }
      });
      const data = await channelsRetry.json();
      resolve(data);
    }, channels.retry_after * 1000);
  });
};

// * End of Static * \\

const verifyToken = async (token) => {
  const statusCode = await fetch("https://discord.com/api/v9/users/@me", {
    headers: { "Authorization": `Bot ${token}` }
  });

  return statusCode.status !== 401;
};

const loadCollections = async (client) => {
  const channels = await getChannels(client.token, client.guildId);
  if (channels.length === 0) throw new DiscordDBError("No collections found, collections are categories prefixed with DB_");
    
  const collections = [];
  for (const channel of channels) {
    if (channel.type !== 4) continue;
    if (!channel.name.toLowerCase().startsWith("db_")) continue;
    collections.push(channel);
  }
  return collections;
};

const getCollectionId = async (client, target) => {
  target = target.replace(/DB_/ig, "");
  const collection = client.collections.find((col) => col.name.split("_")[1].toLowerCase() === target.toLowerCase());
  if (!collection) throw new DiscordDBError("Couldn't find that collection.");
  return collection.id;
};

const createEntry = async (client, key, collection) => {
  const response = await fetch(`https://discord.com/api/v9/guilds/${client.guildId}/channels`, {
    method: "POST",
    body: JSON.stringify({
      name: key,
      type: 0,
      parent_id: collection
    }),
    headers: {
      "Authorization": `Bot ${client.token}`,
      "Content-Type": "application/json",
      "X-Audit-Log-Reason": "Generated by Discord DB."
    }
  });
  const entry = response.json();
  if (entry.retry_after) return Promise.reject(new DiscordDBError("Request ratelimited."));
  if (entry.errors) return Promise.reject(new DiscordDBError("Failed to create new entry."));
  return Promise.resolve(entry);
};

const deleteEntry = async (client, collectionId, target) => {
  const channels = await getChannels(client.token, client.guildId);
  const entry = channels.find((channel) => channel.parent_id === collectionId && channel.name === target);
  if (!entry) return false;
  const success = await fetch(`https://discord.com/api/v9/channels/${entry.id}`, {
    method: "DELETE",
    headers: { "Authorization": `Bot ${client.token}` }
  }).then(res => res.status === 200);
  return success;
};

const getEntry = async (client, collectionId, key) => {
  const channels = await getChannels(client.token, client.guildId);
  const entry = channels.find((channel) => channel.parent_id === collectionId && channel.name === key);
  if (!entry) return null;
  const messages = await fetch(`https://discord.com/api/v9/channels/${entry.id}/messages`, { headers: { "Authorization": `Bot ${client.token}` }});
  const parsedMessages = await messages.json();
  if (parsedMessages.retry_after) throw new DiscordDBError("Request ratelimited.");
  return new Promise((resolve, reject) => {
    if (parsedMessages.length === 0) return resolve(null);
    try {
      const value = JSON.parse(parsedMessages.reverse()[0].content);
      resolve(value);
    } catch (e) {
      reject(e);
    }
  });
};

const outputData = async (client, id, content) => {
  const message = await fetch(`https://discord.com/api/v9/channels/${id}/messages`, {
    method: "POST",
    body: JSON.stringify({ content: content }),
    headers: {
      "Authorization": `Bot ${client.token}`,
      "Content-Type": "application/json"
    }
  });
	
  if (message.ok) return Promise.resolve();
  return Promise.reject("Message returned bad status code.");
};

export { verifyToken, loadCollections, getCollectionId, createEntry, deleteEntry, getEntry, outputData };