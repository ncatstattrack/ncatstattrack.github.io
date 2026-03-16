
// All API Calls
// Base URL
base = 'https://posthexaplar-camie-sparklessly.ngrok-free.dev';

// Render Web Service
// base = 'https://testing-75ef.onrender.com/';

deafult_headers = { 'ngrok-skip-browser-warning': 'true' };

// Pings the API to wake up
async function helloWorld() {

    try {
        const response = await fetch(`${base}/`,{
            method: 'GET',
            headers: deafult_headers
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
            headers: deafult_headers
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
            headers: deafult_headers
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
            headers: deafult_headers
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
        const response = await fetch(`${base}/team-stats?id=${id}`,{
            method: 'GET',
            headers: deafult_headers
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

// To log the user into account 
async function loginUser() {

    const username = document.getElementById("login-username").value;
    const password = document.getElementById("login-password").value;

    try {
        const response = await fetch(`${base}/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...deafult_headers
            },
            body: JSON.stringify({
                username: username,
                password: password
            })
        });

        const data = await response.json();

        if (response.ok) {
            alert("Login successful!");
            localStorage.setItem("user", username);
            window.location.href = "index.html";
        } else {
            alert("Invalid username or password.");
        }

    } catch (error) {
        console.error("Login error:", error);
    }

}

// async function registerUser(username, password) {

//     try {
//         const response = await fetch(`${base}/register`, {
//             method: "POST",
//             headers: {
//                 "Content-Type": "application/json",
//                 ...deafult_headers
//             },
//             body: JSON.stringify({
//                 username: username,
//                 password: password
//             })
//         });

//         const data = await response.json();

//         if (response.ok) {
//             alert("Account created!");
//         } else {
//             alert("Signup failed.");
//         }

//     } catch (error) {
//         console.error("Signup error:", error);
//     }

// }
