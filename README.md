# discord-db
> A simple/joke package to use Discord channels as a key-value database.

⚠️ This is not meant to be used in production apps like Discord.JS bots, using this as a database in an active bot will get you ratelimited constantly. ⚠️


## Install

```sh
npm install discord-data
```

## Usage
Doesn't support CommonJS.
```js
import DiscordDB from "discord-data";

const client = new DiscordDB({ 
    token: "DISCORD_BOT_TOKEN_HERE",
    guildId: "GUILD_ID_HERE"
});
client.login().then(() => console.log("Connected!")) // Required before running any queries.
```

To create a collection, create a category in your guild prefixed with DB_, anything after the underscore is the collection name.
These methods are all asynchronous and return promises.
```js
(async () => {
  // Category is named db_users
  await client.create("users", { key: "admin", username: "admin", password: "123" }); // Creates a channel in the users collection with the provided JSON data.

  const data = await client.find("users", "admin"); // Returns the parsed JSON data from the above entry.
  console.log(data)

 const success = await client.delete("users", "admin");
 console.log(success) // Truthy if an entry was deleted, falsy otherwise.

console.log(client.getCollections()) // Simply returns the array of loaded collections, or an empty array if not yet connected.
})()
```

## Created By
- [BigEd](https://github.com/BigEd33)
