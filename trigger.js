nb.trigger = function(c) {
	if (c === "You have recovered your balance.") nb.onBal();
	else if (c.includes("You have slain")) {
		nb.onKill();
	}
	else if (nb.isInterruptLine(c)) nb.interrupt = true;
	else if (c.includes("You have learned the following abilities in this session")) {
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
	}
	return false;
}