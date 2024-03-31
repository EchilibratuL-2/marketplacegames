import "./style.css";

let allTeams = [];
let editId;

function $(selector) {
  return document.querySelector(selector);
}

function createTeamRequest(team) {
  fetch("http://localhost:3000/teams-json/create", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(team)
  });
}

function deleteTeamRequest(id) {
  fetch("http://localhost:3000/teams-json/delete", {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ id: id })
  });
}

function updateTeamRequest(team) {
  return fetch("http://localhost:3000/teams-json/update", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(team)
  });
}

function filterTeams(query) {
  const filteredTeams = allTeams.filter(team => {
    // You can customize this condition based on your filtering criteria
    return (
      team.promotion.toLowerCase().includes(query.toLowerCase()) ||
      team.members.toLowerCase().includes(query.toLowerCase()) ||
      team.name.toLowerCase().includes(query.toLowerCase()) ||
      team.url.toLowerCase().includes(query.toLowerCase())
    );
  });
  renderTeams(filteredTeams); // Render filtered teams
}

$("#searchInput").addEventListener("input", function() {
  const query = this.value.trim(); // Get the search query
  filterTeams(query); // Filter teams based on the query
});

function getTeamAsHTML(team) {
  return `<tr>
    <td>${team.promotion}</td>
    <td>${team.members}</td>
    <td>${team.name}</td>
    <td>${team.url}</td>
    <td>
      <a href="#" data-id="${team.id}" class="delete-btn">✖</a> 
      <a href="#" data-id="${team.id}" class="edit-btn">&#9998;</a> 
    </td>
  </tr>`;
}

function renderTeams(teams) {
  const teamsHTML = teams.map(getTeamAsHTML);

  $("#teamsTable tbody").innerHTML = teamsHTML.join("");
}

function loadTeams() {
  fetch("http://localhost:3000/teams-json")
    .then(r => r.json())
    .then(teams => {
      allTeams = teams;
      renderTeams(teams);
      return teams;
    });
}

function getFormValues() {
  return {
    promotion: $("input[name=promotion]").value,
    members: $("input[name=members]").value,
    name: $("input[name=name]").value,
    url: $("input[name=url]").value
  };
}

function setFormValues(team) {
  $("input[name=promotion]").value = team.promotion;
  $("input[name=members]").value = team.members;
  $("input[name=name]").value = team.name;
  $("input[name=url]").value = team.url;
}

function onSubmit(e) {
  e.preventDefault();
  let team = getFormValues();
  if (editId) {
    team.id = editId;
    const req = updateTeamRequest(team);
    const response = req.then(r => r.json());
    response.then(status => {
      if (status.succes) {
        window.location.reload();
      }
    });
  } else {
    const req = createTeamRequest(team);
    const response = req.then(r => r.json());
    response.then(status => {
      if (status.success) {
        window.location.reload();
      }
    });
    createTeamRequest(team)
      .then(r => r.json())
      .then(status => {
        if (status.success) {
          window.location.reload();
        }
      });
  }
}

function startEdit(teams, id) {
  editId = id;
  const team = teams.find(team => {
    return id === team.id;
  });
  setFormValues(team);
}

function initEvents() {
  $("#teamsForm").addEventListener("submit", onSubmit);
  $("#teamsTable tbody").addEventListener("click", e => {
    if (e.target.matches("a.delete-btn")) {
      const id = e.target.dataset.id;
      deleteTeamRequest(id);
      window.location.reload();
    } else if (e.target.matches("a.edit-btn")) {
      e.preventDefault();
      const id = e.target.dataset.id;
      startEdit(allTeams, id);
    }
  });
}

initEvents();
loadTeams();
