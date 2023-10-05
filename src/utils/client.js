import { createEntry, deleteEntry, getCollectionId, getEntry, loadCollections, outputData, verifyToken } from "./api.js";
import DiscordDBError from "./error.js";

/**
 * @description Represents a DiscordDB connection
 * @param {{ token: string, guildId: string }} options 
 */
const DiscordDB = function(options) {
	if (!Object.prototype.hasOwnProperty.call(options, "token") || !Object.prototype.hasOwnProperty.call(options, "guildId")
	) throw new DiscordDBError("Missing required fields.");
	this.token = options.token;
	this.guildId = options.guildId;
	this.connected = false;
};

/**
 * @description Verifies the token and loads collections into memory.
 * @returns {Promise<null|DiscordDBError>} A promise that resolves/rejects based on the validation of the token.
 */
DiscordDB.prototype.login = async function() {
	if (this.connected) return;
	return new Promise(async (resolve, reject) => {
		const tokenValid = await verifyToken(this.token);
		if (!tokenValid) return reject(new DiscordDBError("Invalid bot token."));
		const collections = await loadCollections(this);
		this.collections = collections;
		this.connected = true;
		resolve();
	});
};

/**
 * @description Create a new data entry.
 * @param {string} collection The name of the collection this entry will be added to.
 * @param {{ key: {string} }} data Data for this entry, the key property is mandatory and will be the channel name/key.
 * @returns {Promise<{}>} Returns a promise resolved with the data passed to it.
 */
DiscordDB.prototype.create = async function(collection, data) {
	if (!this.connected) throw new DiscordDBError("Tried to run query before login.");
	if (!Object.prototype.hasOwnProperty.call(data, "key")) throw new DiscordDBError("No entry key provided. (Key property missing)");
	const collectionId = await getCollectionId(this, collection);
	const entry = await createEntry(this, data.key, collectionId);
	delete data.key;
	outputData(this, entry.id, JSON.stringify(data)).catch(() => { throw new DiscordDBError("Failed to submit data to entry."); });
	return Promise.resolve(data);
};

/**
 * @description Returns the parsed JSON of an entry in a collection.
 * @param {string} collection The name of the collection to look in.
 * @param {string} key Entry key to look for.
 * @returns {Promise<Object.<string, *>> | null}
 */
DiscordDB.prototype.find = async function(collection, key) {
	if (!this.connected) throw new DiscordDBError("Tried to run query before login.");
	if (!collection || !key) throw new DiscordDBError(`Missing value. (${!collection ? "collection" : "key"})`);

	const collectionId = await getCollectionId(this, collection);
	const content = await getEntry(this, collectionId, key);
	return Promise.resolve(content);
};

/**
 * @description Delete an entry from a collection.
 * @param {string} collection The name of the collection to look in.
 * @param {string} key Entry key to delete.
 * @returns {boolean} Whether an entry was deleted as a result.
 */
DiscordDB.prototype.delete = async function(collection, key) {
	if (!this.connected) throw new DiscordDBError("Tried to run query before login.");
	if (!collection || !key) throw new DiscordDBError(`Missing value. (${!collection ? "collection" : "key"})`);
	const collectionId = await getCollectionId(this, collection);
	const success = await deleteEntry(this, collectionId, key);
	return success;
};

/**
 * @description Returns the loaded collections, returns empty array if used before login.
 * @returns {Array}
 */
DiscordDB.prototype.getCollections = function() {
	return this.collections || [];
};


export default DiscordDB;