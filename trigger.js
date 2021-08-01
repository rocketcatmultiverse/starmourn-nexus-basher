nb.crewRegex = /^\(Crew\): .+ says, "Target: (.+)\."$/
nb.interruptRegex = /^(\w+)(\s+)(.+)(\s+)\((.*)channeling attack(.*)\)$/
nb.IHRegex = /^(\w+)(\s+)(.*)$/
nb.trigger = function(c) {
	var res;
	if (c === "You have recovered your balance.") nb.onBal();
	else if (c.includes("You have slain")) {
		nb.onKill();
	}
	else if (nb.isInterruptLine(c)) {
		nb.interrupt = true;
		nb.send("ih");
	} else if ((xyz = nb.interruptRegex.exec(c)) !== null) {
		nb.debug("Interrupting mob "+JSON.stringify(xyz));
		nb.chanTar = xyz[1];
	} else if (c.includes("Items here:")) {
                nb.hideIH = true;
		gag_current_line();
	} else if (c.includes("Total:")) {
	        nb.hider();
	        nb.hideIH = false;
	} else if ((abc = nb.IHRegex.exec(c)) !== null) {
		nb.hider();
	} else if (c.includes("You have learned the following abilities in this session")) {
		display_notice("We notice you are gaining new skills. When you are finished learning, NBRELOAD so that Nexus Basher uses the best abilities", "green");
	} else if (c.includes("buzzes softly, but doesn't have enough power to attack.")) {
		nb.needQPCBoost = true; //this is simplistic to begin with. we'll need a way to tell if this is actually our turret.
	} else if (c === "The time distortion effect ends.") {
		nb.speedupHere= false;
	} else if (c === "The swirling point zero suddenly collapses into itself.") {
		nb.pzHere = false;
	} else if ((c === "Time has already been distorted at this location.") || (c === "Time has been strangely distorted here.")) {
		nb.speedupHere=true;
	} else if ((c === "Lifting your hand, you call upon the void within, seeking to form a sphere of absolute zero temperature, but realize there is one here already.") || (c === "Air swirls around a point of absolute coldness here.")) {
		nb.pzHere= true;
	} else if (c.includes("Rage flows through you")) {
		nb.unstoppableReady = true;
	} else if (c === "Your rage must grow until you are absolutely unstoppable before that ability can be used." ||
		c === "You haven't used enough rage attacks to become unstoppable!" || 
		c === "You are no longer raging.") {
		nb.unstoppableReady = false; //just a force fix in case user walks away and loses unstoppable timer
	} else if (c.includes("You collapse to the ground, killed")) {
		nb.onDeath();
	} else if ((res = nb.crewRegex.exec(c)) !== null) {
		nb.debug("Reached crew res with res "+JSON.stringify(res));
		if (nb.groupMode && !nb.groupLeader) nb.setTar(res[1]);
	} else if (c === "Your HUD indicates that you may use your life support system once again." ||
		c === "You can once again embrace the surrounding energies." ||
		c === "You can again use a stim." ||
		c === "It is safe to suffuse yourself with kith energy again.") {
		nb.onHealBalGained();
	} else if (c.includes("Your shot strikes home with a satisfying accuracy, afflicting")) {
		nb.tarAffs++;
	} else if (c.includes("glowing red from within as thousands of microscopic attacks draw blood.")) {
		nb.mltStrike=false;
	} else if (c.includes("The nanites disperse, no longer striking at")) {
		nb.mltStrike=true;
	}
	return false;
}

nb.echoTrigger = function(r) {
	display_notice(r);
	nb.trigger(r);
}
