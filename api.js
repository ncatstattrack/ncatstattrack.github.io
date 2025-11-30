
// All API Calls
// Gets player stats
async function callPlayerStats(id, failCounter) {

    try {
        const response = await fetch(`https://testing-75ef.onrender.com/player-stats?id=${id}`,{
            method: 'GET'
        });
        if (failCounter == 4) {
            return "FAIL";
        } else if (!response.ok) {
            return callPlayerStats(id, failCounter + 1);
        } else {
            const data = await response.json();
            return data;
        }
    } catch (error) {
        console.error('Error fetching data:', error);
    }

}

// Gets list of all teams in the league
async function callTeamInfo() {
    
    if (teamAbbToName != null) {
        return;
    }
  
    try {
        const response = await fetch('https://testing-75ef.onrender.com/team-info',{
            method: 'GET'
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        let abbToName = [];
        for (i = 0; i < data.length; i++) {
            abbToName.push([data[i][2], data[i][1]]);
        }
        teamAbbToName = new Map(abbToName);
    } catch (error) {
        console.error('Error fetching data:', error);
    }

}

// Gets list of all players in the league
async function callPlayerInfo() {

    if (playerNames != null) {
        return;
    }
  
    try {
        const response = await fetch('https://testing-75ef.onrender.com/player-info',{
            method: 'GET'
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        playerNames = [];
        let playerInfo = [];
        for (i = 0; i < data.length; i++) {
            playerNames.push(data[i][0]);
            playerInfo.push(data[i]);
        }
        playerIDToName = new Map(playerInfo);
    } catch (error) {
        console.error('Error fetching data:', error);
    }

}

// Pings the API to wake up
async function helloWorld() {

    try {
        const response = await fetch('https://testing-75ef.onrender.com/',{
            method: 'GET'
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.text();
        console.log(data);
    } catch (error) {
        console.error('Error fetching data:', error);
    }

}
