import koffi from "koffi";

const libModHook = koffi.load('./LibModHook');

koffi.struct('HookDiscordOpts', {
	pathToDiscordExecutable: 'char*',
	originalAsarName: 'char*',
	pathToCustomAsar: 'char*',
	asarHookToggleQuery: 'char*',
	modhookDllName: 'char*',
})

interface HookDiscordOpts {
	pathToDiscordExecutable: string,
	originalAsarName: string,
	pathToCustomAsar: string,
	asarHookToggleQuery: string,
}

const hookDiscord_lib = libModHook.stdcall('hookDiscord', 'int', ['HookDiscordOpts* options']);

export const hookDiscord = (opts: HookDiscordOpts) => {
	return hookDiscord_lib({ ...opts, modhookDllName: "ModHookInjection.dll" })
};
