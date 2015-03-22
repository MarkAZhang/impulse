var questData = {};

questData["beat_hive"] = {
	text: ["DEFEAT A HIVE"]
}

questData["final_boss"] = {
	text: ["DEFEAT THE FINAL BOSS"]
}

questData["untouchable"] = {
	text: ["BEAT ANY HIVE", "WITHOUT GETTING HIT"]
}

questData["high_roller"] = {
	score_cutoff: 250000,
	text: ["SCORE 250000 PTS OR MORE",
		  "ON A SINGLE ENEMY"]
}

questData["pacifist"] = {
	text: ["BEAT ANY LEVEL", "WITHOUT USING IMPULSE"]
}

questData["blitz_hive1"] = {
	text: ["BEAT HIVE 1 IN HARD MODE", "UNDER 12 MINUTES"],
	time_cutoff: 720
}

questData["blitz_hive2"] = {
	text: ["BEAT HIVE 2 IN HARD MODE", "UNDER 6 MINUTES"],
	time_cutoff: 400
}

questData["blitz_hive3"] = {
	text: ["BEAT HIVE 3 IN HARD MODE", "UNDER 7 MINUTES"],
	time_cutoff: 500
}

questData["blitz_hive4"] = {
	text: ["BEAT HIVE 4 IN HARD MODE", "UNDER 8 MINUTES"],
	time_cutoff: 600
}

questData["beat_hard"] = {
	text: ["DEFEAT ALL HIVES", "IN HARD MODE"]
}

module.exports = questData;
