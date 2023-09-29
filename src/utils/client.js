import { loadCollections, verifyToken } from "./api.js";
import DiscordDBError from "./error.js";

/**
 * @description Represents a DiscordDB connection
 * @param {{ token: string, guildId: string, categoryId: string }} options 
 */
const DiscordDB = function(options) {
	if (!Object.prototype.hasOwnProperty.call(options, "token")
    || !Object.prototype.hasOwnProperty.call(options, "guildId")
    || !Object.prototype.hasOwnProperty.call(options, "categoryId")
	) throw new DiscordDBError("Missing required fields.");
	this.token = options.token;
	this.guildId = options.guildId;
	this.categoryId = options.categoryId;
	this.connected = false;
};

/**
 * @description Verifies the token and loads collections into memory.
 * @returns {Promise<null|DiscordDBError>} A promise that resolves/rejects based on the validation of the token.
 */
DiscordDB.prototype.login = async function() {
	return new Promise(async (resolve, reject) => {
		const tokenValid = await verifyToken(this.token).catch(() => { return; });
		if (!tokenValid) return reject(new DiscordDBError("Invalid bot token."));
		const collections = await loadCollections(this);
		this.collections = collections;
		this.connected = true;
		resolve();
	});
};

DiscordDB.prototype.getCollections = function() {
	return this.collections || [];
}; 


export default DiscordDB;