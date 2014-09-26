imp_params.quest_data = {};

imp_params.quest_data["beat_hive"] = {
	rewards: ["ult"],
	text: ["DEFEAT A HIVE"]
}

imp_params.quest_data["final_boss"] = {
	rewards: ["life"],
	text: ["DEFEAT THE FINAL BOSS"]
}

imp_params.quest_data["first_gold"] = {
	rewards: ["spark"],
	text: ["GET A GOLD SCORE", "ON ANY LEVEL"]
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
	text: ["BEAT HIVE 1 IN CHALLENGE MODE", "UNDER 5 MINUTES"],
	time_cutoff: 300
}

imp_params.quest_data["blitz_hive2"] = {
	rewards: ["life"],
	text: ["BEAT HIVE 2 IN CHALLENGE MODE", "UNDER 5 MINUTES"],
	time_cutoff: 400
}

imp_params.quest_data["blitz_hive3"] = {
	rewards: ["life", "spark"],
	text: ["BEAT HIVE 3 IN CHALLENGE MODE", "UNDER 5 MINUTES"],
	time_cutoff: 500
}

imp_params.quest_data["blitz_hive4"] = {
	rewards: ["life", "spark", "ult"],
	text: ["BEAT HIVE 4 IN CHALLENGE MODE", "UNDER 5 MINUTES"],
	time_cutoff: 600
}

imp_params.quest_data["1star"] = {
	rewards: ["life", "spark"],
	text: ["DEFEAT ALL HIVES", "IN CHALLENGE MODE"]
}

imp_params.quest_data["2star"] = {
	rewards: ["life", "spark", "ult"],
	text: ["GET 2-STAR ON ALL HIVES", "IN CHALLENGE MODE"]
}

imp_params.quest_data["3star"] = {
	rewards: [],
	text: ["GET 3-STAR ON ALL HIVES", "IN CHALLENGE MODE"]
}