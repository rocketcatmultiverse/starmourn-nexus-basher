nb.trigger = function(c) {
	if (c === "You have recovered your balance.") nb.onBal();
	else if (c.includes("You have slain")) {
		nb.interrupt = false;
		nb.tarCheck();
	}
	else if (nb.isInterruptLine(c)) nb.interrupt = true;
	else if (c.includes("You have learned the following abilities in this session")) {
		display_notice("We notice you are gaining new skills. When you are finished learning, NBRELOAD so that Nexus Basher uses the best abilities", "green");
	}
	return false;
}