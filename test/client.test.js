import DiscordDB from "../src/main.mjs";
import assert from "assert";

describe("DiscordDB Client", () => {
	it("should reject empty values", () => {
		assert.throws(() => {
			new DiscordDB({ token: "testing", guildId: "testing" });
		}, { name: "DiscordDBError", message: "Missing required fields." });
	});

	it("should reject an invalid token", async () => {
		const client = new DiscordDB({ token: "testing", guildId: "testing", categoryId: "testing" });
		try {
			await client.login();
			return assert.fail("Verification passed when it should have failed");
		} catch (e) {
			assert.strictEqual(e.message, "Invalid bot token.");
		}
	});
});