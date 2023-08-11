import fs from "fs";
import path from "path";
import asar from "@electron/asar";
import * as Database from './database';

const profileDist = ensureDir(path.resolve('profiles'));
const profileTmpDir = ensureDir(path.resolve('tmp'));
const getTmpDir = (name: string) => ensureDir(path.resolve(profileTmpDir, name));
export const getProfileDist = (id: string) => path.resolve(profileDist, `${id}.asar`);

function ensureDir(dir: string) {
	if (!fs.existsSync(dir)) {
		fs.mkdirSync(dir, { recursive: true });
	}
	return dir;
}

export function makeTemplateHeader(profile: Database.Profile) {
	const customUserDir = profile.customUserDirName ? JSON.stringify(profile.customUserDirName) : 'null';

	return `/// BEGIN MODHOOK INFO ///
const CUSTOM_USER_DIR_NAME = ${customUserDir};
const PATH_TO_CLIENT_MOD = ${JSON.stringify(profile.pathToModLoader)};
/// END MODHOOK INFO ///\n\n`;
}

export async function buildProfile(id: string, jsTemplateLocation: string) {
	const profile = await Database.getProfile(id);

	const tmpDir = getTmpDir(profile.name);
	const asarDestination = getProfileDist(profile.id);

	// Create a temporary directory for the ASAR to be based on.
	fs.writeFileSync(path.resolve(tmpDir, 'package.json'), JSON.stringify({ name: "Discord", main: "index.js" }));

	const template = fs.readFileSync(jsTemplateLocation, 'utf8');

	fs.writeFileSync(path.resolve(tmpDir, 'index.js'), makeTemplateHeader(profile) + template);

	// Create the ASAR
	await asar.createPackage(tmpDir, asarDestination).catch(console.error);

	asar.uncacheAll();

	// Delete the temporary directory
	fs.rmSync(tmpDir, { recursive: true });
}
