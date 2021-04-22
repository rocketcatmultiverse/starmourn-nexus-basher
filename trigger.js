nb.trigger = function(c) {
	if (c === "You have recovered your balance.") nb.onBal();
	else if (c.includes("You have slain")) {
		nb.interrupt = false;
		nb.tarCheck();
	}
	else if (nb.isInterruptLine(c)) nb.interrupt = true;
	return false;
}