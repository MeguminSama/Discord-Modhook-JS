import path from "path";
import fs from "fs";
import { globSync } from "glob";

const DISCORD_DIRS = [
	"Discord",
	"DiscordPTB",
	"DiscordCanary",
	"DiscordDevelopment",
]

interface DiscordInstance {
	name: string;
	executablePath: string;
}

function getLocalAppData(): string {
	if (process.platform !== "win32") throw new Error("Only Windows is supported");
	if (!process.env.LOCALAPPDATA) throw new Error("LOCALAPPDATA environment variable is not set");
	return process.env.LOCALAPPDATA
}

export class Discord {
	private instances: Record<string, string> = {};

	constructor() {
		this.scanInstances();
	}

	scanInstances() {
		const discordDirs = fs.readdirSync(path.resolve(getLocalAppData()))
			.filter(dir => DISCORD_DIRS.includes(dir));

		for (const dir of discordDirs) {
			const paths = path.resolve(getLocalAppData(), dir, "*", `${dir}.exe`);
			const executables = globSync(paths, { windowsPathsNoEscape: true });

			// get the version with the highest number (app-x.x.xxxx)
			const sorted = executables.sort((a, b) => {
				const aVersion = a.match(/app-(\d+\.\d+\.\d+)/)?.[1];
				const bVersion = b.match(/app-(\d+\.\d+\.\d+)/)?.[1];
				if (!aVersion || !bVersion) return 0;
				return bVersion.localeCompare(aVersion);
			});

			const executable = sorted[0];
			if (!executable) continue;

			this.addInstance(
				dir.split("Discord").join("Discord ").trim(),
				executable,
			);
		}
		return this.getInstances();
	}

	getInstances() {
		return this.instances;
	}

	addInstance(name: string, destination: string) {
		this.instances[name] = destination;
	}

	removeInstance(name: string) {
		delete this.instances[name];
	}
}
