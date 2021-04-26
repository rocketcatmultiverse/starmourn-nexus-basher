nb.alias = function(c) {
	let cmd = c.split(' ');
	let arg = cmd[0].toLowerCase();
	if (arg === "nbk" || arg === "nbkill") {
		nb.verb_k();
		return true;
	}
	if (arg === "nbignore") {
		nb.verb_ignore(cmd);
		return true;
	}
	if (arg === "nbunignore") {
		nb.verb_unignore(cmd);
		return true;
	}
	if (arg === "nbgo") {
		nb.verb_go(true);
		return true;
	}
	if (arg === "nbstop") {
		nb.verb_go(false);
		return true;
	}
	if (arg === "nbhelp") {
		nb.verb_help();
		return true;
	}
	if (arg === "nbreload") {
		run_function("onLoad",null,"Nexus community basher");
		return true;
	}

	if (arg === "nbtoggle") {
		nb.verb_toggle(c)
		return true;
	}

	if (arg === "nbconfig") {
		nb.verb_config(c);
		return true;
	}
	return false;
}

nb.verb_config = function(c){
	var split = c.split(" ");
	if (split.length > 1) {
		if (split[1] === "help") {
			nb.configHelp();
			return;
		} else {
			nb.reloadUserConfigs();
			return;
		}
	}
	nb.configDisplay();
}

nb.verb_toggle = function(c) {
	c = c.split(" ");
	const toggles = ["debug","group","leader"];
	var toggled = null;
	if (c.length !== 2) {
		display_notice("NBTOGGLE <"+toggles.join("/")+">");
		return;
	}
	if (c[1] === "debug") {
		nb.debugMode=!nb.debugMode;
		toggled = nb.debugMode;
	} else if (c[1] === "group") {
		nb.groupMode = !nb.groupMode;
		toggled = nb.groupMode
	} else if (c[1] === "leader") {
		nb.groupLeader = !nb.groupLeader;
		toggled = nb.groupLeader
	}
	display_notice(c[1]+ " is now "+toggled);
}

nb.verb_help = function() {
	display_notice("Welcome to Nexus Community Basher for Starmourn!");
	display_notice("Use NBGO to toggle the system enabled/disabled, or NBSTOP to stop it!");
	display_notice("Use NBIGNORE <mob name> to tell the basher to ignore a particular mob name. UNIGNORE to undo. Ignores do not persist across sessions.");
	display_notice("Use NBK or NBKILL to tell the basher to kill all the mobs in the room.");
	display_notice("NBRELOAD will reload the system.");
	display_notice("NBCONFIG will show you configuration options. Learn more about it with NBCONFIG HELP. Reload your user configs with NBCONFIG RELOAD");
}

nb.verb_go = function(toggle) {
	if (toggle) nb.go = !nb.go;
	else nb.go = false;
	if (nb.go) {
		display_notice("Nexus basher now enabled.");
		nb.onGo();
	}
	else display_notice("Nexus basher has stopped.");
}

nb.verb_k = function(){
	if (!nb.go) {
		display_notice("Nexus basher is not enabled. Use NBGO to start and NBSTOP to stop!")
	}
	nb.calc();
}

nb.verb_ignore = function(c){
	if (c.length < 2) {
		display_notice("Please provide the name of the mob you would like to ignore.")
		return;
	}
	c.shift();
	let mob = c.join(" ").toLowerCase();
	if (!nb.mobs.includes(mob)) {
		display_notice("nb doesn't know that mob anyway.");
		return;
	}
	if (nb.ignores.includes(mob)) {
		display_notice("You are already ignoring that mob.")
		return;
	}
	nb.ignores.push(mob);
	display_notice("Okay, you are now ignoring "+mob+ ". In total you are ignoring "+nb.ignores.join(", "));
}

nb.verb_unignore = function(c){
	if (cmd.length < 2) {
		display_notice("Please provide the name of the mob you would like to unignore.");
		return;
	}
	c.shift();
	let mob = c.join(" ").toLowerCase();
	if (!nb.ignores.includes(mob)) {
		display_notice("You are not ignoring that mob to begin with.");
		return;
	}
	nb.ignores.push(mob);
	display_notice("Okay, you are no longer ignoring "+mob+ ".");
}