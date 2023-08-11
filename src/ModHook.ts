import path from "path";
import { Discord } from "./Discord";
import * as LibModHook from "./LibModHook";
import * as Downloader from "./ModDownloader";
import * as Database from "./database";
import * as util from "./util";

export class ModHook {
	public readonly discord: Discord = new Discord();
	public readonly downloader = Downloader;

	constructor(public jsTemplateLocation = path.resolve(__dirname, "../resource.template.js")) { }

	getProfiles() {
		return Database.getProfiles();
	}

	getProfile(id: string) {
		return Database.getProfile(id);
	}

	async addProfile(options: Omit<Database.Profile, 'id'>) {
		const profile = await Database.addProfile(options);
		await util.buildProfile(profile.id, this.jsTemplateLocation);
		return profile;
	}

	async updateProfile(profile: Database.Profile) {
		await Database.updateProfile(profile);
		await util.buildProfile(profile.id, this.jsTemplateLocation);
		return profile;
	}

	async deleteProfile(id: string) {
		await Database.deleteProfile(id);
	}

	async startProfile(id: string, discordPath: string, rebuild = true) {
		const profile = await Database.getProfile(id);
		if (rebuild) await util.buildProfile(profile.id, this.jsTemplateLocation);
		LibModHook.hookDiscord({
			pathToDiscordExecutable: discordPath,
			originalAsarName: profile.originalAsarName,
			pathToCustomAsar: util.getProfileDist(profile.id),
			asarHookToggleQuery: profile.asarHookToggleQuery,
		});
	}
}

export default ModHook;