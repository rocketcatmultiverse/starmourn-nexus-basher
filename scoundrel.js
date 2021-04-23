var have = nb.haveSkill;

nb.offense.Scoundrel = function(){
	var fling = have("improvisation","fling");
	var eject = fling && nb.tarHealth > 20 && nb.bullets === 8 && have("gunslinging","eject");
	if (nb.bullets === 0 || eject) {
		if (fling) {
			if (eject) nb.send("gun eject");
			return "fling "+nb.scoundrelGetIEDFling()+" "+nb.tar;
		} else {
			return "gun quickload";
		}
	}
	var rf = have("gunslinging","rapidfire") && !("ab_Gunslinging_rapidfire" in nb.cooldowns);
	if (nb.bullets == 2 && rf) {
		return "gun rapidfire "+nb.tar;
	}
	if (have("gunslinging","ambush") && !("ab_Gunslinging_ambush" in nb.cooldowns)) {
		return eject+"gun ambush "+nb.tar;
	}
	if (rf) {
		return "gun rapidfire "+nb.tar;
	}
	return "gun crackshot "+nb.tar;
}

//for now we do not check that you actually have the ied...
nb.wantedIED = "";
nb.scoundrelGetIEDFling = function() {
	var ied = ""
	var mod = have("improvisation","shrapnel") ? "shrapnel " : "";
	if (tarHealth > 30 && have("improvisation","melter")) {
		ied = "melter";
	} else {
		ied = "ripper"; //don't need a skill check, we always have rippers if we have fling.
	}
	// we'll use this variable to warn the user they're out of it, shortcircuit to gun quickload if we get that awful message.
	nb.wantedIED = mod+ied;
	return nb.wantedIED; 
}