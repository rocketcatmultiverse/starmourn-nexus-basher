nb.tarStaggeringOrDazed = false;

nb.mwpWeaponInSlot = function(slot) {
	if (nb.mwp.length !== 3) {
		nb.error("Issue reading GMCP mwp value: "+nb.mwp);
		return false;
	}
	if (slot === "small") {
		return nb.mwp[0]
	}
	if (slot === "medium") {
		return nb.mwp[1]
	}
	if (slot === "large") {
		return nb.mwp[2]
	}
	return false;
}

nb.beastOnKill = function() {
	if (nb.class !== "BEAST") return;
	nb.tarStaggeringOrDazed = false;
}
nb.beastCheckOverclock = function(msg) {
	if (!nb.haveSkill("suittech","overclock") || ("ab_SuitTech_overclock" in nb.cooldowns)) return;
	if (nb.haveSkill("mwp","dualshot")) { //if we have dualshot, only use it with dualshot.
		if (msg === "mwp dualshot") {
			nb.send("overclock");
		}
		return;
	} else if (nb.haveSkill("mwp","hobble")) { //we don't have dualshot, only use it with hobble.
		if (msg === "mwp hoble") {
			nb.send("overclock");
		}
		return;
	} else { //we don't have dualshot or hobble but do have overclock for some reason, just use it.
		nb.send("overclock"); 
	}
}
nb.offense.BEAST = function(){
	var backhand = nb.haveSkill("suittech","backhand");
	var minigun = nb.haveSkill("mwp","minigun");
	var hobble = nb.haveSkill("mwp","hobble");
	var dualshot = nb.haveSkill("mwp","dualshot");
	var em = nb.tarIsMech && nb.haveSkill("mwp","emshot");
	if (!backhand && !hobble && !em) {
		//we do not use minigun, and must use plasma burn. Do not use heatup. 
		return "plasma burn "+nb.tar;
	}
	if (!("Plasma generation" in GMCP.Defences)) {
		return "heatup";
	}
	if (em) {
		return "mwp emshot "+nb.tar;
	}
	else if (dualshot) {
		//if we have dualshot, we have hobble
		if (!("ab_MWP_dualshot" in nb.cooldowns)) {
			return "dualshot "+nb.tar;
		} else {
			return "hobble "+nb.tar;
		}
	} else {
		if (nb.tarStaggeringOrDazed) {
			return "mwp minigun "+nb.tar;
		} else if (hobble) {
			return "mwp hobble "+nb.tar;
		} else if (backhand) {
			return "suit backhand "+nb.tar;
		}
	}
}
