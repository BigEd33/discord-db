import DiscordDB from "../src/main.js";
import assert from "assert";

describe("DiscordDB Client", () => {
	it("should reject empty values", () => {
		assert.throws(() => {
			new DiscordDB({ guildId: "testing" });
		}, { name: "DiscordDBError", message: "Missing required fields." });
	});

	it("should reject an invalid token", async () => {
		const client = new DiscordDB({ token: "testing", guildId: "testing" });
		try {
			await client.login();
			return assert.fail("Verification passed when it should have failed");
		} catch (e) {
			assert.strictEqual(e.message, "Invalid bot token.");
		}
	});
});