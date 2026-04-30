
// All API Calls
// Base URL
base = 'https://posthexaplar-camie-sparklessly.ngrok-free.dev';
default_headers = { 'ngrok-skip-browser-warning': 'true' };

// Pings the API to wake up
async function helloWorld() {

    try {
        const response = await fetch(`${base}/`,{
            method: 'GET',
            headers: default_headers
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
        const response = await fetch(`${base}/player-info`,{
            method: 'GET',
            headers: default_headers
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
        const response = await fetch(`${base}/player-stats?id=${id}`,{
            method: 'GET',
            headers: default_headers
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
        const response = await fetch(`${base}/team-info`,{
            method: 'GET',
            headers: default_headers
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        teamNames = [];
        let abbToName = [];
        let nameToID = [];
        for (i = 0; i < data.length; i++) {
            teamNames.push(data[i][1]);
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
        const response = await fetch(`${base}/team-stats?id=${id}`,{
            method: 'GET',
            headers: default_headers
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

// Sign up the user
async function userSignup(username, password) {

    try {
        const response = await fetch(`${base}/signup`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...default_headers
            },
            body: JSON.stringify({
                username: username,
                password: password
            })
        });
        if (response.ok) {
            return "Account Successfully Created";
        } else {
            if (response.status == 409) {
                return "Account With Username Already Exists";
            } else if (response.status == 400) {
                return "Invalid Input";
            }
            return "Error Occurred When Creating Account";
        }
    } catch (error) {
        console.error("Signup error:", error);
    }
    
}

// Logs user in
async function userLogin(username, password) {

    try {
        const response = await fetch(`${base}/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...default_headers
            },
            body: JSON.stringify({
                username: username,
                password: password
            }),
            credentials: 'include'
        });
        const data = await response.json()
        if (response.ok) {
            sessionStorage.setItem("logged-in", "true");
            return "Successful Login";
        } else {
            if (response.status == 400) {
                return "Invalid Input";
            }
            return "Incorrect Username or Password";
        }
    } catch (error) {
        console.error("Login error:", error);
    }
    
}

// Logs user in
async function userDelete() {

    try {
        const response = await fetch(`${base}/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...default_headers
            },
            credentials: 'include'
        });
        const data = await response.json()
        if (response.ok) {
            return "Account Sucessfully Deleted";
        } else {
            return "No Account Found To Delete";
        }
    } catch (error) {
        console.error("Deletion error:", error);
    }
    
}

// Get favorite queries
async function getFavorites() {

    try {
        const response = await fetch(`${base}/favorites`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                ...default_headers
            },
            credentials: 'include'
        });
        const data = await response.json()
        if (response.ok) {
            return data['favorites'];
        } else {
            return "Error";
        }
    } catch (error) {
        console.error("Fetch error:", error);
    }

}

// Update favorite queries
async function updateFavorites(favorites) {

    try {
        const response = await fetch(`${base}/favorites`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...default_headers
            },
            body: JSON.stringify({
                favorites: favorites
            }),
            credentials: 'include'
        })
        const data = await response.json()
        if (response.ok) {
            return "Successful Update";
        } else {
            return "Update Error";
        }
    } catch (error) {
        console.error("Update error:", error);
    }

}

