import { promisify } from "util";
import sqlite3 from "sqlite3";
import { v4 as uuid } from "uuid";

let db: sqlite3.Database;
let initialised = false;
export interface Profile {
	id: string;
	name: string;
	description?: string;
	customUserDirName?: string;
	pathToModLoader: string;
	originalAsarName: string;
	asarHookToggleQuery?: string;
}

export function initDatabase(dbPath?: string) {
	if (initialised) return;
	db = new sqlite3.Database(dbPath || "libmodhook.db");

	db.serialize(() => {
		db.run(`
			CREATE TABLE IF NOT EXISTS modhook_profiles (
				id TEXT PRIMARY KEY,
				name TEXT NOT NULL,
				description TEXT,
				customUserDirName TEXT,
				pathToModLoader TEXT NOT NULL,
				originalAsarName TEXT NOT NULL,
				asarHookToggleQuery TEXT NOT NULL
			)`);
	});
	initialised = true;
}

export async function getProfiles(): Promise<Profile[]> {
	return await promisify(db.all.bind(db))("SELECT * FROM modhook_profiles");
}

export async function getProfile(id: string): Promise<Profile> {
	return await promisify(db.get.bind(db))("SELECT * FROM modhook_profiles WHERE id = ?", id);
}

export async function addProfile(profile: Omit<Profile, 'id'>): Promise<Profile> {
	const id = uuid();
	await promisify(db.run.bind(db))(
		"INSERT INTO modhook_profiles (id, name, description, customUserDirName, pathToModLoader, originalAsarName, asarHookToggleQuery) VALUES (?, ?, ?, ?, ?, ?, ?)",
		id,
		profile.name,
		profile.description,
		profile.customUserDirName,
		profile.pathToModLoader,
		profile.originalAsarName,
		profile.asarHookToggleQuery ?? profile.pathToModLoader
	);
	return await getProfile(id);
}

export async function updateProfile(profile: Profile): Promise<Profile> {
	const stmt = db.prepare("UPDATE modhook_profiles SET name = ?, description = ?, customUserDirName = ?, pathToModLoader = ?, originalAsarName = ?, asarHookToggleQuery = ? WHERE id = ?",
		profile.name,
		profile.description,
		profile.customUserDirName,
		profile.pathToModLoader,
		profile.originalAsarName,
		profile.asarHookToggleQuery ?? profile.pathToModLoader,
		profile.id
	);
	await promisify(stmt.run.bind(stmt))();
	await promisify(stmt.finalize.bind(stmt))();
	return await getProfile(profile.id);
}

export async function deleteProfile(id: string): Promise<void> {
	await promisify(db.run.bind(db))("DELETE FROM modhook_profiles WHERE id = ?", id);
}
