nb.speedupHere = false;
nb.pzHere = false;
nb.haveEmp = function(e){
  var e = e.toLowerCase();
  for (var d in GMCP.Defences) {
    if (!("desc" in GMCP.Defences[d])) {
      nb.error("Desc field not found in GMCP.Defences.")
      return false;
    }
    if (GMCP.Defences[d].desc.toLowerCase().includes("e")) return true;
  }
}

nb.offense.Nanoseer = function(){
	//our bashing routine changes considerably once we have access to oblivion affinity.
	//Hallucinations starts at below 20% sanity, so try to not go below.
	// Frenzy costs 15% sanity
	// Speedup costs 20%
	// Swap costs 20%
	var frenzyTest = nb.haveSkill("oblivion","frenzy") && !("oblivion frenzy" in GMCP.Defences) && !("ab_Oblivion_frenzy" in nb.cooldowns);
	var speedupTest = nb.haveSkill("oblivion","speedup") && ( nb.targetsHere > 1 ) && !("ab_Oblivion_speedup" in nb.cooldowns) && !(nb.speedupHere);
	var sanity = nb.sanity;

  if (nb.haveSkill("oblivion","affinity")) {
		if (nb.haveEmp("conqueror") && sanity > 350 && frenzyTest) {
			sanity = sanity-150;
			nb.send('frenzy'); //this is balanceless, so keep doing things, but change our local sanity in case gmcp.Char.Vitals doesn't have time to update
		}
		if (haveEmp("traveller") && sanity > 400) { 
      return "speedup";
		}
	} else {
    // if we have speedup, then we also have frenzy and we need to swap around.
    if (nb.haveSkill("oblivion","speedup")) {
      if (nb.haveEmp("conqueror")) {
        if (frenzyTest && sanity > 350) {
          sanity = sanity-150;
          nb.send("frenzy");
        }
        //if we want to speedup but are on conqueror, we adjust our sanity test to include swap.
        if (speedupTest && !("ab_Oblivion_swap" in nb.cooldowns) && sanity > 600) {
          nb.send("swap traveller");
          return 'speedup';
        }
      } else if (haveEmp("traveller")) {
        if (speedupTest && sanity > 400) {
          return "speedup";
        } else {
          if (frenzyTest && sanity > 550) {
            nb.send("swap conqueror|frenzy"); //we should grab the user's command separator from Nexus in the future.
          }
        }
      } else { //we are on some other empyreal, go back to traveller which lets us get back the most sanity
        if (!("ab_Oblivion_swap" in nb.cooldowns)) {
          nb.send("swap traveller");
        }
      }
    } else if (frenzyTest) { //we do not have speedup but we do have frenzy 
      if (!nb.haveEmp("conqueror")) {
        if (sanity > 550) nb.send("swap conqueror|frenzy");
      } else {
        if (sanity > 350) nb.send("frenzy");
      }
    }
	}
  //we will need a config to disable pointzero, it's not required once you have crits.
  var pzTest = nb.haveSkill("voidism","pointzero") && (nb.targetsHere > 3) && !nb.pzHere;
  //phew... time for the easy part.
  if (pzTest) {
    return "pointzero";
  }
	return "void freeze "+nb.tar;
}