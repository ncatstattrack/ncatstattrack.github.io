
// Global Variables
let mode = null;
let subject = null;

// Caching Variables
let playerNames = null;
let playerNameToID = null;
let teamNames = null;
let teamAbbToName = null;
let teamNameToID = null;


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
    subject = "player";
    switchStatMode();

}

// Get stats for player
async function getPlayerStats() {

    // Setup
    manageFooterBuffer(true);
    document.getElementById("display-" + mode + "-player-stats").innerHTML = "Loading...";
    let innerHTML = "";

    // Get inputs
    let inputs = getInput(mode == "find" ? 1 : 2, true, mode == "find" ? 1 : 2, true);
    if (inputs[0] !== "") {
        document.getElementById("display-" + mode + "-player-stats").innerHTML = ("Please fix the following errors:" + inputs[0]);
        return;
    }

    // Gets stats and catch fails
    const stats1 = await callPlayerStats(playerNameToID.get(inputs[1][0]), 0);
    const stats2 = mode == "find" ? null : await callPlayerStats(playerNameToID.get(inputs[1][1]), 0);
    if (stats1 === "FAIL" || (mode === "compare" && stats2 === "FAIL")) {
        document.getElementById("display-" + mode + "-player-stats").innerHTML = "Failed to retrieve data";
        return;
    }

    // Compile and display stats
    innerHTML = mode == "find" ? innerHTML = compilePlayerStatistics(inputs[1][0], null, inputs[2], inputs[3][0], inputs[4][0], null, null, inputs[5], stats1, null)
        : compilePlayerStatistics(inputs[1][0], inputs[1][1], inputs[2], inputs[3][0], inputs[4][0], inputs[3][1], inputs[4][1], inputs[5], stats1, stats2);
    document.getElementById("display-" + mode + "-player-stats").innerHTML = innerHTML;

    // Adjust comparison line if needed
    if (mode === "compare") {
        document.getElementById("compare-line").style.height = document.getElementById("display-compare-player-stats").offsetHeight.toString() + "px";
    }
    
}

// Compile player statistics for display
// (MIGHT WANT TO ADD OVERALL STATS FOR SEASON PERIOD LIKE TEAM STATS)
function compilePlayerStatistics(playerName1, playerName2, careerSeason, from1, to1, from2, to2, seasonType, stats1, stats2) {

    // Variables for easier use
    let statsHTML = ["", ""];
    let playerName = [playerName1, playerName2];
    let stats = [stats1, stats2];
    let from = [from1, from2];
    let to = [to1, to2];

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
    if (careerSeason === "career") {

        for (let s = 0; s < (mode == "find" ? 1 : 2); s++) {
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
    
    // Find season
    } else if (careerSeason === "season") {

        for (let s = 0; s < (mode == "find" ? 1 : 2); s++) {
            for (let i = 0; i < stats[s].resultSets.length; i++) {
                let statSubset = stats[s].resultSets[i];
                if ((statSubset.name == "SeasonTotalsRegularSeason" || statSubset.name == "SeasonTotalsPostSeason"
                    || statSubset.name == "SeasonTotalsAllStarSeason" || statSubset.name == "SeasonTotalsCollegeSeason"
                    || statSubset.name == "SeasonTotalsShowcaseSeason")
                    && statSubset.rowSet.length != 0
                    && (seasonType == "all" || statSubset.name.indexOf(seasonType) != -1)
                ){
                    let tempHTML = `<h3>${headerMap.get(statSubset.name)}</h3>`;
                    for (let season = 0; season < statSubset.rowSet.length; season++) {
                        let seasonData = statSubset.rowSet[season];
                        if ((from[s] <= parseInt(seasonData[1].substring(0, 4)) && (to[s] === "None" || to[s] >= parseInt(seasonData[1].substring(0, 4))))
                            || (from[s] === "None" && to[s] === "None")
                        ) {
                            tempHTML += `<h4><u>${seasonData[1]}</u></h4>`;
                            if (seasonData[4] == "TOT") {
                                tempHTML += `<p>Combined Total For ${seasonData[1]} Season</p>`;
                            } else if (teamAbbToName.get(seasonData[4]) == undefined) {
                                tempHTML += `<p>Team Played For: ${seasonData[4]}</p>`;
                            } else {
                                tempHTML += `<p>Team Played For: ${teamAbbToName.get(seasonData[4])}</p>`;
                            }
                            tempHTML += `<p>Age: ${seasonData[5]}</p>`;
                            tempHTML += `<p>Games Played: ${seasonData[6]}</p>`;
                            tempHTML += `<p>Games Started: ${seasonData[7]}</p>`;
                            tempHTML += `<p>Minutes Played: ${seasonData[8]}</p>`;
                            tempHTML += `<p>Field Goals Made: ${seasonData[9]}</p>`;
                            tempHTML += `<p>Field Goals Attempted: ${seasonData[10]}</p>`;                            
                            const fgPCT = (seasonData[11] * 100).toFixed(2);
                            tempHTML += `<p>Field Goal Percentage: ${fgPCT}%</p>`;
                            tempHTML += `<p>Field Goals (3 Pointers) Made: ${seasonData[12]}</p>`;
                            tempHTML += `<p>Field Goals (3 Pointers) Attempted: ${seasonData[13]}</p>`;                           
                            const fg3PCT = (seasonData[14] * 100).toFixed(2);
                            tempHTML += `<p>Field Goal (3 Pointer) Percentage: ${fg3PCT}%</p>`;
                            tempHTML += `<p>Free Throws Made: ${seasonData[15]}</p>`;
                            tempHTML += `<p>Free Throws Attempted: ${seasonData[16]}</p>`;
                            const ftPCT = (seasonData[17] * 100).toFixed(2);
                            tempHTML += `<p>Free Throw Percentage: ${ftPCT}%</p>`;
                            tempHTML += `<p>Offensive Rebounds: ${seasonData[18]}</p>`;
                            tempHTML += `<p>Defensive Rebounds: ${seasonData[19]}</p>`;
                            tempHTML += `<p>Total Rebounds: ${seasonData[20]}</p>`;
                            tempHTML += `<p>Assists: ${seasonData[21]}</p>`;
                            tempHTML += `<p>Steals: ${seasonData[22]}</p>`;
                            tempHTML += `<p>Blocks: ${seasonData[23]}</p>`;
                            tempHTML += `<p>Turnovers: ${seasonData[24]}</p>`;
                            tempHTML += `<p>Personal Fouls: ${seasonData[25]}</p>`;
                            tempHTML += `<p>Points Scored: ${seasonData[26]}</p>`;
                            tempHTML += "<br>";
                        }
                    }
                    statsHTML[s] += (tempHTML == `<h3>${headerMap.get(statSubset.name)}</h3>` ? "" : tempHTML);
                }
            }
        }
    }

    // Formatting and returning
    for (let s = 0; s < (mode == "find" ? 1 : 2); s++) {
        if (statsHTML[s] === ""){
            statsHTML[s] = `<h2>${playerName[s]}</h2>No Data To Show`;
        } else {
            statsHTML[s] = `<h2>${playerName[s]}</h2>` + statsHTML[s];
            manageFooterBuffer(false);
        }
    }
    let innerHTML = mode == "find" ? statsHTML[0] : `<table class="compare-table"><tr>
    <td class="compare-text">${statsHTML[0]}</td>
    <td><div class="compare-line" id="compare-line"></div></td>
    <td class="compare-text">${statsHTML[1]}</td>
    </tr></table>`;
    return innerHTML;

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
    document.getElementById("find-team-list").innerHTML = teamInputList;
    document.getElementById("compare-team-list-1").innerHTML = teamInputList;
    document.getElementById("compare-team-list-2").innerHTML = teamInputList;
    mode = "compare";
    subject = "team";
    switchStatMode();

}

// Get stats for team
async function getTeamStats() {

    // Setup
    manageFooterBuffer(true);
    document.getElementById("display-" + mode + "-team-stats").innerHTML = "Loading...";
    let innerHTML = "";

    // Get inputs
    let inputs = getInput(mode == "find" ? 1 : 2, true, mode == "find" ? 1 : 2, false);
    if (inputs[0] !== "") {
        document.getElementById("display-" + mode + "-team-stats").innerHTML = ("Please fix the following errors:" + inputs[0]);
        return;
    }

    // Gets stats and catch fails
    const stats1 = await callTeamStats(teamNameToID.get(inputs[1][0]), 0);
    const stats2 = mode == "find" ? null : await callTeamStats(teamNameToID.get(inputs[1][1]), 0);
    if (stats1 === "FAIL" || (mode === "compare" && stats2 === "FAIL")) {
        document.getElementById("display-" + mode + "-team-stats").innerHTML = "Failed to retrieve data";
        return;
    }

    // Compile and display stats
    innerHTML = mode == "find" ? innerHTML = compileTeamStatistics(inputs[1][0], null, inputs[2], inputs[3][0], inputs[4][0], null, null, stats1, null)
        : compileTeamStatistics(inputs[1][0], inputs[1][1], inputs[2], inputs[3][0], inputs[4][0], inputs[3][1], inputs[4][1], stats1, stats2);
    document.getElementById("display-" + mode + "-team-stats").innerHTML = innerHTML;

    // Adjust comparison line if needed
    if (mode === "compare" && inputs[2] === "career") {
        document.getElementById("compare-line").style.height = document.getElementById("display-compare-team-stats").offsetHeight.toString() + "px";
    }

}

// Compile team statistics for display
function compileTeamStatistics(teamName1, teamName2, careerSeason, from1, to1, from2, to2, stats1, stats2) {

    console.log(stats1);

    // Variables for easier use
    let statsHTML = ["", ""];
    let teamName = [teamName1, teamName2];
    let stats = [stats1, stats2];
    let from = [from1, from2];
    let to = [to1, to2];

    // Get overall stats for time period
    let allTimeData = [[], []];
    let seasons = [[], []];
    for (let s = 0; s < (mode == "find" ? 1 : 2); s++) {
        for (let i = 0; i < 20; i++) {
            allTimeData[s].push(0);
        }
        for (let i = 0; i < stats[s].resultSets[0].rowSet.length; i++) {
            let seasonData = stats[s].resultSets[0].rowSet[i];
            if (!(careerSeason === "career" || (from[s] === "None" && to[s] === "None")
                || ((from[s] <= parseInt(seasonData[3].substring(0, 4)) && (to[s] === "None" || to[s] >= parseInt(seasonData[3].substring(0, 4)))))
            )) continue;
            if (careerSeason === "season") {
                seasons[s].push(seasonData);
            }
            if (seasonData[14] == "LEAGUE CHAMPION") {
                allTimeData[s][0] += 1;
                allTimeData[s][1] += 1;
            } else if (seasonData[14] == "FINALS APPEARANCE") {
                allTimeData[s][1] += 1;
            }
            allTimeData[s][2] += seasonData[4];        // Games Played
            allTimeData[s][3] += seasonData[5];        // Games Won
            allTimeData[s][4] += seasonData[6];        // Games Lost
            allTimeData[s][5] += seasonData[15];       // Field Goals Made
            allTimeData[s][6] += seasonData[16];       // Field Goals Attempted
            allTimeData[s][7] += seasonData[18];       // 3-Pt Goals Made
            allTimeData[s][8] += seasonData[19];       // 3-Pt Goals Attempted
            allTimeData[s][9] += seasonData[21];       // Free throws made
            allTimeData[s][10] += seasonData[22];      // Free throws attempted
            allTimeData[s][11] += seasonData[24];      // Offensive rebounds
            allTimeData[s][12] += seasonData[25];      // Defensive rebounds
            allTimeData[s][13] += seasonData[26];      // Total rebounds
            allTimeData[s][14] += seasonData[27];      // Assists
            allTimeData[s][15] += seasonData[28];      // Personal fouls
            allTimeData[s][16] += seasonData[29];      // Steals
            allTimeData[s][17] += seasonData[30];      // Turnovers
            allTimeData[s][18] += seasonData[31];      // Blocks
            allTimeData[s][19] += seasonData[32];      // Points Scored
        }
    }

    // All-time stats
    if (careerSeason === "career") {

        for (let s = 0; s < (mode == "find" ? 1 : 2); s++) {
            statsHTML[s] += `<p>League Champions: ${allTimeData[s][0]}</p>`;
            statsHTML[s] += `<p>Finals Appearances: ${allTimeData[s][1]}</p>`;
            const winPCT = ((allTimeData[s][3] / allTimeData[s][2])* 100).toFixed(2);
            statsHTML[s] += `<p>Win Percentage: ${winPCT}%</p>`;
            statsHTML[s] += `<p>Games Played: ${allTimeData[s][2]}</p>`;
            statsHTML[s] += `<p>Games Won: ${allTimeData[s][3]}</p>`;
            statsHTML[s] += `<p>Games Lost: ${allTimeData[s][4]}</p>`;
            statsHTML[s] += `<p>Field Goals Made: ${allTimeData[s][5]}</p>`;
            statsHTML[s] += `<p>Field Goals Attempted: ${allTimeData[s][6]}</p>`;
            statsHTML[s] += `<p>Field Goals (3 Pointers) Made: ${allTimeData[s][7]}</p>`;
            statsHTML[s] += `<p>Field Goals (3 Pointers) Attempted: ${allTimeData[s][8]}</p>`;
            statsHTML[s] += `<p>Free Throws Made: ${allTimeData[s][9]}</p>`;
            statsHTML[s] += `<p>Free Throws Attempted: ${allTimeData[s][10]}</p>`;
            statsHTML[s] += `<p>Offensive Rebounds: ${allTimeData[s][11]}</p>`;
            statsHTML[s] += `<p>Defensive Rebounds: ${allTimeData[s][12]}</p>`;
            statsHTML[s] += `<p>Total Rebounds: ${allTimeData[s][13]}</p>`;
            statsHTML[s] += `<p>Assists: ${allTimeData[s][14]}</p>`;
            statsHTML[s] += `<p>Personal Fouls: ${allTimeData[s][15]}</p>`;
            statsHTML[s] += `<p>Steals: ${allTimeData[s][16]}</p>`;
            statsHTML[s] += `<p>Turnovers: ${allTimeData[s][17]}</p>`;
            statsHTML[s] += `<p>Blocks: ${allTimeData[s][18]}</p>`;
            statsHTML[s] += `<p>Points Scored: ${allTimeData[s][19]}</p>`;
        }

    // Season stats
    } else if (careerSeason === "season") {
        
        teamNum = mode == "find" ? 1 : 2;
        seasonCount = [seasons[0].length, seasons[1].length];
        statIndex = [3, 4, 5, 6];
        statWidth = [70, 20, 25, 45];
        statsHTML[0] += '<table class="season-table"><tr><td>SEASON</td><td>GP</td><td>WIN</td><td>LOSS</td></tr><tr>';
        for (let s = 0; s < 4; s++) {
            statsHTML[0] += '<td><table>'
            for (let i = 0; i < (seasonCount[0] > seasonCount[1] ? seasonCount[0] : seasonCount[1]); i++) {
                statsHTML[0] += "<tr>";
                for (let t = 0; t < teamNum; t++) {
                    data = (i >= seasonCount[t] ? "" : seasons[t][i][statIndex[s]]);
                    statsHTML[0] += `<td style="min-width: ${statWidth[s]}px">${data}</td>`;
                }
                statsHTML[0] += "</tr>";
            }
            statsHTML[0] += '</table></td>'
        }
        statsHTML[0] += "</tr></table>";


            //statsHTML[s] += '<table class="season-table"><tr><td>SEASON</td><td>GP</td><td>WIN</td><td>LOSS</td><td>WIN%</td><td>CONF</td><td>DIV</td><td>PO-W</td><td>PO-L</td><td>FNLS</td><td>CHMP</td>' 
            //+ '<td>FG</td><td>FG3</td><td>FT</td></tr>';

            /*
        for (let s = 0; s < (mode == "find" ? 1 : 2); s++) {
            for (let i = 0; i < seasons[s].length; i++) {
                let seasonData = seasons[s][i];
                statsHTML[s] += `<tr><td>${seasonData[3]}</td>`;
                statsHTML[s] += `<td>${seasonData[4]}</td>`;    // GP
                statsHTML[s] += `<td>${seasonData[5]}</td>`;    // WIN
                statsHTML[s] += `<td>${seasonData[6]}</td>`;    // LOSS
                statsHTML[s] += `<td>${(seasonData[7] * 100).toFixed(2)}%</td>`;    // WIN%
                statsHTML[s] += "<td>" + (seasonData[12] == null ? "-" : `${seasonData[8]}/${seasonData[12]}`) + "</td>";      // CONF
                statsHTML[s] += `<td>${seasonData[9]}/${seasonData[13]}</td>`;      // DIV
                statsHTML[s] += `<td>${seasonData[10]}</td>`;   // PO-W
                statsHTML[s] += `<td>${seasonData[11]}</td>`;   // PO-L
                statsHTML[s] += `<td>${seasonData[14] == "FINALS APPEARANCE" ? "Yes" : seasonData[14] == "LEAGUE CHAMPION" ? "Yes" : "No"}</td>`;     // FNLS
                statsHTML[s] += `<td>${seasonData[14] == "LEAGUE CHAMPION" ? "Yes" : "No"}</td>`;       // CHMP
                statsHTML[s] += `<td>${seasonData[15] == 0 ? '-' : seasonData[15]}/${seasonData[16] == 0 ? '-' : seasonData[16]}</td>`;      // FG
                statsHTML[s] += `<td>${seasonData[18]}/${seasonData[19]}</td>`;      // FG3
                statsHTML[s] += `<td>${seasonData[21]}/${seasonData[22]}</td>`;      // FT
                //statsHTML[s] += `<td>${seasonData[]}</td>`; 
                //statsHTML[s] += `<td>${seasonData[]}</td>`;    
                statsHTML[s] += "</tr>";
            }
            statsHTML[s] += "</table>";
        }
        */

    }
    // Need to add acronyms and new stats to stat page

    // Formatting and returning
    for (let s = 0; s < (mode == "find" ? 1 : 2); s++) {
        if (statsHTML[s] === ""){
            statsHTML[s] = `<h2>${teamName[s]}</h2>No Data To Show`;
        } else {
            statsHTML[s] = (careerSeason === "career" ? `<h2>${teamName[s]}</h2>` : "") + statsHTML[s];
            manageFooterBuffer(false);
        }
    }
    let innerHTML = `<table class="compare-table"><tr class="compare-text"><td>${statsHTML[0]}</td></tr></table>`;
    if (mode === "compare" && careerSeason === "career") {
        innerHTML = `<table class="compare-table"><tr>
        <td class="compare-text">${statsHTML[0]}</td>
        <td><div class="compare-line" id="compare-line"></div></td>
        <td class="compare-text">${statsHTML[1]}</td>
        </tr></table>`;
    }
    return innerHTML;

}

// Switches stat mode
function switchStatMode() {

    manageFooterBuffer(true);
    newMode = mode == "find" ? "compare" : "find";
    document.getElementById("display-" + mode + "-" + subject + "-stats").style.display = "none";
    document.getElementById("display-" + mode + "-" + subject + "-stats").innerHTML = "";
    document.getElementById("search-" + mode + "-" + subject + "-stats").style.display = "none";
    document.getElementById("display-" + newMode + "-" + subject + "-stats").style.display = "block";
    document.getElementById("search-" + newMode + "-" + subject + "-stats").style.display = "block";
    mode = newMode;

}

// Get and validate submitted values
function getInput(nameCount = 0, careerSeason = false, fromToCount = 0, seasonType = false, ) {

    const seasonRegex = /^\d{4}-\d{2}$/;
    let returnArray = [];
    returnArray.push("");

    // Names
    if (nameCount > 0) {
        let names = [];
        for (let i = 0; i < nameCount; i++) {
            names.push(document.getElementById(mode + "-" + subject + "-input" + (nameCount == 1 ? "" : ("-" + (i + 1)))).value);
        }
        let namesValidated = 0;
        let nameList = subject == "player" ? playerNames : subject == "team" ? teamNames : [];
        for (let i = 0; i < nameList.length; i++) {
            for (let n = 0; n < names.length; n++) {
                if (names[n] == nameList[i]) {
                    namesValidated++;
                }
            }
        }
        if (namesValidated < nameCount) {
            returnArray[0] += "<br>- Invalid Name";
        }
        returnArray.push(names);
    }

    // Career Or Season
    if (careerSeason) {
        returnArray.push(document.querySelector('input[name="' + mode + '-career-season"]:checked').value);
    }

    // From To Timeframe
    if (fromToCount > 0) {
        let from = [];
        let to = [];
        if (returnArray[returnArray.length - 1] === "season") {
            for (let i = 0; i < fromToCount; i++) {
                from.push(document.getElementById(mode + "-from-input" + (nameCount == 1 ? "" : ("-" + (i + 1)))).value);
                if (from[i].match(seasonRegex) == null) {
                    from[i] = "None";
                    document.getElementById(mode + "-from-input" + (nameCount == 1 ? "" : ("-" + (i + 1)))).value = from[i];
                }
                to.push(document.getElementById(mode + "-to-input" + (nameCount == 1 ? "" : ("-" + (i + 1)))).value);
                if (to[i].match(seasonRegex) == null) {
                    to[i] = "None";
                    document.getElementById(mode + "-to-input" + (nameCount == 1 ? "" : ("-" + (i + 1)))).value = to[i];
                }
                if (from[i].match(seasonRegex) != null && to[i].match(seasonRegex) != null && (parseInt(to[i].substring(0, 4)) <= parseInt(from[i].substring(0, 4)))) {
                    returnArray[0] += '<br>- "From" season should be before "To" season'
                } else {
                    if (from[i] !== "None") {
                        let num = parseInt(from[i].substring(0, 4)) + 1;
                        document.getElementById(mode + "-from-input" + (nameCount == 1 ? "" : ("-" + (i + 1)))).value = from[i].substring(0, 4) + "-" + num.toString().substring(2, 4);
                        from[i] = parseInt(from[i].substring(0, 4))
                    }
                    if (to[i] !== "None") {
                        num = parseInt(to[i].substring(0, 4)) + 1;
                        document.getElementById(mode + "-to-input" + (nameCount == 1 ? "" : ("-" + (i + 1)))).value = to[i].substring(0, 4) + "-" + num.toString().substring(2, 4);
                        to[i] = parseInt(to[i].substring(0, 4));
                    }
                }
            }
        }
        returnArray.push(from);
        returnArray.push(to);
    }

    // Season Type
    if (seasonType) {
        returnArray.push(document.querySelector('input[name="' + mode + '-season-type"]:checked').value);
    }

    // Return
    return returnArray;

}

function manageFooterBuffer(activate) {
    if (activate) {
        document.getElementById("footer-buffer").style.display = "block";
    } else {
        document.getElementById("footer-buffer").style.display = "none";
    }
}
