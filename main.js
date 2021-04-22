nb = {};
nb.class = get_variable("my_class");
if (nb.class === "B.E.A.S.T.") nb.class = "BEAST";
pve.tar = "";
nb.mobs = ["a yellow-feathered spiderax","a spotted mouse","a sleek shadow fox"]; //we can switch to area-based bashing later, for now let's just call it an array :)
nb.offense = {};
nb.sys = {};
nb.sys.health = {};
nb.sys.efficacy = {};
nb.systems = ['muscular','internal','sensory','mind','wetwiring'];

nb.send = function(cmd) {
	send_command(cmd,1);
}

nb.calc = function() {
	if (!nb.bal) return;
	let needInterrupt = nb.needInterrupt();
	if (needInterrupt) { nb.send(nb.needInterrupt); return; }
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
	var mobsHere = client.get_item_list('room', 'm', 'x')
	if (pve.tar !== "") {
		for (let i = 0; i < mobsHere.length; i++) {
			if (mobsHere[i].id == pve.tar) return true;
		}
	}

	//no, let's get a new one if we can.
    for (i = 0; i < pve.mobs.length; i++) {
        for (let k = 0; k < mobsHere.length; k++) {
            if (mobsHere[k].text.split("  #")[0] == pve.mobs[i]) {
                pve.tar = mobsHere[k].id;
                return true;
            }
        }
    }

    //no mob here to bash.
    display_notice("No mobs here.","red");
    return false;
}

nb.needInterrupt = function(){
	if (!nb.interrupt) return false;
	switch (nb.class) {
		case "Engineer":
			return 'bot swing '+pve.tar;
		case "Scoundrel":
			if (nb.bullets === 0 ) {
				return "guile pocketsand "+pve.tar;
			} else {
				return "gun pointblank "+pve.tar;
			} 
		case "BEAST":
			return "mwp netlaunch "+pve.tar;
		case "Fury":
			return "kith fever "+pve.tar;
		case "Nanoseer":
			return "nano eyestrike "+pve.tar;
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
			return "ab_Guile_stim" in nd.cooldowns;
		case "BEAST":
			return "ab_Suit_support" in nd.cooldowns;
		case "Fury":
			return "ab_Kith_suffuse" in nd.cooldowns;
		case "Nanoseer":
			return "ab_Nanotech_repair" in nd.cooldowns;
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