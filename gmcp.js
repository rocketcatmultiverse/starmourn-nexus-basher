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
		nb.prios = r.ww_prios;
		if (nb.class === "B.E.A.S.T.") nb.class = "BEAST";
		eval("nb.cooldowns = {"+r.cooldowns+"}");
		switch (nb.class) {
			case "Scoundrel":
				nb.bullets = parseInt(r.bl);
				break;
			case "Fury":
				nb.stance = r.st;
				break;
			case "Nanoseer":
				nb.sanity = r.sa;
				nb.nanites = r.nn;
				break;
			case "BEAST":
				nb.mwp = r.mwp;
			default:
				break;
		}
		nb.checkVitalsWaiting();
	} else if (m === "IRE.CombatMessage") {
		for (let msg in r) {
			//only one property in combatmessages, grab the prop name
			nb.combatMessage(msg, r[msg].caster, r[msg].target, r[msg].message);
			break;
		}
	} else if (m === "Char.Skills.List") {
		nb.skillsList(r);
	} else if (m === "Char.Skills.Info") {
		nb.skillsInfo(r);
	} else if (m === "IRE.Target.Info") {
		nb.tarHealth = parseInt(r.hpperc.replace("%",""))
	} else if (m === "Char.Items.List") {
		if (r.location !== "room") return;
		nb.itemsList(r);
	} else if (m === "Char.Items.Add") {
		if (r.location !== "room") return;
		nb.itemsAdd(r);
	} else if (m === "Char.Items.Remove") {
		if (r.location !== "room") return;
		nb.itemsRemove(r);
	} else if (m === "Room.Info") {
		nb.roomInfo(r);
	}
	return false;	
}

nb.roomInfo = function(r){
	if (r.num !== nb.vnum) nb.onRoomChange(r);
	nb.vnum = r.num
}

nb.onRoomChange = function(newRoomInfo) {
	nb.interrupt=false; //a bit naive...
	nb.speedupHere=false;
	nb.pzHere=false;
	nb.mltStrike=true;
}

nb.itemsHere = [];
nb.itemsList = function(r) {
	if (r.location !== "room") return; //shoudn't happen, but just in case.
	nb.itemsHere=[];
	r.items.forEach(function(el){
		for (let i = 0; i < nb.itemsHere.length; i++) {
			if (el.id === nb.itemsHere[i].id) return;
		}
		nb.itemsHere.push(el);
	});
	nb.calcTarsHere();
}

nb.itemsAdd = function(r){
	if (r.location !== "room") return; //shoudn't happen, but just in case.
	for (let i = 0; i < nb.itemsHere.length; i++) {
		if (r.item.id === nb.itemsHere[i].id) return; // don't add an item that's already in our list.
	}
	nb.itemsHere.push(r.item);
	nb.calcTarsHere();
}

nb.itemsRemove = function(r) {
	if (r.location !== "room") return; //shoudn't happen, but just in case.
	for (let i = 0; i < nb.itemsHere.length; i++) {
		if (r.item.id === nb.itemsHere[i].id) {
			nb.itemsHere.splice(i,1);
			nb.calcTarsHere();
			return;
		}
	}
}

nb.combatMessage = function(msg, caster, target, text) {
	nb.debug("nb.combatMessage called with msg, caster, target, text: "+msg +","+ caster +","+ target+","+ text);
	//if (!nb.me(caster)) return;
	msg = msg.toLowerCase(); 
	//naive, but it will work for most situations.
	if (nb.configs.trust_other_interrupts.val || (caster && nb.me(caster))) {
		switch (msg) {
			case "guile pocketsand":
			case "gun pointblank":
			case "kith fever":
			case "rage stun":
			case "bot swing":
			case "gadgets shock":
			case "mwp netlaunch":
			case "plasma sear":
			case "plasma flash":
			case "nanotech eyestrike":
			case "neural blinder":
				nb.interrupt = false;
				return;
			default:
				break;
		}
	}

	if (msg === "turret qpcboost") { nb.needQPCBoost = false; return; }
	if (msg === "void point zero") { nb.pzHere = true; return; }
	if (msg === "nanotech multistrike") { nb.mltStrike = false; return; }
	if (msg === "nanotech multistrike hit") { nb.mltStrike = false; return; }
	if (msg === "oblivion speedup") { nb.speedupHere = true; return; }
	if (msg.split(" ")[0] === "rage") { nb.rageSent = true; }
	if (msg.split(" ")[0] === "blade") { nb.rageSent = false; }
	if (msg === "rage unstoppable") { nb.unstoppableReady = false; return; }
	if (msg.split(" ")[0] === "mwp") { nb.beastCheckOverclock(msg); }
	if ((msg === "mwp hobble") || (msg === "suit backhand"))  { nb.tarStaggeringOrDazed = true; return; }
}
