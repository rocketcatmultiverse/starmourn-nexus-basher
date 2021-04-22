nb.trigger = function(c) {
	if (c === "You have recovered your balance.") nb.onBal();
	else if (c.includes("You have slain")) nb.tarCheck();
	return false;
}