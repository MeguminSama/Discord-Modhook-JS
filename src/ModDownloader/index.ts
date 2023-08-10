/// ModHook Modloader
/// This modloader should download mods on your behalf :)

import * as Vencord from "./Vencord";

export enum Mods {
	Vencord = "Vencord"
}

export function downloadMod(modName: Mods) {
	switch (modName) {
		case Mods.Vencord:
			return Vencord.download();
		default:
			throw new Error(`Unknown mod ${modName}`);
	}
}