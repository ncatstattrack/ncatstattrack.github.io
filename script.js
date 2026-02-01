
// Global Variables
let mode = null;

// Caching Variables
let playerNames = null;
let playerNameToID = null;
let teamNames = null;
let teamAbbToName = null;


// Event calls
// Display/Hide find season range
window.addEventListener("DOMContentLoaded", function() {
    if (document.getElementById("find-season")) {
        document.getElementById("find-season").addEventListener("change", function() {
            if (this.checked) {
                document.getElementById("find-season-range-block").style.display = "table-row";
            }
        });
    }
    if (document.getElementById("find-career")) {
        document.getElementById("find-career").addEventListener("change", function() {
            if (this.checked) {
                document.getElementById("find-season-range-block").style.display = "none";
            }
        });
    }
    if (document.getElementById("compare-season")) {
        document.getElementById("compare-season").addEventListener("change", function () {
            if (this.checked) {
                document.getElementById("compare-season-range-block").style.display = "table-row";
            }
        });
    }
    if (document.getElementById("compare-career")) {
        document.getElementById("compare-career").addEventListener("change", function () {
            if (this.checked) {
                document.getElementById("compare-season-range-block").style.display = "none";
            }
        });
    }
});


// Website Scriting
// Get player info
async function getPlayerInfo() {

    // Call for player info
    await callPlayerInfo();

    // Call for team info
    await callTeamInfo();

    // Make player input list and allow search
    let playerInputList = "";
    for (let i = 0; i < playerNames.length; i++) {
        playerInputList += (`<option value="${playerNames[i]}"></option>`);
    }
    document.getElementById("waiting-message").style.display = "none";
    document.getElementById("find-player-list").innerHTML = playerInputList;
    document.getElementById("compare-player-list-1").innerHTML = playerInputList;
    document.getElementById("compare-player-list-2").innerHTML = playerInputList;
    mode = "compare";
    switchPlayerStatMode();

}

// Switches modes for player
function switchPlayerStatMode() {

    manageFooterBuffer(true);
    if (mode === "find") {
        
        document.getElementById("display-find-player-stats").style.display = "none";
        document.getElementById("display-find-player-stats").innerHTML = "";
        document.getElementById("search-find-player-stats").style.display = "none";
        document.getElementById("display-compare-player-stats").style.display = "block";
        document.getElementById("search-compare-player-stats").style.display = "block";
        mode = "compare";

    } else if (mode === "compare") {

        document.getElementById("display-compare-player-stats").style.display = "none";
        document.getElementById("display-compare-player-stats").innerHTML = "";
        document.getElementById("search-compare-player-stats").style.display = "none";
        document.getElementById("display-find-player-stats").style.display = "block";
        document.getElementById("search-find-player-stats").style.display = "block";
        mode = "find";

    }

}

// Get stats for player
async function getPlayerStats() {

    // Setup
    manageFooterBuffer(true);
    if (mode === "find") {
        document.getElementById("display-find-player-stats").innerHTML = "Loading...";
    } else if (mode === "compare") {
        document.getElementById("display-compare-player-stats").innerHTML = "Loading...";
    }
    let innerHTML = "Please fix the following errors:";
    let seasonRegex = /^\d{4}-\d{2}$/;

    // Find player
    if (mode === "find") {

        // Get and validate submitted values
        const playerName = document.getElementById("find-player-input").value;
        let validated = false;
        for (let i = 0; i < playerNames.length; i++) {
            if (playerName === playerNames[i]) {
                validated = true;
            }
        }
        if (!validated) {
            innerHTML += "<br>- Invalid Name";
        }
        let careerSeason = document.querySelector('input[name="find-career-season"]:checked').value;
        let seasonType = document.querySelector('input[name="find-season-type"]:checked').value;
        let from = document.getElementById("find-from-input").value;
        let to = document.getElementById("find-to-input").value;
        if (careerSeason == "season" && from.match(seasonRegex) == null) {
            from = "None";
            document.getElementById("find-from-input").value = from;
        }
        if (careerSeason == "season" && to.match(seasonRegex) == null) {
            to = "None";
            document.getElementById("find-to-input").value = to;
        }
        if (careerSeason == "season" && from.match(seasonRegex) != null && to.match(seasonRegex) != null && (parseInt(to.substring(0, 4)) <= parseInt(from.substring(0, 4)))) {
            innerHTML += '<br>- "From" season should be before "To" season'
        } else if (careerSeason == "season") {
            if (from !== "None") {
                let num = parseInt(from.substring(0, 4)) + 1;
                document.getElementById("find-from-input").value = from.substring(0, 4) + "-" + num.toString().substring(2, 4);
                from = parseInt(from.substring(0, 4))
            }
            if (to !== "None") {
                num = parseInt(to.substring(0, 4)) + 1;
                document.getElementById("find-to-input").value = to.substring(0, 4) + "-" + num.toString().substring(2, 4);
                to = parseInt(to.substring(0, 4));
            }
        }
        if (innerHTML !== "Please fix the following errors:") {
            document.getElementById("display-find-player-stats").innerHTML = innerHTML;
            return;
        }

        // Call for stats
        const stats = await callPlayerStats(playerNameToID.get(playerName), 0);

        // Account for fail calls
        if (stats === "FAIL") {
            document.getElementById("display-find-player-stats").innerHTML = "Failed to retrieve data";
            return;
        }

        // Prepare and display stats
        innerHTML = compilePlayerStatistics(careerSeason, seasonType, playerName, null, from, to, null, null, stats, null);
        document.getElementById("display-find-player-stats").innerHTML = innerHTML;
    
    // Compare 
    } else if (mode === "compare") {

        // Get and validate submitted values
        const playerName1 = document.getElementById("compare-player-input-1").value;
        const playerName2 = document.getElementById("compare-player-input-2").value;
        let validateCounter = 0;
        for (let i = 0; i < playerNames.length; i++) {
            if (playerName1 === playerNames[i] || playerName2 === playerNames[i]) {
                validateCounter++;
            }
        }
        if (validateCounter !== 2) {
            innerHTML += "<br>- Invalid Name";
        }
        if (playerName1 === playerName2) {
            innerHTML += "<br>- Please Enter Different Names";
        }
        let careerSeason = document.querySelector('input[name="compare-career-season"]:checked').value;
        let seasonType = document.querySelector('input[name="compare-season-type"]:checked').value;
        let from1 = document.getElementById("compare-from-input-1").value;
        let to1 = document.getElementById("compare-to-input-1").value;
        let from2 = document.getElementById("compare-from-input-2").value;
        let to2 = document.getElementById("compare-to-input-2").value;
        if (careerSeason == "season" && from1.match(seasonRegex) == null) {
            from1 = "None";
            document.getElementById("compare-from-input-1").value = from1;
        }
        if (careerSeason == "season" && from2.match(seasonRegex) == null) {
            from2 = "None";
            document.getElementById("compare-from-input-2").value = from2;
        }
        if (careerSeason == "season" && to1.match(seasonRegex) == null) {
            to1 = "None";
            document.getElementById("compare-to-input-1").value = to1;
        }
        if (careerSeason == "season" && to2.match(seasonRegex) == null) {
            to2 = "None";
            document.getElementById("compare-to-input-2").value = to2;
        }
        if (careerSeason == "season" &&
            (from1.match(seasonRegex) != null && to1.match(seasonRegex) != null && (parseInt(to1.substring(0, 4)) <= parseInt(from1.substring(0, 4)))
            || from2.match(seasonRegex) != null && to2.match(seasonRegex) != null && (parseInt(to2.substring(0, 4)) <= parseInt(from2.substring(0, 4))))
        ) {
            innerHTML += '<br>- "From" season should be before "To" season'
        } else if (careerSeason == "season") {
            if (from1 !== "None") {
                let num = parseInt(from1.substring(0, 4)) + 1;
                document.getElementById("compare-from-input-1").value = from1.substring(0, 4) + "-" + num.toString().substring(2, 4);
                from1 = parseInt(from1.substring(0, 4))
            }
            if (from2 !== "None") {
                let num = parseInt(from2.substring(0, 4)) + 1;
                document.getElementById("compare-from-input-2").value = from2.substring(0, 4) + "-" + num.toString().substring(2, 4);
                from2 = parseInt(from2.substring(0, 4))
            }
            if (to1 !== "None") {
                num = parseInt(to1.substring(0, 4)) + 1;
                document.getElementById("compare-to-input-1").value = to1.substring(0, 4) + "-" + num.toString().substring(2, 4);
                to1 = parseInt(to1.substring(0, 4));
            }
            if (to2 !== "None") {
                num = parseInt(to2.substring(0, 4)) + 1;
                document.getElementById("compare-to-input-2").value = to2.substring(0, 4) + "-" + num.toString().substring(2, 4);
                to2 = parseInt(to2.substring(0, 4));
            }
        }
        if (innerHTML !== "Please fix the following errors:") {
            document.getElementById("display-compare-player-stats").innerHTML = innerHTML;
            return;
        }

        // Call for stats
        const stats1 = await callPlayerStats(playerNameToID.get(playerName1), 0);
        const stats2 = await callPlayerStats(playerNameToID.get(playerName2), 0);

        // Account for fail calls
        if (stats1 === "FAIL" || stats2 === "FAIL") {
            document.getElementById("display-compare-player-stats").innerHTML = "Failed to retrieve data";
            return;
        }

        // Prepare and display stats
        innerHTML = compilePlayerStatistics(careerSeason, seasonType, playerName1, playerName2, from1, to1, from2, to2, stats1, stats2);
        document.getElementById("display-compare-player-stats").innerHTML = innerHTML;
        document.getElementById("compare-line").style.height = document.getElementById("display-compare-player-stats").offsetHeight.toString() + "px";

    }
    
}

// Compile player statistics for display
function compilePlayerStatistics(careerSeason, seasonType, playerName1, playerName2, from1, to1, from2, to2, stats1, stats2) {

    // Create innerHTML string
    let innerHTML = "";

    // Career header map
    const headerMap = new Map([
        ["CareerTotalsRegularSeason", "Regular Season Career"],
        ["CareerTotalsPostSeason", "Post Season Career"],
        ["CareerTotalsAllStarSeason", "All-Star Season Career"],
        ["CareerTotalsCollegeSeason", "College Season Career"],
        ["CareerTotalsShowcaseSeason", "Showcase Season Career"],
        ["SeasonTotalsRegularSeason", "Regular Seasons"],
        ["SeasonTotalsPostSeason", "Post Seasons"],
        ["SeasonTotalsAllStarSeason", "All-Star Seasons"],
        ["SeasonTotalsCollegeSeason", "College Seasons"],
        ["SeasonTotalsShowcaseSeason", "Showcase Seasons"]
    ]);

    // Find career
    if (mode === "find" && careerSeason === "career") {

        for (let i = 0; i < stats1.resultSets.length; i++) {
            let statSubset = stats1.resultSets[i];
            if ((statSubset.name == "CareerTotalsRegularSeason" || statSubset.name == "CareerTotalsPostSeason"
                || statSubset.name == "CareerTotalsAllStarSeason" || statSubset.name == "CareerTotalsCollegeSeason"
                || statSubset.name == "CareerTotalsShowcaseSeason")
                && statSubset.rowSet.length != 0
                && (seasonType === "all" || statSubset.name.indexOf(seasonType) != -1)
            ){
                innerHTML += `<h3>${headerMap.get(statSubset.name)}</h3>`;
                innerHTML += `<p>Games Played: ${statSubset.rowSet[0][3]}</p>`;
                innerHTML += `<p>Games Started: ${statSubset.rowSet[0][4]}</p>`;
                innerHTML += `<p>Minutes Played: ${statSubset.rowSet[0][5]}</p>`;
                innerHTML += `<p>Field Goals Attempted: ${statSubset.rowSet[0][7]}</p>`;
                innerHTML += `<p>Field Goals Made: ${statSubset.rowSet[0][6]}</p>`;
                const fgPCT = (statSubset.rowSet[0][8] * 100).toFixed(2);
                innerHTML += `<p>Field Goal Percentage: ${fgPCT}%</p>`;
                innerHTML += `<p>Field Goals (3 Pointers) Attempted: ${statSubset.rowSet[0][10]}</p>`;
                innerHTML += `<p>Field Goals (3 Pointers) Made: ${statSubset.rowSet[0][9]}</p>`;
                const fg3PCT = (statSubset.rowSet[0][11] * 100).toFixed(2);
                innerHTML += `<p>Field Goal (3 Pointer) Percentage: ${fg3PCT}%</p>`;
                innerHTML += `<p>Free Throws Attempted: ${statSubset.rowSet[0][13]}</p>`;
                innerHTML += `<p>Free Throws Made: ${statSubset.rowSet[0][12]}</p>`;
                const ftPCT = (statSubset.rowSet[0][14] * 100).toFixed(2);
                innerHTML += `<p>Free Throw Percentage: ${ftPCT}%</p>`;
                innerHTML += `<p>Total Rebounds: ${statSubset.rowSet[0][17]}</p>`;
                innerHTML += `<p>Offensive Rebounds: ${statSubset.rowSet[0][15]}</p>`;
                innerHTML += `<p>Defensive Rebounds: ${statSubset.rowSet[0][16]}</p>`;
                innerHTML += `<p>Assists: ${statSubset.rowSet[0][18]}</p>`;
                innerHTML += `<p>Steals: ${statSubset.rowSet[0][19]}</p>`;
                innerHTML += `<p>Blocks: ${statSubset.rowSet[0][20]}</p>`;
                innerHTML += `<p>Turnovers: ${statSubset.rowSet[0][21]}</p>`;
                innerHTML += `<p>Personal Fouls: ${statSubset.rowSet[0][22]}</p>`;
                innerHTML += `<p>Points Scored: ${statSubset.rowSet[0][23]}</p>`;
                innerHTML += "<br>";
            }
        }
        if (innerHTML === "") {
            return `<h2>${playerName1}</h2>No Data To Show`;
        }
        innerHTML = `<h2>${playerName1}</h2>` + innerHTML;
        manageFooterBuffer(false);
        return innerHTML;

    // Find seasons 
    } else if (mode === "find" && careerSeason === "season") {
        
        for (let i = 0; i < stats1.resultSets.length; i++) {
            let statSubset = stats1.resultSets[i];
            if ((statSubset.name == "SeasonTotalsRegularSeason" || statSubset.name == "SeasonTotalsPostSeason"
                || statSubset.name == "SeasonTotalsAllStarSeason" || statSubset.name == "SeasonTotalsCollegeSeason"
                || statSubset.name == "SeasonTotalsShowcaseSeason")
                && statSubset.rowSet.length != 0
                && (seasonType == "all" || statSubset.name.indexOf(seasonType) != -1)
            ){
                innerHTML += `<h3>${headerMap.get(statSubset.name)}</h3>`;
                for (let s = 0; s < statSubset.rowSet.length; s++) {
                    let seasonData = statSubset.rowSet[s];
                    if ((from1 <= parseInt(seasonData[1].substring(0, 4)) && (to1 === "None" || to1 >= parseInt(seasonData[1].substring(0, 4))))
                        || (from1 === "None" && to1 === "None")
                    ) {
                        innerHTML += `<h4><u>${seasonData[1]}</u></h4>`;
                        if (seasonData[4] == "TOT") {
                            innerHTML += `<p>Combined Total For ${seasonData[1]} Season</p>`;
                        } else if (teamAbbToName.get(seasonData[4]) == undefined) {
                            innerHTML += `<p>Team Played For: ${seasonData[4]}</p>`;
                        } else {
                            innerHTML += `<p>Team Played For: ${teamAbbToName.get(seasonData[4])}</p>`;
                        }
                        innerHTML += `<p>Age: ${seasonData[5]}</p>`;
                        innerHTML += `<p>Games Played: ${seasonData[6]}</p>`;
                        innerHTML += `<p>Games Started: ${seasonData[7]}</p>`;
                        innerHTML += `<p>Minutes Played: ${seasonData[8]}</p>`;
                        innerHTML += `<p>Field Goals Attempted: ${seasonData[10]}</p>`;
                        innerHTML += `<p>Field Goals Made: ${seasonData[9]}</p>`;
                        const fgPCT = (seasonData[11] * 100).toFixed(2);
                        innerHTML += `<p>Field Goal Percentage: ${fgPCT}%</p>`;
                        innerHTML += `<p>Field Goals (3 Pointers) Attempted: ${seasonData[13]}</p>`;
                        innerHTML += `<p>Field Goals (3 Pointers) Made: ${seasonData[12]}</p>`;
                        const fg3PCT = (seasonData[14] * 100).toFixed(2);
                        innerHTML += `<p>Field Goal (3 Pointer) Percentage: ${fg3PCT}%</p>`;
                        innerHTML += `<p>Free Throws Attempted: ${seasonData[16]}</p>`;
                        innerHTML += `<p>Free Throws Made: ${seasonData[15]}</p>`;
                        const ftPCT = (seasonData[17] * 100).toFixed(2);
                        innerHTML += `<p>Free Throw Percentage: ${ftPCT}%</p>`;
                        innerHTML += `<p>Total Rebounds: ${seasonData[20]}</p>`;
                        innerHTML += `<p>Offensive Rebounds: ${seasonData[18]}</p>`;
                        innerHTML += `<p>Defensive Rebounds: ${seasonData[19]}</p>`;
                        innerHTML += `<p>Assists: ${seasonData[21]}</p>`;
                        innerHTML += `<p>Steals: ${seasonData[22]}</p>`;
                        innerHTML += `<p>Blocks: ${seasonData[23]}</p>`;
                        innerHTML += `<p>Turnovers: ${seasonData[24]}</p>`;
                        innerHTML += `<p>Personal Fouls: ${seasonData[25]}</p>`;
                        innerHTML += `<p>Points Scored: ${seasonData[26]}</p>`;
                        innerHTML += "<br>";
                    }
                }
            }
        }
        if (innerHTML === "") {
            return `<h2>${playerName1}</h2>No Data To Show`;
        }
        innerHTML = `<h2>${playerName1}</h2>` + innerHTML;
        manageFooterBuffer(false);
        return innerHTML;

    // Compare careers
    } else if (mode === "compare" && careerSeason === "career") {

        let statsHTML = ["", ""];
        let playerName = [playerName1, playerName2];
        let stats = [stats1, stats2]

        for (let s = 0; s < 2; s++) {
            for (let i = 0; i < stats[s].resultSets.length; i++) {
                let statSubset = stats[s].resultSets[i];
                if ((statSubset.name == "CareerTotalsRegularSeason" || statSubset.name == "CareerTotalsPostSeason"
                    || statSubset.name == "CareerTotalsAllStarSeason" || statSubset.name == "CareerTotalsCollegeSeason"
                    || statSubset.name == "CareerTotalsShowcaseSeason")
                    && statSubset.rowSet.length != 0
                    && (seasonType === "all" || statSubset.name.indexOf(seasonType) != -1)
                ){
                    statsHTML[s] += `<h3>${headerMap.get(statSubset.name)}</h3>`;
                    statsHTML[s] += `<p>Games Played: ${statSubset.rowSet[0][3]}</p>`;
                    statsHTML[s] += `<p>Games Started: ${statSubset.rowSet[0][4]}</p>`;
                    statsHTML[s] += `<p>Minutes Played: ${statSubset.rowSet[0][5]}</p>`;
                    statsHTML[s] += `<p>Field Goals Attempted: ${statSubset.rowSet[0][7]}</p>`;
                    statsHTML[s] += `<p>Field Goals Made: ${statSubset.rowSet[0][6]}</p>`;
                    const fgPCT = (statSubset.rowSet[0][8] * 100).toFixed(2);
                    statsHTML[s] += `<p>Field Goal Percentage: ${fgPCT}%</p>`;
                    statsHTML[s] += `<p>Field Goals (3 Pointers) Attempted: ${statSubset.rowSet[0][10]}</p>`;
                    statsHTML[s] += `<p>Field Goals (3 Pointers) Made: ${statSubset.rowSet[0][9]}</p>`;
                    const fg3PCT = (statSubset.rowSet[0][11] * 100).toFixed(2);
                    statsHTML[s] += `<p>Field Goal (3 Pointer) Percentage: ${fg3PCT}%</p>`;
                    statsHTML[s] += `<p>Free Throws Attempted: ${statSubset.rowSet[0][13]}</p>`;
                    statsHTML[s] += `<p>Free Throws Made: ${statSubset.rowSet[0][12]}</p>`;
                    const ftPCT = (statSubset.rowSet[0][14] * 100).toFixed(2);
                    statsHTML[s] += `<p>Free Throw Percentage: ${ftPCT}%</p>`;
                    statsHTML[s] += `<p>Total Rebounds: ${statSubset.rowSet[0][17]}</p>`;
                    statsHTML[s] += `<p>Offensive Rebounds: ${statSubset.rowSet[0][15]}</p>`;
                    statsHTML[s] += `<p>Defensive Rebounds: ${statSubset.rowSet[0][16]}</p>`;
                    statsHTML[s] += `<p>Assists: ${statSubset.rowSet[0][18]}</p>`;
                    statsHTML[s] += `<p>Steals: ${statSubset.rowSet[0][19]}</p>`;
                    statsHTML[s] += `<p>Blocks: ${statSubset.rowSet[0][20]}</p>`;
                    statsHTML[s] += `<p>Turnovers: ${statSubset.rowSet[0][21]}</p>`;
                    statsHTML[s] += `<p>Personal Fouls: ${statSubset.rowSet[0][22]}</p>`;
                    statsHTML[s] += `<p>Points Scored: ${statSubset.rowSet[0][23]}</p>`;
                    statsHTML[s] += "<br>";
                }
            }
        }
        for (let s = 0; s < 2; s++) {
            if (statsHTML[s] === ""){
                statsHTML[s] = `<h2>${playerName[s]}</h2>No Data To Show`;
            } else {
                statsHTML[s] = `<h2>${playerName[s]}</h2>` + statsHTML[s];
                manageFooterBuffer(false);
            }
        }
        let innerHTML = `<table class="compare-table"><tr>
        <td class="compare-text">${statsHTML[0]}</td>
        <td><div class="compare-line" id="compare-line"></div></td>
        <td class="compare-text">${statsHTML[1]}</td>
        </tr></table>`;
        return innerHTML;

    // Compare seasons
    } else if (mode === "compare" && careerSeason === "season") {

        let statsHTML = ["", ""];
        let playerName = [playerName1, playerName2];
        let stats = [stats1, stats2];
        let from = [from1, from2];
        let to = [to1, to2];

        for (let s = 0; s < 2; s++) {
            for (let i = 0; i < stats[s].resultSets.length; i++) {
                let statSubset = stats[s].resultSets[i];
                if ((statSubset.name == "SeasonTotalsRegularSeason" || statSubset.name == "SeasonTotalsPostSeason"
                    || statSubset.name == "SeasonTotalsAllStarSeason" || statSubset.name == "SeasonTotalsCollegeSeason"
                    || statSubset.name == "SeasonTotalsShowcaseSeason")
                    && statSubset.rowSet.length != 0
                    && (seasonType == "all" || statSubset.name.indexOf(seasonType) != -1)
                ){
                    statsHTML[s] += `<h3>${headerMap.get(statSubset.name)}</h3>`;
                    for (let season = 0; season < statSubset.rowSet.length; season++) {
                        let seasonData = statSubset.rowSet[season];
                        if ((from[s] <= parseInt(seasonData[1].substring(0, 4)) && (to[s] === "None" || to[s] >= parseInt(seasonData[1].substring(0, 4))))
                            || (from[s] === "None" && to[s] === "None")
                        ) {
                            statsHTML[s] += `<h4><u>${seasonData[1]}</u></h4>`;
                            if (seasonData[4] == "TOT") {
                                statsHTML[s] += `<p>Combined Total For ${seasonData[1]} Season</p>`;
                            } else if (teamAbbToName.get(seasonData[4]) == undefined) {
                                statsHTML[s] += `<p>Team Played For: ${seasonData[4]}</p>`;
                            } else {
                                statsHTML[s] += `<p>Team Played For: ${teamAbbToName.get(seasonData[4])}</p>`;
                            }
                            statsHTML[s] += `<p>Age: ${seasonData[5]}</p>`;
                            statsHTML[s] += `<p>Games Played: ${seasonData[6]}</p>`;
                            statsHTML[s] += `<p>Games Started: ${seasonData[7]}</p>`;
                            statsHTML[s] += `<p>Minutes Played: ${seasonData[8]}</p>`;
                            statsHTML[s] += `<p>Field Goals Attempted: ${seasonData[10]}</p>`;
                            statsHTML[s] += `<p>Field Goals Made: ${seasonData[9]}</p>`;
                            const fgPCT = (seasonData[11] * 100).toFixed(2);
                            statsHTML[s] += `<p>Field Goal Percentage: ${fgPCT}%</p>`;
                            statsHTML[s] += `<p>Field Goals (3 Pointers) Attempted: ${seasonData[13]}</p>`;
                            statsHTML[s] += `<p>Field Goals (3 Pointers) Made: ${seasonData[12]}</p>`;
                            const fg3PCT = (seasonData[14] * 100).toFixed(2);
                            statsHTML[s] += `<p>Field Goal (3 Pointer) Percentage: ${fg3PCT}%</p>`;
                            statsHTML[s] += `<p>Free Throws Attempted: ${seasonData[16]}</p>`;
                            statsHTML[s] += `<p>Free Throws Made: ${seasonData[15]}</p>`;
                            const ftPCT = (seasonData[17] * 100).toFixed(2);
                            statsHTML[s] += `<p>Free Throw Percentage: ${ftPCT}%</p>`;
                            statsHTML[s] += `<p>Total Rebounds: ${seasonData[20]}</p>`;
                            statsHTML[s] += `<p>Offensive Rebounds: ${seasonData[18]}</p>`;
                            statsHTML[s] += `<p>Defensive Rebounds: ${seasonData[19]}</p>`;
                            statsHTML[s] += `<p>Assists: ${seasonData[21]}</p>`;
                            statsHTML[s] += `<p>Steals: ${seasonData[22]}</p>`;
                            statsHTML[s] += `<p>Blocks: ${seasonData[23]}</p>`;
                            statsHTML[s] += `<p>Turnovers: ${seasonData[24]}</p>`;
                            statsHTML[s] += `<p>Personal Fouls: ${seasonData[25]}</p>`;
                            statsHTML[s] += `<p>Points Scored: ${seasonData[26]}</p>`;
                            statsHTML[s] += "<br>";
                        }
                    }
                }
            }
        }
        for (let s = 0; s < 2; s++) {
            if (statsHTML[s] === ""){
                statsHTML[s] = `<h2>${playerName[s]}</h2>No Data To Show`;
            } else {
                statsHTML[s] = `<h2>${playerName[s]}</h2>` + statsHTML[s];
                manageFooterBuffer(false);
            }
        }
        let innerHTML = `<table class="compare-table"><tr>
        <td class="compare-text">${statsHTML[0]}</td>
        <td><div class="compare-line" id="compare-line"></div></td>
        <td class="compare-text">${statsHTML[1]}</td>
        </tr></table>`;
        return innerHTML;

    }

}

// Get team info
async function getTeamInfo() {

    // Call for team info
    await callTeamInfo();

    // Make player input list and allow search
    let teamInputList = "";
    for (let i = 0; i < teamNames.length; i++) {
        teamInputList += (`<option value="${teamNames[i]}"></option>`);
    }
    document.getElementById("waiting-message").style.display = "none";
    document.getElementById("find-player-list").innerHTML = playerInputList;
    document.getElementById("compare-player-list-1").innerHTML = playerInputList;
    document.getElementById("compare-player-list-2").innerHTML = playerInputList;
    mode = "compare";
    switchTeamStatMode();

}

// Switches mode for team
function switchTeamStatMode() {

    manageFooterBuffer(true);
    if (mode === "find") {
        
        document.getElementById("display-find-player-stats").style.display = "none";
        document.getElementById("display-find-player-stats").innerHTML = "";
        document.getElementById("search-find-player-stats").style.display = "none";
        document.getElementById("display-compare-player-stats").style.display = "block";
        document.getElementById("search-compare-player-stats").style.display = "block";
        mode = "compare";

    } else if (mode === "compare") {

        document.getElementById("display-compare-player-stats").style.display = "none";
        document.getElementById("display-compare-player-stats").innerHTML = "";
        document.getElementById("search-compare-player-stats").style.display = "none";
        document.getElementById("display-find-player-stats").style.display = "block";
        document.getElementById("search-find-player-stats").style.display = "block";
        mode = "find";

    }

}

// Get stats for team
async function getTeamStats() {

} 

function manageFooterBuffer(activate) {
    if (activate) {
        document.getElementById("footer-buffer").style.display = "block";
    } else {
        document.getElementById("footer-buffer").style.display = "none";
    }
}

