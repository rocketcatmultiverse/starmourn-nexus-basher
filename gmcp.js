nb.gmcp = function(m, r) {
	if (m === "Char.Vitals") {
		nb.systems.forEach(function(sys){
			nb.sys.health[sys] = parseFloat(r[sys]);
			nb.sys.efficacy[sys] = parseFloat(r[sys+"_efficacy"]);
		});
		nb.bal = r.bal == "1" ? true : false;
		nb.wwBal = r.ww == "1" ? true : false;
		nb.hpperc = parseInt(r.hp)/parseInt(r.maxhp);
		nb.class = r.class;
		if (nb.class === "B.E.A.S.T.") nb.class = "BEAST";
		eval("nb.cooldowns = {"+r.cooldowns+"}");
		switch (nb.class) {
			case "Scoundrel":
				nb.bullets = parseInt(r.bl);
				break;
			case "Fury":
				nb.stance = r.st;
				break;
			default:
				break;
		}
	} else if (m === "IRE.CombatMessage") {
		for (let msg in r) {
			//only one property in combatmessages, grab the prop name
			nb.combatMessage(msg, r.caster, r.target, r.message);
			break;
		}
	}
	return false;	
}

nb.combatMessage = function(msg, caster, target, text) {
	if (!nb.me(caster)) return;
	let msg = msg.toLowerCase(); 
	//naive, but it will work for most situations.
	switch (msg) {
		case "guile pocketsand":
		case "gun pointblank":
		case "kith fever":
		case "bot swing":
		case "mwp netlaunch":
			nb.interrupt = false;
			break;
		default:
			break;
	}
}