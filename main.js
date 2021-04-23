nb = {};
nb.class = get_variable("my_class");
if (nb.class === "B.E.A.S.T.") nb.class = "BEAST";
nb.go = false;
nb.tar = "";
nb.offense = {};
nb.sys = {};
nb.interrupt = false;
nb.sys.health = {};
nb.sys.efficacy = {};
nb.debugMode = false;
nb.checkForUpdates = nb.checkForUpdates || true;
nb.systems = ['muscular','internal','sensory','mind','wetwiring'];
nb.calcOffense = {}
nb.calcOffense.Beast = function() {}
nb.calcOffense.Engineer = function() {}
nb.calcOffense.Fury = function() {}
nb.calcOffense.Nanoseer = function() {}
nb.calcOffense.Scoundrel = function() {}
nb.tarHealth = 100;

nb.send = function(cmd) {
	send_command(cmd,1);
}

nb.calc = function() {
	if (!nb.go) return;
	if (!nb.bal) return;
	let needInterrupt = nb.needInterrupt();
	if (needInterrupt) { nb.send(needInterrupt); return; }
	let needMend = nb.needMend(); 
	if (needMend) { nb.send(needMend); return; }
	let needHeal = nb.needHeal();
	if (needHeal) { nb.send(needHeal); return; }

	//we're gonna check for our target on every bal for now.
	let tarHere = nb.tarCheck();
	if (tarHere) nb.attack();
}

nb.attack = function(){
	nb.send(nb.offense[nb.class]());
}

nb.tarCheck = function(){
	//is our target still here?
	var mobsHere = nb.itemsHere;
	nb.debug(JSON.stringify(mobsHere));
	if (nb.tar !== "") {
		for (var i = 0; i < mobsHere.length; i++) {
			if (mobsHere[i].id == nb.tar) return true;
		}
	}

	//no, let's get a new one if we can.
	nb.debug(JSON.stringify(nb.mobs));
    for (i = 0; i < nb.mobs.length; i++) {
    	if (nb.ignores.includes(nb.mobs[i].toLowerCase())) continue; //don't target this mob if we have ignored it.
        for (let k = 0; k < mobsHere.length; k++) {
            if (mobsHere[k].name.toLowerCase() == nb.mobs[i].toLowerCase()) {
                nb.tar = mobsHere[k].id;
                send_GMCP("IRE.Target.Set",nb.tar);
                return true;
            }
        }
    }

    //no mob here to bash.
    display_notice("No mobs here.","red");
    return false;
}

nb.onGo = function(){
	if (nb.class === "Engineer") {
		if (!("Stimjector" in GMCP.Defences)) {
			nb.warn("Your stimjector is off. Make sure to OPERATE STIMJECTOR "+GMCP.Character.name+" ON before you start.");
		}
		var botFound = false;
		var turretFound = false;
		for (let i=0; i < nb.itemsHere.length; i++) {
			if (nb.itemsHere[i].name === "a crane-armed carrybot") botFound=true;
			if (nb.itemsHere[i].name.includes("a deployed turret")) turretFound=true;
			if (botFound&&turretFound) break;
		}
		if (!botFound) {
			if (nb.haveSkill("bots","homeport")) {
				nb.warn("Nexus basher doesn't see a carrybot where you are. Use HOMEPORT or construct a new one! You can force your bots to follow you with ORDER LOYALS FOLLOW.");
			} else {
				nb.warn("Nexus basher doesn't see a carrybot where you are. BOT CONSTRUCT CARRYBOT to construct a new one or LOYALS LIST to find where your old one has gotten to. Look to learning BOT HOMEPORT soon! You can force your bots to follow you with ORDER LOYALS FOLLOW.");
			}
		}
		if (!turretFound) {
			nb.warn("Nexus basher doesn't see a turret where you are. TURRET CONSTRUCT, TURRET DEPLOY, and order your Carrybot to carry the turret for you with BOT TURRET!");
		}

	}
}

nb.needInterrupt = function(){
	if (!nb.interrupt) return false;
	switch (nb.class) {
		case "Engineer":
			return 'bot swing '+nb.tar;
		case "Scoundrel":
			if (nb.bullets === 0 ) {
				return "guile pocketsand "+nb.tar;
			} else {
				return "gun pointblank "+nb.tar;
			} 
		case "BEAST":
			return "mwp netlaunch "+nb.tar;
		case "Fury":
			return "kith fever "+nb.tar;
		case "Nanoseer":
			return "nano eyestrike "+nb.tar;
		default:
			nb.error("Invalid class "+nb.class+" provided to nb.sendHeal");
			return false;
	}
}

nb.needHeal = function(){
	if (nb.hpperc > .7) return false;
	if (nb.healCd()) return false;
	switch (nb.class) {
		case "Engineer":
			return false;
		case "Scoundrel":
			return "guile stim";
		case "BEAST":
			return "suit support";
		case "Fury":
			return "kith suffuse";
		case "Nanoseer":
			return "nano repair";
		default:
			nb.error("Invalid class "+nb.class+" provided to nb.sendHeal");
			return false;
	}
}
nb.healCd = function(){
	switch (nb.class) {
		case "Engineer":
			return false
		case "Scoundrel":
			return "ab_Guile_stim" in nb.cooldowns;
		case "BEAST":
			return "ab_SuitTech_support" in nb.cooldowns;
		case "Fury":
			return "ab_Fulmination_suffuse" in nb.cooldowns;
		case "Nanoseer":
			return "ab_Nanotech_repair" in nb.cooldowns;
		default:
			nb.error("Invalid class "+nb.class+" provided to nb.sendHeal");
			return false;
	}
}

nb.needMend = function(){
	if (!nb.wwBal) return false;
	for (let sys in nb.sys.health) {
		if (nb.sys.health[sys] < 92.5 && nb.sys.efficacy[sys] === 100) {
			return "ww mend "+sys;
		}
	}
	return false;
}

nb.onBal = function(){
	nb.calc();
}

nb.updateCheck = function(){
	if (!nb.checkForUpdates) return;
	var promise = $.when(1);
	promise = promise.then(function(){
		return $.ajax({
			url: "https://raw.githubusercontent.com/rocketcatmultiverse/starmourn-nexus-basher/main/VERSION"
		}).done(function(data){
			console.log("nb.updateCheck trying eval of VERSION");
			console.log([data]);
			try {
				let v = eval(data);
				if (typeof v !== "number") v = parseInt(v); 
				console.log("Client version is "+nb.version.nxs+". Current version is "+v+".");
				if (v > nb.version.nxs) {
					display_notice("WARNING: Your .nxs for Nexus community basher is out of date. You may wish to download the latest release from https://github.com/rocketcatmultiverse/starmourn-nexus-basher/releases and replace your existing .nxs with the new one","yellow");
				} else if (v < nb.version.nxs) {
					display_notice("I hope you are on a test version of the .nxs!","yellow");
				} 
				else {
					console.log("Nb nxs is up to date.");
				}
				
			} catch (err) {
				console.log("error in nb.updateCheck: "+err);
			}
		})
	});
}

nb.onLoad = function() {
	display_notice("Starmourn Community Nexus Basher has loaded with no errors!","green");
	nb.parseSkills();
	send_GMCP("Char.Items.Room",""); //to populate nb.itemsHere.
}

display_notice("Welcome to the Starmourn Community Nexus Basher!","green");