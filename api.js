
// All API Calls
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
        let nameToID = [];
        for (i = 0; i < data.length; i++) {
            playerNames.push(data[i][0]);
            nameToID.push(data[i]);
        }
        playerNameToID = new Map(nameToID);
    } catch (error) {
        console.error('Error fetching data:', error);
    }

}

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
    
    if (teamNames != null) {
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
        teamNames = [];
        let abbToName = [];
        let nameToID = [];
        for (i = 0; i < data.length; i++) {
            teamNames.push([data[i][1]]);
            abbToName.push([data[i][2], data[i][1]]);
            nameToID.push([data[i][1], data[i][0]]);
        }
        teamAbbToName = new Map(abbToName);
        teamNameToID = new Map(nameToID);
    } catch (error) {
        console.error('Error fetching data:', error);
    }

}

// Gets team stats
async function callTeamStats(id, failCounter) {

    try {
        const response = await fetch(`https://testing-75ef.onrender.com/team-stats?id=${id}`,{
            method: 'GET'
        });
        if (failCounter == 4) {
            return "FAIL";
        } else if (!response.ok) {
            return callTeamStats(id, failCounter + 1);
        } else {
            const data = await response.json();
            return data;
        }
    } catch (error) {
        console.error('Error fetching data:', error);
    }

}
