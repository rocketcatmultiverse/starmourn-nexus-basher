try {
1 ==== 2;
display_notice("Nexus community basher has loaded successfully","yellow");

} catch (err) {
	display_notice("Nexus community basher has failed to load. Check console for error message.","red");
	console.log(err);
}
nb = {};
