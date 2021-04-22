nb = {}
nb.class = get_variable("my_class");
nb.alias = function(c) {
	if (c === "c") {
		nb.calc();
		return true;
	}
	return false;
}

nb.send = function(cmd) {
	send_command(cmd,1);
}

nb.calc = function() {
	if (!nb.bal) return;
	let needMend = nb.needMend; 
	if (needMend) nb.send(needMend, 1);
	let needHeal = nb.needHeal;
	if (needHeal) nb.send(needHeal, 1);

}

nb.error = function(m) {
	display_notice("Error: "+m,"red");
}

nb.sendHeal = function(){
	if (nb.hpperc > NB.HEALTH_THRESHOLD) return false;
	if ()
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
	}
}

nb.needMend = function(){
	for (let sys in nb.sys.health) {
		if (nb.sys.health[sys] < 92.5 && nb.sys.efficacy[sys] === 100) {
			return "ww mend "+sys;
		}
	}
	return false;
}

nb.trigger = function(c) {
	if (c === "You have recovered your balance.") nb.onBal();
	return false;
}

nb.onBal = function(){
	nb.calc();
}

nb.sys = {};
nb.sys.health = {};
nb.sys.efficacy = {};
nb.systems = ['muscular','internal','sensory','mind','wetwiring'];
nb.gmcp = function(m, r) {
	if (m === "Char.Vitals") {
		nb.systems.forEach(function(sys){
			nb.sys.health[sys] = parseFloat(r[sys]);
			nb.sys.efficacy[sys] = parseFloat(eval(r[sys]+"_efficacy"));
		});
		nb.bal = r.bal == "1" ? true : false;
		nb.wwBal = r.ww == "1" ? true : false;
		nb.hpperc = parseInt(r.hp)/parseInt(r.maxhp);
		nb.class = r.class;
		nb.cooldowns = JSON.parse(r.cooldowns);
	} 
	return false;	
}

display_notice("Nexus community basher has loaded successfully","green");