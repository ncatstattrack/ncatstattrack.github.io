
// Global Variables
let mode = null;
let subject = null;
let numSeasonTables = new Object({
    "TeamSeasonTable": null
});
let currentSeasonTable = new Object({
    "TeamSeasonTable": null
});
let seasonTables = new Object({
    "TeamSeasonTable": null
});
const seasonTableNameToID = new Object({
    "TeamSeasonTable": "team-season-table",
    "PlayerRegularSeasonTable" : "player-regular-season-table",
    "PlayerPostSeasonTable" : "player-post-season-table",
    "PlayerAllStarSeasonTable" : "player-allstar-season-table",
    "PlayerCollegeSeasonTable" : "player-college-season-table",
    "PlayerShowcaseSeasonTable" : "player-showcase-season-table"
});
const playerHeaderMap = new Map([
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
const playerSeasonTypeToSeasonTableName = new Object({
    "SeasonTotalsRegularSeason": "PlayerRegularSeasonTable",
    "SeasonTotalsPostSeason": "PlayerPostSeasonTable",
    "SeasonTotalsAllStarSeason" : "PlayerAllStarSeasonTable",
    "SeasonTotalsCollegeSeason" : "PlayerCollegeSeasonTable",
    "SeasonTotalsShowcaseSeason" : "PlayerShowcaseSeasonTable"
});

// Caching Variables
let playerNames = null;
let playerNameToID = null;
let teamNames = null;
let teamAbbToName = null;
let teamNameToID = null;


// Event calls
// Runs when the website loads
window.addEventListener("load", function() {

    currentURL = window.location.href;
    if (currentURL.indexOf("/signup.html") == -1 && currentURL.indexOf("/login.html") == -1 && currentURL.indexOf("/account.html") == -1) {
        loginLink();
    }
    if (currentURL.indexOf("/index.html") != -1) {
        loadRecentQueries();
        loadFavoriteQueries();
    }
    if (currentURL.indexOf("/players.html") != -1) {
        getPlayerInfo();
    }
    if (currentURL.indexOf("/teams.html") != -1) {
        getTeamInfo();
    }
    if (currentURL.indexOf("/query.html") != -1) {
        queryPageSetup();
    }

});

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
// Changes login link depending on user login status
async function loginLink() {

    // Users who are logged in
    if (sessionStorage.getItem("logged-in")) {
        document.getElementById("login-container").innerHTML = '<a href="account.html">ACCOUNT</a>';
    } else {
        document.getElementById("login-container").innerHTML = '<a href="login.html">LOGIN</a>';
    }

}

// New user signup
async function registerUser() {
    
    username = document.getElementById("login-username").value;
    password = document.getElementById("login-password").value;
    if (!validUserPass(username, password)) {
        return;
    }

    result = await userSignup(username, password);
    document.getElementById("message-box").innerHTML = result;

}

// User login
async function loginUser() {
    
    username = document.getElementById("login-username").value;
    password = document.getElementById("login-password").value;
    if (!validUserPass(username, password)) {
        return;
    }

    result = await userLogin(username, password);
    if (result == "Successful Login"){
        window.location.href = "index.html";
    } else {
        document.getElementById("message-box").innerHTML = result;
    }

}

// Validate username and password
function validUserPass(username, password) {

    document.getElementById("input-warning").style.display = "none";
    document.getElementById("message-box").innerHTML = "";
    if (username.match(/^[A-Za-z0-9]{8,20}$/) == null || password.match(/^[A-Za-z0-9!@#$%&*]{8,20}$/) == null) {
        document.getElementById("input-warning").style.display = "block";
        return false;
    }
    return true;

}

// Query page setup
async function queryPageSetup() {

    // Get query
    query = window.location.search;
    query = decodeURIComponent(query.substring(1));

    // Check and update recent
    recents = localStorage.getItem("recents");
    if (recents.includes(query)) {
        updateRecentQueries(query);
    }

    // Query display
    const queryParams = new URLSearchParams(query);
    subject = queryParams.get('subject');
    mode = queryParams.get('mode');
    let name1 = queryParams.get('name-1');
    let name2 = queryParams.get('name-2');
    let careerSeason = queryParams.get('career-season');
    let from1 = queryParams.get('from-1');
    let to1 = queryParams.get('to-1');
    let from2 = queryParams.get('from-2');
    let to2 = queryParams.get('to-2');
    let seasonType = queryParams.get('season-type');

    let timespan1 = null;
    let timespan2 = null;
    if (from1 != null && to1 != null) {
        timespan1 = ((from1 != "None" && to1 != "None") ? (from1 + " to " + to1) : (from1 != "None" && to1 == "None") ? ("Since " + from1) : "All Seasons");
    }
    if (from2 != null && to2 != null) {
        timespan2 = ((from2 != "None" && to2 != "None") ? (from2 + " to " + to2) : (from2 != "None" && to2 == "None") ? ("Since " + from2) : "All Seasons");
    }

    // Call for player info
    await callPlayerInfo();

    // Call for team info
    await callTeamInfo();
    
    if (subject === "player") {

        // Correct names (for potential case change in url)
        for (let i = 0; i < playerNames.length; i++) {
            if (name1.toLowerCase() == playerNames[i].toLowerCase()) {
                name1 = playerNames[i];
            }
            if (name2 != null && name2.toLowerCase() == playerNames[i].toLowerCase()) {
                name2 = playerNames[i];
            }
        }

        // Title
        document.getElementById("query-title").innerHTML =
            mode == "find" ? name1 : (name1 + " vs. " + name2);
        document.getElementById("query-subtitle").innerHTML =
            (careerSeason == "career" ? "Career" : "Season") + " Statistics<br>" + 
            (seasonType == "all" ? "All" : seasonType == "RegularSeason" ? "Regular" : seasonType == "PostSeason" ? "Post" : seasonType == "AllStarSeason" ? "All-Star" : seasonType == "CollegeSeason" ? "College" : "Showcase") +
            (seasonType == "all" ? " Season Types<br>" : " Season<br>") +
            (careerSeason == "career" ? "" : (mode == "find" ? timespan1 : (timespan1 + " vs. " + timespan2)));
            
        // Get stats
        const stats1 = await callPlayerStats(playerNameToID.get(name1), 0);
        const stats2 = mode == "find" ? null : await callPlayerStats(playerNameToID.get(name2), 0);
        if (stats1 === "FAIL" || (mode === "compare" && stats2 === "FAIL")) {
            document.getElementById("display-stats").innerHTML = "Failed to retrieve data";
            return;
        }

        // Compile and display stats
        innerHTML = mode == "find" ? innerHTML = compilePlayerStatistics(name1, null, careerSeason, from1, to1, null, null, seasonType, stats1, null)
            : compilePlayerStatistics(name1, name2, careerSeason, from1, to1, from2, to2, seasonType, stats1, stats2);
        document.getElementById("display-stats").innerHTML = innerHTML;

        // Adjust as needed
        if (mode === "compare" && careerSeason === "career") {
            document.getElementById("compare-line").style.height = document.getElementById("display-stats").offsetHeight.toString() + "px";
        }
        manageFooterBuffer(500 - document.getElementById("display-stats").offsetHeight);

    } else if (subject === "team") {
        
        // Correct names (for potential case change in url)
        for (let i = 0; i < teamNames.length; i++) {
            if (name1.toLowerCase() == teamNames[i].toLowerCase()) {
                name1 = teamNames[i];
            }
            if (name2 != null && name2.toLowerCase() == teamNames[i].toLowerCase()) {
                name2 = teamNames[i];
            }
        }

        // Title
        document.getElementById("query-title").innerHTML =
            (mode == "find" ? name1 : (name1 + " vs. " + name2));
        document.getElementById("query-subtitle").innerHTML = 
            (careerSeason == "career" ? "All-Time" : "Season") + " Statistics<br>" +
            (careerSeason == "career" ? "" : (mode == "find" ? timespan1 : (timespan1 + " vs. " + timespan2)));

        // Get stats
        const stats1 = await callTeamStats(teamNameToID.get(name1), 0);
        const stats2 = mode == "find" ? null : await callTeamStats(teamNameToID.get(name2), 0);
        if (stats1 === "FAIL" || (mode === "compare" && stats2 === "FAIL")) {
            document.getElementById("display-stats").innerHTML = "Failed to retrieve data";
            return;
        }

        // Compile stats
        innerHTML = mode == "find" ? innerHTML = compileTeamStatistics(name1, null, careerSeason, from1, to1, null, null, stats1, null)
            : compileTeamStatistics(name1, name2, careerSeason, from1, to1, from2, to2, stats1, stats2);
        document.getElementById("display-stats").innerHTML = innerHTML;

        // Adjust as needed
        if (mode === "compare" && careerSeason === "career") {
            document.getElementById("compare-line").style.height = document.getElementById("display-stats").offsetHeight.toString() + "px";
        }
        manageFooterBuffer(500 - document.getElementById("display-stats").offsetHeight);

    }
    
    // Check for Favorite Status
    if (sessionStorage.getItem("logged-in")) {
        document.getElementById("favorite-div").style.display = "block";
    }

}

// Updates recents
function updateRecentQueries(queryString) {

    let recents = localStorage.getItem("recents");
    if (recents == null) {
        recents = queryString;
    } else if (!recents.includes(queryString)) {
        recents = `${queryString}|${recents}`;
    } else if (recents.includes(queryString)) {
        recents = recents.substring(0, recents.indexOf(queryString)) + recents.substring(recents.indexOf(queryString) + queryString.length);
        if (recents == ""){
            recents = queryString;
        } else {
            recents = `${queryString}|${recents}`;
        }
        while (recents.indexOf('||') != -1) {
            recents = recents.replace('||', '|');
        }
        if (recents.charAt(recents.length - 1) == '|'){
            recents = recents.substring(0, recents.length - 1)
        }
    }
    while (recents.split('|').length - 1 >= 10) {
        recents = recents.substring(0, recents.lastIndexOf('|'));
    }
    localStorage.setItem("recents", recents);

}

// Clears recents
function clearRecentQueries() {

    localStorage.removeItem("recents");
    loadRecentQueries();

}

// Load recents
function loadRecentQueries() {
    
    if (localStorage.getItem("recents") == null) {
        document.getElementById("recent-queries").innerHTML = "No recent queries to show.";
    } else {
        recents = localStorage.getItem("recents") + '|';
        innerHTML = '<table>';
        
        while (recents.indexOf('|') != -1) {

            let query = recents.substring(0, recents.indexOf('|'));
            const queryParams = new URLSearchParams(query);
            let from1 = queryParams.get('from-1');
            let to1 = queryParams.get('to-1');
            let from2 = queryParams.get('from-2');
            let to2 = queryParams.get('to-2');
            let timespan1 = null;
            let timespan2 = null;
            if (from1 != null && to1 != null) {
                timespan1 = ((from1 != "None" && to1 != "None") ? (from1 + " to " + to1) : (from1 != "None" && to1 == "None") ? ("Since " + from1) : "All Seasons");
            }
            if (from2 != null && to2 != null) {
                timespan2 = ((from2 != "None" && to2 != "None") ? (from2 + " to " + to2) : (from2 != "None" && to2 == "None") ? ("Since " + from2) : "All Seasons");
            }

            innerHTML += `<tr><td id="query-link"><a href="query.html?${query}">`;

            //subject=player&mode=find&name-1=A.C. Green&name-2=null&career-season=career&from-1=null&to-1=null&from-2=null&to-2=null&season-type=all
            if (queryParams.get('mode') == 'find') {
                innerHTML += `${queryParams.get('name-1')}`;
            } else if (queryParams.get('mode') == 'compare') {
                innerHTML += `${queryParams.get('name-1')} vs. ${queryParams.get('name-2')}`;
            }
            
            innerHTML += '<div class="little-br"></div>';

            if (queryParams.get('subject') == 'player') {
                innerHTML += ((queryParams.get('career-season') == "career" ? "Career" : "Season") + " Statistics");
                let type = ((queryParams.get('season-type') == "all" ? "All" : queryParams.get('season-type') == "RegularSeason" ? "Regular" : queryParams.get('season-type') == "PostSeason" ? "Post" : queryParams.get('season-type') == "AllStarSeason" ? "All-Star" : queryParams.get('season-type') == "CollegeSeason" ? "College" : "Showcase") +
                    (queryParams.get('season-type') == "all" ? " Season Types" : " Season"));
                if (queryParams.get('career-season') == "season") {
                    innerHTML += (" | " + type);
                } else {
                    innerHTML += (" | " + type);
                }
            } else if (queryParams.get('subject') == 'team') {
                innerHTML += ((queryParams.get('career-season') == "career" ? "All-Time" : "Season") + " Statistics"); 
            }

            innerHTML += '<div class="little-br"></div>';

            if (queryParams.get('career-season') == "season") {
                innerHTML += ((queryParams.get('mode') == "find" ? timespan1 : (timespan1 + " vs. " + timespan2)));
            }
            innerHTML += '</td></tr>';
            recents = recents.substring(recents.indexOf('|') + 1);
        }
        innerHTML += '</table><br><button onclick="clearRecentQueries()">Clear Recents</button>';
        document.getElementById("recent-queries").innerHTML = innerHTML;
    }
    
}

// Updates favorites


// Load favorites
async function loadFavoriteQueries() {


    if (sessionStorage.getItem("logged-in") == null) {
        document.getElementById("favorite-queries").innerHTML = "Need to make an account or sign in to show favorites.";
    }
    // No favorite queries to show.

}


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
    manageFooterBuffer(500);
    document.getElementById("display-player-stats").innerHTML = "Loading...";
    let innerHTML = "";

    // Get inputs
    let inputs = getInput(mode == "find" ? 1 : 2, true, mode == "find" ? 1 : 2, true);
    if (inputs[0] !== "") {
        document.getElementById("display-player-stats").innerHTML = ("Please fix the following errors:" + inputs[0]);
        return;
    }

    // Gets stats and catch fails
    const stats1 = await callPlayerStats(playerNameToID.get(inputs[1][0]), 0);
    const stats2 = mode == "find" ? null : await callPlayerStats(playerNameToID.get(inputs[1][1]), 0);
    if (stats1 === "FAIL" || (mode === "compare" && stats2 === "FAIL")) {
        document.getElementById("display-player-stats").innerHTML = "Failed to retrieve data";
        return;
    }

    // Compile and display stats
    innerHTML = mode == "find" ? innerHTML = compilePlayerStatistics(inputs[1][0], null, inputs[2], inputs[3][0], inputs[4][0], null, null, inputs[5], stats1, null)
        : compilePlayerStatistics(inputs[1][0], inputs[1][1], inputs[2], inputs[3][0], inputs[4][0], inputs[3][1], inputs[4][1], inputs[5], stats1, stats2);
    document.getElementById("display-player-stats").innerHTML = innerHTML;

    // Adjust as needed
    if (mode === "compare" && inputs[5] === "career") {
        document.getElementById("compare-line").style.height = document.getElementById("display-player-stats").offsetHeight.toString() + "px";
    }
    manageFooterBuffer(500 - document.getElementById("display-player-stats").offsetHeight);

    // Add query to recents
    let query = `subject=player&mode=${mode}&name-1=${inputs[1][0]}&name-2=${mode == "find" ? "null" : inputs[1][1]}&career-season=${inputs[2]}&from-1=${inputs[3][0]}&to-1=${inputs[4][0]}&from-2=${inputs[3][1]}&to-2=${inputs[4][1]}&season-type=${inputs[5]}`;
    updateRecentQueries(query);
    
}

// Compile player statistics for display
// (MIGHT WANT TO ADD OVERALL STATS FOR SEASON PERIOD LIKE TEAM STATS)
function compilePlayerStatistics(playerName1, playerName2, careerSeason, from1, to1, from2, to2, seasonType, stats1, stats2) {

    // Variables for easier use
    let textHTML = ["", ""];
    let seasonHTML = "";
    let playerName = [playerName1, playerName2];
    let stats = [stats1, stats2];
    let from = [from1, from2];
    let to = [to1, to2];

    // Find career
    if (careerSeason === "career") {

        for (let s = 0; s < (mode == "find" ? 1 : 2); s++) {
            for (let i = 0; i < stats[s].resultSets.length; i++) {
                let statSubset = stats[s].resultSets[i];
                if (statSubset.name.indexOf("CareerTotals") != -1 && statSubset.rowSet.length != 0 && (seasonType === "all" || statSubset.name.indexOf(seasonType) != -1)
                ){
                    textHTML[s] += `<h3>${playerHeaderMap.get(statSubset.name)}</h3>`;
                    textHTML[s] += `<p>Games Played: ${statSubset.rowSet[0][3]}</p>`;
                    textHTML[s] += `<p>Games Started: ${statSubset.rowSet[0][4]}</p>`;
                    textHTML[s] += `<p>Minutes Played: ${statSubset.rowSet[0][5]}</p>`;
                    textHTML[s] += `<p>Field Goals Attempted: ${statSubset.rowSet[0][7]}</p>`;
                    textHTML[s] += `<p>Field Goals Made: ${statSubset.rowSet[0][6]}</p>`;
                    const fgPCT = (statSubset.rowSet[0][8] * 100).toFixed(2);
                    textHTML[s] += `<p>Field Goal Percentage: ${fgPCT}%</p>`;
                    textHTML[s] += `<p>Field Goals (3 Pointers) Attempted: ${statSubset.rowSet[0][10]}</p>`;
                    textHTML[s] += `<p>Field Goals (3 Pointers) Made: ${statSubset.rowSet[0][9]}</p>`;
                    const fg3PCT = (statSubset.rowSet[0][11] * 100).toFixed(2);
                    textHTML[s] += `<p>Field Goal (3 Pointer) Percentage: ${fg3PCT}%</p>`;
                    textHTML[s] += `<p>Free Throws Attempted: ${statSubset.rowSet[0][13]}</p>`;
                    textHTML[s] += `<p>Free Throws Made: ${statSubset.rowSet[0][12]}</p>`;
                    const ftPCT = (statSubset.rowSet[0][14] * 100).toFixed(2);
                    textHTML[s] += `<p>Free Throw Percentage: ${ftPCT}%</p>`;
                    textHTML[s] += `<p>Total Rebounds: ${statSubset.rowSet[0][17]}</p>`;
                    textHTML[s] += `<p>Offensive Rebounds: ${statSubset.rowSet[0][15]}</p>`;
                    textHTML[s] += `<p>Defensive Rebounds: ${statSubset.rowSet[0][16]}</p>`;
                    textHTML[s] += `<p>Assists: ${statSubset.rowSet[0][18]}</p>`;
                    textHTML[s] += `<p>Steals: ${statSubset.rowSet[0][19]}</p>`;
                    textHTML[s] += `<p>Blocks: ${statSubset.rowSet[0][20]}</p>`;
                    textHTML[s] += `<p>Turnovers: ${statSubset.rowSet[0][21]}</p>`;
                    textHTML[s] += `<p>Personal Fouls: ${statSubset.rowSet[0][22]}</p>`;
                    textHTML[s] += `<p>Points Scored: ${statSubset.rowSet[0][23]}</p>`;
                    textHTML[s] += "<br>";
                }
            }
        }
    
    // Find season
    } else if (careerSeason === "season") {

        const teamNum = mode == "find" ? 1 : 2;
        let seasonTypes = [];
        let seasonStats = [[], []];
        for (let i = 0; i < stats[0].resultSets.length; i++) {
            let count = 0;
            let buffer = [[], []];
            let type = "";
            for (let t = 0; t < teamNum; t++) {
                let statSubset = stats[t].resultSets[i];
                if (statSubset.name.indexOf("SeasonTotals") != -1 && statSubset.rowSet.length != 0 && (seasonType == "all" || statSubset.name.indexOf(seasonType) != -1)
                ){
                    type = statSubset.name;
                    let seasonData = statSubset.rowSet;
                    for (let s = 0; s < seasonData.length; s++) {
                        if ((from[t] <= parseInt(seasonData[s][1].substring(0, 4)) && (to[t] === "None" || to[t] >= parseInt(seasonData[s][1].substring(0, 4))))
                            || (from[t] === "None" && to[t] === "None")
                        ) {
                            buffer[t].push(seasonData[s]);
                        }
                    }
                    count++;
                }
            }
            if (count > 0) {
                seasonTypes.push(type);
                seasonStats[0].push(buffer[0]);
                seasonStats[1].push(buffer[1]);
            }
        }

        const statIndexes = [[1, 4, 5, 6, 7, 8], [1, 9, 11, 12, 14, 15, 17], [1, 18, 20, 21, 22, 23, 24, 25, 26], [1, 20, 21, 22, 23, 24, 25, 26]];
        const statWidths = [[64, 42, 32, 20, 20, 26], [64, 50, 32, 60, 40, 48, 30], [64, 62, 28, 26, 24, 26, 28, 20, 26], [64, 32, 30, 30, 30, 30, 40, 32]];
        const statNames = [["SEASON", "TEAM", "AGE", "GP", "GS", "MIN"], ["SEASON", "FG-M:A", "FG%", "FG3-M:A", "FG3%", "FT-M:A", "FT%"], ["SEASON", "REB-O:D", "REB", "AST", "STL", "BLK", "TOV", "PF", "PTS"], ["SEASON", "RPG", "APG", "SPG", "BPG", "TPG", "PFPG", "PPG"]];
        for (let sType = 0; sType < seasonTypes.length; sType++) {
            let typeData = [seasonStats[0][sType], seasonStats[1][sType]];
            let seasonCount = [typeData[0].length, typeData[1].length];
            let htmlTables = [];
            for (let ct = 0; ct < 4; ct++) {
                let tempHTML = '<table class="season-table"><tr>';
                let statIndex = statIndexes[ct];
                let statWidth = statWidths[ct];
                let statName = statNames[ct];
                let latestSeason = [null, null];
                for (let n = 0; n < statName.length; n++) {
                    tempHTML += `<td>${statName[n]}</td>`;
                }
                tempHTML += '</tr><tr>';
                for (let s = 0; s < statIndex.length; s++) {
                    tempHTML += '<td><table>';
                    for (let i = 0; i < (seasonCount[0] > seasonCount[1] ? seasonCount[0] : seasonCount[1]); i++) {
                        tempHTML += '<tr>';
                        for (let t = 0; t < teamNum; t++) {
                            let data = "&nbsp;-&nbsp;";
                            if (i < seasonCount[t]) {
                                data = typeData[t][i][statIndex[s]] != null ? typeData[t][i][statIndex[s]] : "&nbsp;-&nbsp;";
                                if (statName[s] == "SEASON") {
                                    data = data == latestSeason[t] ? "^" : data;
                                    latestSeason[t] = typeData[t][i][statIndex[s]];
                                }
                                if (statName[s] == "TEAM") {
                                    data = data == "TOT" ? "Total" : data;
                                }
                                if (statName[s] == "FG-M:A" || statName[s] == "FG3-M:A" || statName[s] == "FT-M:A" || statName[s] == "REB-O:D") {
                                    data = `${typeData[t][i][statIndex[s]] != null ? typeData[t][i][statIndex[s]] : "&nbsp;-&nbsp;"}:${typeData[t][i][statIndex[s] + 1] != null ? typeData[t][i][statIndex[s] + 1] : "&nbsp;-&nbsp;"}`;
                                }
                                if (statName[s] == "FG%" || statName[s] == "FG3%" || statName[s] == "FT%") {
                                    data = (typeData[t][i][statIndex[s]] * 100).toFixed(1) + "%";
                                }
                                if (statName[s] == "RPG" || statName[s] == "APG" || statName[s] == "PFPG" || statName[s] == "SPG" || statName[s] == "TPG" || statName[s] == "BPG" || statName[s] == "PPG") {
                                    data = (typeData[t][i][statIndex[s]] != null ? (typeData[t][i][statIndex[s]] / typeData[t][i][6]).toFixed(1) : "&nbsp;-&nbsp;");
                                }
                            }
                            tempHTML += `<td class=${t == 0 ? '"season-color-1"' : '"season-color-2"'} style="min-width: ${statWidth[s] / teamNum}px">${data}</td>`;
                        }
                        tempHTML += '</tr>';
                    }
                    tempHTML += '</table></td>';
                }
                tempHTML += '</tr></table>';
                htmlTables.push([tempHTML]);
            }

            let seasonType = seasonTypes[sType];
            let seasonTableName = playerSeasonTypeToSeasonTableName[seasonType];
            numSeasonTables[seasonTableName] = 4;
            currentSeasonTable[seasonTableName] = 0;
            seasonTables[seasonTableName] = htmlTables;
            seasonHTML += `<h3>${playerHeaderMap.get(seasonType)}</h3>`;
            seasonHTML += `<table class="stat-table"><tr><td class="season-arrow"><button onclick="seasonTablePrevious('${seasonTableName}')"><strong><</strong></button></td>`;
            seasonHTML += mode === "find" ? 
                `<td id="${seasonTableNameToID[seasonTableName]}">${seasonTables[seasonTableName][0]}</td>`
                :
                `<td><table><tr><td class="season-color-1">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</td><td class="season-key">&nbsp;&nbsp;${playerName1}</td></tr><tr><td class="season-color-2">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</td><td class="season-key">&nbsp;&nbsp;${playerName2}</td></tr></table></td>`;
            seasonHTML += `<td class="season-arrow"><button onclick="seasonTableNext('${seasonTableName}')"><strong>></strong></button></td>`
            seasonHTML += mode === "find" ? 
                "</tr></table>" : `</tr><tr><td></td><td id="${seasonTableNameToID[seasonTableName]}">${seasonTables[seasonTableName][0]}</td><td></td></tr></table>`;
        }
    }

    // Formatting and returning
    if (careerSeason === "career") {
        for (let s = 0; s < (mode == "find" ? 1 : 2); s++) {
            if (textHTML[s] === ""){
                textHTML[s] = `<h2>${playerName[s]}</h2>No Data To Show`;
            } else {
                textHTML[s] = `<h2>${playerName[s]}</h2>` + textHTML[s];
            }
        }
    } else if (careerSeason === "season" && seasonHTML == "") {
        seasonHTML = "<h2>No Data To Show</h2>";
    }

    let innerHTML = null;
    if (careerSeason === "season") {
        innerHTML = `<table class="stat-table"><tr><td>${seasonHTML}</td></tr></table>`;
    }
    if (mode === "find" && careerSeason === "career") {
        innerHTML = `<table class="stat-table"><tr><td>${textHTML[0]}</td></tr></table>`;
    } else if (mode === "compare" && careerSeason === "career") {
        innerHTML = `<table class="stat-table"><tr>
        <td>${textHTML[0]}</td>
        <td><div class="compare-line" id="compare-line"></div></td>
        <td>${textHTML[1]}</td>
        </tr></table>`;
    }
    innerHTML = `<div id="favorite-checkbox">` +
    `</div>${innerHTML}`
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
    manageFooterBuffer(500);
    document.getElementById("display-team-stats").innerHTML = "Loading...";
    let innerHTML = "";

    // Get inputs
    let inputs = getInput(mode == "find" ? 1 : 2, true, mode == "find" ? 1 : 2, false);
    if (inputs[0] !== "") {
        document.getElementById("display-team-stats").innerHTML = ("Please fix the following errors:" + inputs[0]);
        return;
    }

    // Gets stats and catch fails
    const stats1 = await callTeamStats(teamNameToID.get(inputs[1][0]), 0);
    const stats2 = mode == "find" ? null : await callTeamStats(teamNameToID.get(inputs[1][1]), 0);
    if (stats1 === "FAIL" || (mode === "compare" && stats2 === "FAIL")) {
        document.getElementById("display-team-stats").innerHTML = "Failed to retrieve data";
        return;
    }

    // Compile stats
    innerHTML = mode == "find" ? innerHTML = compileTeamStatistics(inputs[1][0], null, inputs[2], inputs[3][0], inputs[4][0], null, null, stats1, null)
        : compileTeamStatistics(inputs[1][0], inputs[1][1], inputs[2], inputs[3][0], inputs[4][0], inputs[3][1], inputs[4][1], stats1, stats2);
    document.getElementById("display-team-stats").innerHTML = innerHTML;

    // Adjust as needed
    if (mode === "compare" && inputs[2] === "career") {
        document.getElementById("compare-line").style.height = document.getElementById("display-team-stats").offsetHeight.toString() + "px";
    }
    manageFooterBuffer(500 - document.getElementById("display-team-stats").offsetHeight);

    // Add query to recents
    let query = `subject=team&mode=${mode}&name-1=${inputs[1][0]}&name-2=${mode == "find" ? "null" : inputs[1][1]}&career-season=${inputs[2]}&from-1=${inputs[3][0]}&to-1=${inputs[4][0]}&from-2=${inputs[3][1]}&to-2=${inputs[4][1]}`;
    updateRecentQueries(query);

}

// Compile team statistics for display
function compileTeamStatistics(teamName1, teamName2, careerSeason, from1, to1, from2, to2, stats1, stats2) {

    // Variables for easier use
    let textHTML = ["", ""];
    let tablesHTML = [];
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
            textHTML[s] = `<p>League Champions: ${allTimeData[s][0]}</p>`;
            textHTML[s] += `<p>Finals Appearances: ${allTimeData[s][1]}</p>`;
            const winPCT = ((allTimeData[s][3] / allTimeData[s][2])* 100).toFixed(2);
            textHTML[s] += `<p>Win Percentage: ${winPCT}%</p>`;
            textHTML[s] += `<p>Games Played: ${allTimeData[s][2]}</p>`;
            textHTML[s] += `<p>Games Won: ${allTimeData[s][3]}</p>`;
            textHTML[s] += `<p>Games Lost: ${allTimeData[s][4]}</p>`;
            textHTML[s] += `<p>Field Goals Made: ${allTimeData[s][5]}</p>`;
            textHTML[s] += `<p>Field Goals Attempted: ${allTimeData[s][6]}</p>`;
            textHTML[s] += `<p>Field Goals (3 Pointers) Made: ${allTimeData[s][7]}</p>`;
            textHTML[s] += `<p>Field Goals (3 Pointers) Attempted: ${allTimeData[s][8]}</p>`;
            textHTML[s] += `<p>Free Throws Made: ${allTimeData[s][9]}</p>`;
            textHTML[s] += `<p>Free Throws Attempted: ${allTimeData[s][10]}</p>`;
            textHTML[s] += `<p>Offensive Rebounds: ${allTimeData[s][11]}</p>`;
            textHTML[s] += `<p>Defensive Rebounds: ${allTimeData[s][12]}</p>`;
            textHTML[s] += `<p>Total Rebounds: ${allTimeData[s][13]}</p>`;
            textHTML[s] += `<p>Assists: ${allTimeData[s][14]}</p>`;
            textHTML[s] += `<p>Personal Fouls: ${allTimeData[s][15]}</p>`;
            textHTML[s] += `<p>Steals: ${allTimeData[s][16]}</p>`;
            textHTML[s] += `<p>Turnovers: ${allTimeData[s][17]}</p>`;
            textHTML[s] += `<p>Blocks: ${allTimeData[s][18]}</p>`;
            textHTML[s] += `<p>Points Scored: ${allTimeData[s][19]}</p>`;
        }

    // Season stats
    } else if (careerSeason === "season") {
             
        const teamNum = mode == "find" ? 1 : 2;
        const seasonCount = [seasons[0].length, seasons[1].length];
        const statIndexes = [[3, 4, 5, 7, 12, 13, 10, 14, 14], [3, 15, 17, 18, 20, 21, 23], [3, 24, 26, 27, 28, 29, 30, 31, 32], [3, 26, 27, 28, 29, 30, 31, 32]];
        const statWidths = [[64, 20, 26, 42, 42, 28, 56, 40, 44], [64, 50, 32, 60, 40, 48, 30], [64, 62, 28, 26, 20, 24, 28, 26, 26], [64, 32, 30, 40, 30, 30, 30, 32]];
        const statNames = [["SEASON", "GP", "W:L", "WIN%", "CONF", "DIV", "PO-W:L", "FNLS", "CHMP"], ["SEASON", "FG-M:A", "FG%", "FG3-M:A", "FG3%", "FT-M:A", "FT%"], ["SEASON", "REB-O:D", "REB", "AST", "PF", "STL", "TOV", "BLK", "PTS"], ["SEASON", "RPG", "APG", "PFPG", "SPG", "TPG", "BPG", "PPG"]];
        for (let ct = 0; ct < 4; ct++) {
            let statIndex = statIndexes[ct];
            let statWidth = statWidths[ct];
            let statName = statNames[ct];
            tablesHTML.push('<table class="season-table"><tr>');
            for (let n = 0; n < statName.length; n++) {
                tablesHTML[ct] += `<td>${statName[n]}</td>`;
            }
            tablesHTML[ct] += "</tr><tr>";
            for (let s = 0; s < statIndex.length; s++) {
                tablesHTML[ct] += '<td><table>';
                for (let i = 0; i < (seasonCount[0] > seasonCount[1] ? seasonCount[0] : seasonCount[1]); i++) {
                    tablesHTML[ct] += "<tr>";
                    for (let t = 0; t < teamNum; t++) {
                        let data = "&nbsp;-&nbsp;";
                        if (i < seasonCount[t]) {
                            data = seasons[t][i][statIndex[s]];
                            if (statName[s] == "WIN%" || statName[s] == "FG%" || statName[s] == "FG3%" || statName[s] == "FT%") {
                                data = (seasons[t][i][statIndex[s]] * 100).toFixed(1) + "%";
                            }
                            if (statName[s] == "CONF" || statName[s] == "DIV") {
                                data = (seasons[t][i][statIndex[s]] == null ? "-" : `${seasons[t][i][statIndex[s] - 4]}/${seasons[t][i][statIndex[s]]}`)
                            }
                            if (statName[s] == "W:L" || statName[s] == "PO-W:L" || statName[s] == "FG-M:A" || statName[s] == "FG3-M:A" || statName[s] == "FT-M:A" || statName[s] == "REB-O:D") {
                                data = `${seasons[t][i][statIndex[s]]}:${seasons[t][i][statIndex[s] + 1]}`;
                            }
                            if (statName[s] == "FNLS") {
                                data = seasons[t][i][14] == "FINALS APPEARANCE" ? "X" : seasons[t][i][14] == "LEAGUE CHAMPION" ? "X" : "&nbsp;";
                            }
                            if (statName[s] == "CHMP") {
                                data = seasons[t][i][14] == "LEAGUE CHAMPION" ? "X" : "&nbsp;";
                            }
                            if (statName[s] == "RPG" || statName[s] == "APG" || statName[s] == "PFPG" || statName[s] == "SPG" || statName[s] == "TPG" || statName[s] == "BPG" || statName[s] == "PPG") {
                                data = (seasons[t][i][statIndex[s]] / seasons[t][i][4]).toFixed(1);
                            }
                        }
                        tablesHTML[ct] += `<td class=${t == 0 ? '"season-color-1"' : '"season-color-2"'} style="min-width: ${statWidth[s] / teamNum}px">${data}</td>`;
                    }
                    tablesHTML[ct] += "</tr>";
                }
                tablesHTML[ct] += '</table></td>';
            }
            tablesHTML[ct] += "</tr></table>";
        }
    }
    numSeasonTables["TeamSeasonTable"] = 4;
    currentSeasonTable["TeamSeasonTable"] = 0;
    seasonTables["TeamSeasonTable"] = tablesHTML;

    // Formatting and returning
    if (careerSeason === "career") {
        for (let s = 0; s < (mode == "find" ? 1 : 2); s++) {
            if (textHTML[s] === ""){
                textHTML[s] = `<h2>${teamName[s]}</h2>No Data To Show`;
            } else {
                textHTML[s] = `<h2>${teamName[s]}</h2>` + textHTML[s];
            }
        }
    }
    let innerHTML = null;
    if (mode === "find" && careerSeason === "season") {
        innerHTML = `<table class="stat-table"><tr><td class="season-arrow"><button onclick="seasonTablePrevious('TeamSeasonTable')"><strong><</strong></button></td><td id="team-season-table">${seasonTables["TeamSeasonTable"][0]}</td><td class="season-arrow"><button onclick="seasonTableNext('TeamSeasonTable')"><strong>></strong></button></td></tr></table>`;
    } else if (mode === "compare" && careerSeason === "season") {
        innerHTML = '<table class="stat-table">'
        + `<tr><td class="season-arrow"><button onclick="seasonTablePrevious('TeamSeasonTable')"><strong><</strong></button>`
        + `</td><td><table><tr><td class="season-color-1">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</td><td class="season-key">&nbsp;&nbsp;${teamName1}</td></tr><tr><td class="season-color-2">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</td><td class="season-key">&nbsp;&nbsp;${teamName2}</td></tr></table></td>`
        + `<td class="season-arrow"><button onclick="seasonTableNext('TeamSeasonTable')"><strong>></strong></button></td></tr>`
        + `<tr><td></td><td id="team-season-table">${seasonTables["TeamSeasonTable"][0]}</td><td></td></tr></table>`;
    } else if (mode === "find" && careerSeason === "career") {
        innerHTML = `<table class="stat-table"><tr><td>${textHTML[0]}</td></tr></table>`;
    } else if (mode === "compare" && careerSeason === "career") {
        innerHTML = `<table class="stat-table"><tr>
        <td>${textHTML[0]}</td>
        <td><div class="compare-line" id="compare-line"></div></td>
        <td>${textHTML[1]}</td>
        </tr></table>`;
    }
    innerHTML = `<div id="favorite-checkbox">` +
    `</div>${innerHTML}`
    return innerHTML;

}

// Changes season tables
function seasonTableNext(seasonTableName) {
    currentSeasonTable[seasonTableName]++;
    if (currentSeasonTable[seasonTableName] == numSeasonTables[seasonTableName]) {
        currentSeasonTable[seasonTableName] = 0;
    }
    document.getElementById(seasonTableNameToID[seasonTableName]).innerHTML = seasonTables[seasonTableName][currentSeasonTable[seasonTableName]];
}
function seasonTablePrevious(seasonTableName) {
    currentSeasonTable[seasonTableName]--;
    if (currentSeasonTable[seasonTableName] < 0) {
        currentSeasonTable[seasonTableName] = (numSeasonTables[seasonTableName] - 1);
    }
    document.getElementById(seasonTableNameToID[seasonTableName]).innerHTML = seasonTables[seasonTableName][currentSeasonTable[seasonTableName]];
}

// Switches stat mode
function switchStatMode() {

    manageFooterBuffer(500);
    newMode = mode == "find" ? "compare" : "find";
    document.getElementById("display-" + subject + "-stats").innerHTML = "";
    document.getElementById("search-" + mode + "-" + subject + "-stats").style.display = "none";
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
        let from = [null, null];
        let to = [null, null];
        if (returnArray[returnArray.length - 1] === "season") {
            for (let i = 0; i < fromToCount; i++) {
                from[i] = document.getElementById(mode + "-from-input" + (nameCount == 1 ? "" : ("-" + (i + 1)))).value;
                if (from[i].match(seasonRegex) == null) {
                    from[i] = "None";
                    document.getElementById(mode + "-from-input" + (nameCount == 1 ? "" : ("-" + (i + 1)))).value = from[i];
                }
                to[i] = document.getElementById(mode + "-to-input" + (nameCount == 1 ? "" : ("-" + (i + 1)))).value;
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

// Manages the buffer between content and footer
function manageFooterBuffer(neededBuffer) {
    if (neededBuffer < 0) {
        neededBuffer = 0;
    }
    document.getElementById("footer-buffer").style.height = (neededBuffer + "px");
}
