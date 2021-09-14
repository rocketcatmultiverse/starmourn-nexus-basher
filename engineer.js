nb.needQPCBoost = false;
nb.offense.Engineer = function(){
	if (!nb.configs.no_qpcboost.val && nb.needQPCBoost) return 'qpcboost';
	if (nb.configs.use_shock_rotation) return "gadget shock "+nb.tar;
	return "bot claw "+nb.tar;
}