nb = {};
nb.class = get_variable("my_class");
if (nb.class === "B.E.A.S.T.")
    nb.class = "BEAST";
nb.go = false;
nb.tar = "";
nb.chanTar = "";
nb.offense = {};
nb.sys = {};
nb.interrupt = false;
nb.hideIH = false;
nb.sys.health = {};
nb.sys.efficacy = {};
nb.debugMode = false;
nb.prios = "has";
nb.mwp = "";
nb.tarAffs = 0;
nb.checkForUpdates = nb.checkForUpdates || true;
nb.tarIsMech = false;
nb.systems = [
    "muscular",
    "internal",
    "sensory",
    "mind",
    "wetwiring"
];
nb.calcOffense = {};
nb.calcOffense.BEAST = function () {
};
nb.calcOffense.Engineer = function () {
};
nb.calcOffense.Fury = function () {
};
nb.calcOffense.Nanoseer = function () {
};
nb.calcOffense.Scoundrel = function () {
};
nb.tarHealth = 100;
nb.tarsHere = 0;
nb.vnum = 0;
nb.vitalsWaiting = false;
nb.groupMode = false;
nb.groupLeader = false;
nb.send = function (cmd) {
    send_command(cmd, 1);
};

nb.calc = function () {
    if (!nb.go)
        return;
    if (!nb.bal)
        return;
    let needInterrupt = nb.needInterrupt();
    if (needInterrupt) {
        nb.send(needInterrupt);
        return;
    }
    let needMend = nb.needMend();
    if (needMend) {
        nb.send(needMend);
        return;
    }
    let needHeal = nb.needHeal();
    if (needHeal) {
        nb.send(needHeal);
        return;
    }
    //we're gonna check for our target on every bal for now.
    let tarHere = nb.tarCheck();
    if (tarHere && !nb.vitalsWaiting)
        nb.attack();
};
nb.checkVitalsWaiting = function () {
    if (!nb.vitalsWaiting || !nb.go)
        return;
    let v = nb.configs.heal_after_each_mob.val;
    if (!v)
        return;
    if (nb.hpperc > v) {
        nb.vitalsWaiting = false;
        nb.calc();
    }
};
nb.onHealBalGained = function () {
    if (!nb.go || !nb.bal)
        return;
    if (nb.configs.heal_full_after_room_clear.val && !nb.tarsHere) {
        nb.send(nb.getClassHeal());
        return;
    }
    if (nb.configs.heal_after_each_mob.val && nb.vitalsWaiting) {
        nb.send(nb.getClassHeal());
        return;
    }
};
nb.getClassHeal = function () {
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
        return "void embrace";
    default:
        nb.error("Invalid class " + nb.class + " provided to nb.getClassHeal");
        return false;
    }
};
nb.onKill = function () {
    nb.interrupt = false;
    nb.tarCheck();
    nb.furyOnKill();
    nb.beastOnKill();
    nb.tarAffs=0;
    nb.mltStrike = true;
    let v = nb.configs.heal_after_each_mob.val;
    if (!v)
        return;
    if (nb.hpperc < v) {
        nb.vitalsWaiting = true;
    }
};
nb.attack = function () {
    nb.send(nb.offense[nb.class]());
};
nb.tarCheck = function () {
    //is our target still here?
    if (nb.groupMode && !nb.groupLeader)
        return true;
    var mobsHere = nb.itemsHere;
    nb.debug(JSON.stringify(mobsHere));
    if (nb.tar !== "") {
        for (var i = 0; i < mobsHere.length; i++) {
            if (mobsHere[i].id === nb.tar)
                return true;
        }
    }
    //no, let's get a new one if we can.
    nb.debug(JSON.stringify(nb.mobs));
    nb.tarAffs=0;
    for (i = 0; i < nb.mobs.length; i++) {
        if (nb.ignores.includes(nb.mobs[i].toLowerCase()))
            continue;
        //don't target this mob if we have ignored it.
        for (let k = 0; k < mobsHere.length; k++) {
            if (mobsHere[k].name.toLowerCase() === nb.mobs[i].toLowerCase()) {
                nb.setTar(mobsHere[k].id);
                if (nb.mechanicals.includes(nb.mobs[i])) { nb.tarIsMech = true; }
                else { nb.tarIsMech = false; }
                return true;
            }
        }
    }
    //no mob here to bash.
    display_notice("No mobs here.", "red");
    nb.tarIsMech = false;
    return false;
};
nb.setTar = function (t) {
    nb.tar = t;
    send_GMCP("IRE.Target.Set", nb.tar);
    if (nb.groupMode && nb.groupLeader)
        nb.send("crt Target: " + nb.tar);
};
nb.calcTarsHere = function () {
    var res = 0;
    for (var i = 0; i < nb.itemsHere.length; i++) {
        for (var k = 0; k < nb.mobs.length; k++) {
            if (nb.itemsHere[i].name.toLowerCase() === nb.mobs[k].toLowerCase()) {
                res++;
            }
        }
    }
    nb.tarsHere = res;
};
nb.needInterrupt = function () {
    if (!nb.interrupt) {
        return false; }
    switch (nb.class) {
    case "Engineer":
        return "gadget shock " + nb.chanTar;
    case "Scoundrel":
        if (nb.bullets === 0) {
            return "guile pocketsand " + nb.chanTar;
        } else {
            return "gun pointblank " + nb.chanTar;
        }
    case "BEAST":
        //if (nb.mwpActive("netlauncher")) return "netlaunch "+nb.tar; //this would be better
        if (nb.haveSkill("mwp", "dualshot") && !("ab_MWP_netlaunch" in nb.cooldowns))
            return "netlaunch " + nb.chanTar;
        return "plasma flash " + nb.chanTar;
    case "Fury":
        return "kith fever " + nb.chanTar;
    case "Nanoseer":
        return "nano eyestrike " + nb.chanTar;
    default:
        nb.error("Invalid class " + nb.class + " provided to nb.sendHeal");
        return false;
    }
};
nb.reset = function () {
    nb.vitalsWaiting = false;
    nb.interrupt = false;
    nb.unstoppableReady = false;
    nb.tarStaggeringOrDazed = false;
    nb.speedupHere = false;
    nb.pzHere = false;
    nb.tar = "";
    nb.tarAffs = 0;
    nb.mltStrike = true;
    nb.tarIsMech = false;
};
nb.onDeath = function () {
    nb.reset();
    if (nb.go) {
        display_notice("Nexus basher has stopped.");
        nb.go = false;
    }
};
nb.needHeal = function () {
    if (nb.hpperc > nb.configs.hp_heal_threshold.val)
        return false;
    if (nb.healCd())
        return false;
    return nb.getClassHeal();
};
nb.healCd = function () {
    switch (nb.class) {
    case "Engineer":
        return false;
    case "Scoundrel":
        return "ab_Guile_stim" in nb.cooldowns;
    case "BEAST":
        return "ab_SuitTech_support" in nb.cooldowns;
    case "Fury":
        return "ab_Fulmination_suffuse" in nb.cooldowns;
    case "Nanoseer":
        return "ab_Voidism_embrace" in nb.cooldowns;
    default:
        nb.error("Invalid class " + nb.class + " provided to nb.sendHeal");
        return false;
    }
};
nb.needMend = function () {
    if (!nb.wwBal)
        return false;
    for (let sys in nb.sys.health) {
        if (nb.sys.health[sys] < 92.5 && nb.sys.efficacy[sys] === 100) {
            return "ww mend " + sys;
        }
    }
    return false;
};
nb.onBal = function () {
    nb.calc();
};
nb.hider = function () {
    if (!nb.go) return false;
    if (!nb.interrupt) return false;
    if (nb.hideIH) {
        gag_current_line();
    }
};
nb.updateCheck = function () {
    if (!nb.checkForUpdates)
        return;
    var promise = $.when(1);
    promise = promise.then(function () {
        return $.ajax({ url: "https://raw.githubusercontent.com/rocketcatmultiverse/starmourn-nexus-basher/main/VERSION" }).done(function (data) {
            console.log("nb.updateCheck trying eval of VERSION");
            console.log([data]);
            try {
                let v = eval(data);
                if (typeof v !== "number")
                    v = parseInt(v);
                console.log("Client version is " + nb.version.nxs + ". Current version is " + v + ".");
                if (v > nb.version.nxs) {
                    display_notice("WARNING: Your .nxs for Nexus community basher is out of date. You may wish to download the latest release from https://github.com/rocketcatmultiverse/starmourn-nexus-basher/releases and replace your existing .nxs with the new one", "yellow");
                } else if (v < nb.version.nxs) {
                    display_notice("I hope you are on a test version of the .nxs!", "yellow");
                } else {
                    console.log("Nb nxs is up to date.");
                }
            } catch (err) {
                console.log("error in nb.updateCheck: " + err);
            }
        });
    });
};
nb.onLoad = function () {
    display_notice("Starmourn Community Nexus Basher has loaded with no errors!", "green");
    nb.parseSkills();
    send_GMCP("Char.Items.Room", "");
    //to populate nb.itemsHere.
    nb.reloadUserConfigs();
};
nb.onGo = function () {
    nb.reset();
    if (nb.prios !== "has") {
    	nb.warn("NB recommends you WETWIRING PRIORITIES HEALTH AFFLICTIONS SYSTEMS while hunting.");
    }
    if (nb.class === "Engineer") {
        if (!("Stimjector" in GMCP.Defences)) {
            nb.warn("Your stimjector is off. Make sure to OPERATE STIMJECTOR " + GMCP.Character.name + " ON before you start.");
        }
        var botFound = false;
        var turretFound = false;
        for (let i = 0; i < nb.itemsHere.length; i++) {
            if (nb.itemsHere[i].name === "a crane-armed carrybot")
                botFound = true;
            if (nb.itemsHere[i].name.includes("a deployed turret"))
                turretFound = true;
            if (botFound && turretFound)
                break;
        }
        if (!botFound) {
            if (nb.haveSkill("bots", "homeport")) {
                nb.warn("Nexus basher doesn't see a carrybot where you are. Use HOMEPORT or construct a new one! You can force your bots to follow you with ORDER LOYALS FOLLOW.");
            } else {
                nb.warn("Nexus basher doesn't see a carrybot where you are. BOT CONSTRUCT CARRYBOT to construct a new one or LOYALS LIST to find where your old one has gotten to. Look to learning BOT HOMEPORT soon! You can force your bots to follow you with ORDER LOYALS FOLLOW.");
            }
        }
        if (!turretFound) {
            nb.warn("Nexus basher doesn't see a turret where you are. TURRET CONSTRUCT, TURRET DEPLOY, and order your Carrybot to carry the turret for you with BOT TURRET!");
        }
    } else if (nb.class === "Nanoseer") {
        var traveller = nb.haveEmp("traveller");
        var conqueror = nb.haveEmp("conqueror");
        if (nb.haveSkill("oblivion", "affinity")) {
            if (!(traveller && conqueror)) {
                nb.warn("Nexus basher recommends channeling Traveller and Affinity Conqueror for best effect.");
            }
        }
    } else if (nb.class === "Fury") {
        if (nb.haveSkill("fulmination", "windshape")) {
            display_notice("Don't forget to WINDSHAPE BLADE!", "orange");
        }
    } else if (nb.class === "BEAST") {
        var backhand = nb.haveSkill("suittech", "backhand");
        var minigun = nb.haveSkill("mwp", "minigun");
        var hobble = nb.haveSkill("mwp", "hobble");
        var dualshot = nb.haveSkill("mwp", "dualshot");
        var routing = nb.haveSkill("suittech", "routing");
        var routingNow = "";
        if ("Suit routing" in GMCP.Defences) {
            if (GMCP.Defences["Suit routing"].desc.includes("large"))
                routingNow = "large";
            if (GMCP.Defences["Suit routing"].desc.includes("medium"))
                routingNow = "medium";
            if (GMCP.Defences["Suit routing"].desc.includes("small"))
                routingNow = "small";
        }
        if (dualshot) {
        	if (nb.mwp !== "snr") {
            	nb.warn("Make sure your railgun is active. Otherwise we recommend netlauncher and shield.");
        	}
            if (routing && routingNow !== "large")
                nb.warn("Make sure to SUIT ROUTE LARGE.");
        } else if (hobble) {
        	if (nb.mwp[1] !== "m" && nb.mwp[2] !== "r")
            	nb.warn("Make sure your minigun and railgun are active. Note that NB currently will not switch to netlauncher if you do not have enough plasma for flash. So RESISTANCE ON if you do not want to take the chance against mobs with channels.");
        	if (routing && routingNow !== "medium")
                nb.warn("Make sure to SUIT ROUTE MEDIUM.");
        } else if (minigun && backhand) {
        	if (nb.mwp[1] !== "m")
            	nb.warn("Make sure your minigun is active! Note that NB currently will not switch to netlauncher if you do not have enough plasma for flash. So RESISTANCE ON if you do not want to take the chance against mobs with channels.");
            if (routing && routingNow !== "medium")
                nb.warn("Make sure to SUIT ROUTE MEDIUM.");
        } else {
            nb.warn("We will use PLASMA BURN to bash. Make sure to HEATUP and PLASMA RESISTANCE ON to make sure you always have enough plasma.");
        }
    }
};
display_notice("Welcome to the Starmourn Community Nexus Basher!", "green");
