nb.trigger = function(c) {
	if (c === "You have recovered your balance.") nb.onBal();
	else if (c.includes("You have slain")) {
		nb.interrupt = false;
		nb.tarCheck();
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
	} else if (c === "Time has already been distorted at this location.") {
		nb.speedupHere=true;
	} else if (c === "Lifting your hand, you call upon the void within, seeking to form a sphere of absolute zero temperature, but realize there is one here already.") {
		nb.pzHere= true;
	}
	return false;
}