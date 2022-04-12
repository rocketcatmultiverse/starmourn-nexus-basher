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
	if (nb.tarIsMech && nb.haveSkill("suittech","pulse")) {
		nb.send("overclock");
		return;
	}
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
	if (!("Plasma generation" in GMCP.Defences)) {
		return "heatup";
	}
	const em = nb.tarIsMech && nb.haveSkill("suittech","pulse");
	if (em) {
		return "suit pulse "+nb.tar;
	}
	const dualshot = nb.haveSkill("mwp","dualshot");
	if (!nb.configs.force_wallop_route.val && (!dualshot || nb.configs.use_burn_route.val)) { 
		return "plasma burn "+nb.tar;
	}
	const railcd = ("mwp_railgun" in nb.cooldowns);
	const dualshotcd = ("ab_MWP_dualshot" in nb.cooldowns);
	const headshot = nb.haveSkill("mwp","headshot");
	if (dualshot && !railcd && !dualshotcd && nb.hpperc > .8) {
		return "dualshot "+nb.tar+" headshot headshot";
	}
	else if (!railcd && headshot) {
		return "headshot "+nb.tar;
	}
	return "mwp wallop "+nb.tar;
}