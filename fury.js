nb.toStance= ""
nb.unstoppableReady=false;
nb.offense.Fury = function(){
	var strike = nb.haveSkill("rage","strike");
	var gutrend = nb.haveSkill("battleflow","gutrend");
	var flyinglash = nb.haveSkill("rage","flyinglash");
	var sear = nb.haveSkill("battleflow","sear");
	var legspike = nb.haveSkill("rage","legspike");
	var wound = nb.haveSkill("battleflow","wound");
	var rupture = nb.haveSkill("battleflow","rupture");
	var deepstrike = nb.haveSkill("rage","deepstrike");
	var unstoppable = nb.haveSkill("rage","unstoppable");
	var slice = nb.haveSkill("rage","slice");
	if (!(gutrend && flyinglash && sear && strike)) return "kith burn "+nb.tar;
	var blade = ""
	var rage = ""
	nb.toStance = ""
	var combo = ""
	if (nb.stance === "Symmetry") {
		blade = "gutrend";
		nb.toStance = "Flare";
	} else if (nb.stance === "Flare") {
		if (wound && rupture) {
			blade = "wound";
			nb.toStance = "Eruption"
		} else {
			blade = "sear";
			nb.toStance = "Symmetry";
		}
	} else if (nb.stance === "Eruption") {
		blade = "rupture";
		nb.toStance = "Flare";
	}

	if (slice && nb.unstoppableReady && !("Rage unstoppable" in GMCP.Defences)) {
		rage = "unstoppable";
	} else if ("Rage unstoppable" in GMCP.Defences) {
		rage = "slice";
	} else {
		if (nb.toStance === "Symmetry") {
			rage = "strike";
		} else if (nb.toStance === "Flare") {
			rage = "flyinglash";
		} else if (nb.toStance === "Eruption") {
			if (!nb.haveSkill("rage","deepstrike")) {
				combo = "blade wound "+nb.tar; //just send the blade attack, still more effective than previous rotation even without a rage.
			} else {
				rage = "deepstrike";
			}
		}
	}
	if (combo) return combo;
	if (!blade) {
		nb.error("Blade attack not found, you might be off stance?");
		return "kith burn "+nb.tar;
	} else if (!rage) {
		nb.error("Rage attack not found, you might be off stance?");
		return "kith burn "+nb.tar;
	}
	combo = "combo "+blade +" "+ rage;
	if (rage !== "unstoppable") combo+=" "+nb.tar;
	return combo;
}

nb.rageSent = false;

nb.furyOnKill = function(){
	if (!nb.go) return;
	if (nb.class !== "Fury") return;
	if (nb.rageSent) return;
	if (!nb.toStance) return;
	//send extra stuff if we just killed something with our blade
	if (nb.haveSkill("rage","overpower") && ("Rage unstoppable" in GMCP.Defences) && !("Rage overpower" in GMCP.Defences)) {
		nb.send("rage overpower");
	} else if (nb.haveSkill("rage", "berserk") && (nb.toStance === "Flare") && !("Rage berserk" in GMCP.Defences)){
		nb.send("rage berserk");
	} else if (nb.haveSkill("rage","resistant") && (nb.toStance === "Ember") && !("Rage resistant" in GMCP.Defences)) {
		nb.send("rage resistant"); //shouldn't happen in our rotation, but w/e, it's here...
	}
}