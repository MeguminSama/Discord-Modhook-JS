import path from "path";
import fs from "fs";

// Vencord Mod Downloader


function getLocalAppData(): string {
	if (process.platform !== "win32") throw new Error("Only Windows is supported");
	if (!process.env.LOCALAPPDATA) throw new Error("LOCALAPPDATA environment variable is not set");
	return process.env.LOCALAPPDATA
}

const destination = path.resolve(getLocalAppData(), "DiscordModHook", "Vencord");

const VENCORD_RELEASE_URL = "https://api.github.com/repos/Vendicated/Vencord/releases/latest";
const VENCORD_RELEASE_URL_FALLBACK = "https://vencord.dev/releases/vencord";

const FILES_TO_DOWNLOAD = [
	"patcher.js",
	"preload.js",
	"renderer.js",
	"renderer.css"
]

const UserAgent = "DiscordModHook/dev";

async function getReleaseJson() {
	const response = await fetch(VENCORD_RELEASE_URL, {
		headers: {
			"User-Agent": UserAgent,
		},
	});
	if (response.status === 404) {
		return await fetch(VENCORD_RELEASE_URL_FALLBACK, {
			headers: {
				"User-Agent": UserAgent,
			},
		}).then(res => res.json());
	};
	return response.json();
}

/**
 * @returns The path to the modloader entrypoint
 */
export async function download() {
	const releaseAssets = (await getReleaseJson())["assets"];
	if (!releaseAssets) throw new Error("No assets found");

	const assetsToDownload = releaseAssets.filter((asset: any) => FILES_TO_DOWNLOAD.includes(asset.name));
	if (assetsToDownload.length === 0) throw new Error("No assets found");

	for (const asset of assetsToDownload) {
		const assetName = asset.name;
		const assetUrl = asset.browser_download_url;

		const assetDestination = path.resolve(destination, assetName);
		const assetDestinationDir = path.dirname(assetDestination);

		if (!fs.existsSync(assetDestinationDir)) {
			fs.mkdirSync(assetDestinationDir, { recursive: true });
		}

		if (fs.existsSync(assetDestination)) {
			fs.rmSync(assetDestination, { force: true });
		}

		const response = await fetch(assetUrl, {
			headers: {
				"User-Agent": UserAgent,
			},
		});
		if (response.status !== 200) throw new Error(`Failed to download ${assetName}`);
		const buffer = await response.arrayBuffer();
		fs.writeFileSync(assetDestination, Buffer.from(buffer));
	}

	return path.resolve(destination, "patcher.js");
}