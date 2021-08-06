var have = nb.haveSkill;

nb.offense.Scoundrel = function(){
	var fling = nb.haveSkill("improvisation","fling");
	var eject = fling && !("ab_Gunslinging_eject" in nb.cooldowns) && nb.bullets === 8 && nb.haveSkill("gunslinging","eject");
	//this is simplistic logic for haymaker for now, we can improve it later
	var haymaker = nb.haveSkill("guile","haymaker") && nb.configs.use_haymaker.val && nb.tarAffs >= nb.configs.haymaker_aff_threshold.val
	if (haymaker) {
		return "guile haymaker "+nb.tar+nb.configs.haymaker_limb.val;
	}
	if (nb.bullets === 0 || eject) {
		if (fling) {
			if (eject) nb.send("gun eject");
			return "ied fling "+nb.scoundrelGetIEDFling()+" at "+nb.tar;
		} else {
			return "gun quickload";
		}
	}
	var rf = nb.bullets >= 2 && nb.haveSkill("gunslinging","rapidfire") && !("ab_Gunslinging_rapidfire" in nb.cooldowns);
	if (nb.bullets == 2 && rf) {
		return "gun rapidfire "+nb.tar;
	}
	if (nb.haveSkill("gunslinging","ambush") && !("ab_Gunslinging_ambush" in nb.cooldowns)) {
		return "gun ambush "+nb.tar;
	}
	if (rf) {
		return "gun rapidfire "+nb.tar;
	}
	return "gun crackshot "+nb.tar;
}

//for now we do not check that you actually have the ied...
nb.wantedIED = "";
nb.scoundrelGetIEDFling = function() {
	if (nb.configs.override_ied_type.val) {
		nb.wantedIED = nb.configs.override_ied_type.val;
		return nb.configs.override_ied_type.val;
	}
	var ied = ""
	var mod = nb.haveSkill("improvisation","shrapnel") ? "shrapnel " : "";
	if ((nb.tarHealth/100) > nb.configs.melter_target_hp_threshold.val && nb.haveSkill("improvisation","melter")) {
		ied = "melter";
	} else {
		ied = "ripper"; //don't need a skill check, we always have rippers if we have fling.
	}
	// we'll use this variable to warn the user they're out of it, shortcircuit to gun quickload if we get that awful message.
	nb.wantedIED = mod+ied;
	return nb.wantedIED; 
}
