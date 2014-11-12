imp_params.quest_data = {};

imp_params.quest_data["beat_hive"] = {
	rewards: ["ult"],
	text: ["DEFEAT A HIVE"]
}

imp_params.quest_data["final_boss"] = {
	rewards: ["life"],
	text: ["DEFEAT THE FINAL BOSS"]
}

imp_params.quest_data["untouchable"] = {
	rewards: ["spark"],
	text: ["BEAT ANY HIVE", "WITHOUT GETTING HIT"]
}

imp_params.quest_data["high_roller"] = {
	rewards: ["life"],
	score_cutoff: 250000,
	text: ["SCORE 250000 PTS OR MORE",
		  "ON A SINGLE ENEMY"]
}

imp_params.quest_data["pacifist"] = {
	rewards: ["life"],
	text: ["BEAT ANY LEVEL", "WITHOUT USING IMPULSE"]
}

imp_params.quest_data["blitz_hive1"] = {
	rewards: ["spark"],
	text: ["BEAT HIVE 1 IN HARD MODE", "UNDER 12 MINUTES"],
	time_cutoff: 720
}

imp_params.quest_data["blitz_hive2"] = {
	rewards: ["life"],
	text: ["BEAT HIVE 2 IN HARD MODE", "UNDER 6 MINUTES"],
	time_cutoff: 400
}

imp_params.quest_data["blitz_hive3"] = {
	rewards: ["life", "spark"],
	text: ["BEAT HIVE 3 IN HARD MODE", "UNDER 7 MINUTES"],
	time_cutoff: 500
}

imp_params.quest_data["blitz_hive4"] = {
	rewards: ["life", "spark", "ult"],
	text: ["BEAT HIVE 4 IN HARD MODE", "UNDER 8 MINUTES"],
	time_cutoff: 600
}

imp_params.quest_data["beat_hard"] = {
	rewards: ["life", "spark"],
	text: ["DEFEAT ALL HIVES", "IN HARD MODE"]
}
