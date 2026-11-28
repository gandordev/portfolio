/***************************************
LOAD PROJECTS FROM FILE CREATED ON BUILD
***************************************/

async function getProjects() {
    const container = document.getElementById("gh-projects");
    let data = null;

    try {
        const res = await fetch("./out/repos.json", { cache: "no-store" });
        if (!res.ok) {
            throw new Error(`${res.status}: No repos found`);
        }

        data = await res.json();

    } catch (err) {
        console.error("Error loading repos:", err);
    }
    if (data?.repos.length === 0)
        return;

    container.innerHTML = ''
    const projects = data.repos


    // Load projects in DOM
    projects.forEach(project => {
        const name = project.isArchived
            ? `<span style="color: #eab308;">(Archived)</span> ${project.name}`
            : project.name

        // font-weight: bold;
        const desc = project?.description || 'No description available'

        const seeMore = desc.length < 100
            ? desc
            : desc.substring(0, 100) + `... <a href="${project.url}" target="_blank" rel="noopener noreferrer">(see more)</a>`;

        const preview = project.homepageUrl != null && project.homepageUrl !== ''
            ? `<br><br><a href="${project.homepageUrl}" target="_blank" rel="noopener noreferrer"><button type="button" class="action-btn">Preview</button></a>`
            : ''

        const release = project.release != null && project.release !== ''
            ? `<br><br><a href="${project.release}" target="_blank" rel="noopener noreferrer"><button type="button" class="action-btn">Get latest release</button></a>`
            : ''

        // Generate box
        container.innerHTML += `
            <div class='project-container'>
                <span class="important">${name}</span> : ${seeMore}
                <br><br>Languages used: <span style="font-size: 15px; font-style: italic">${project.languages}</span>
                
                ${preview}

                ${release}

                <br><br><a href="${project.url}" target="_blank" rel="noopener noreferrer">Repo url</a>
            <div>
            `;
    });
}

/*******
ADD MAIL
*******/

mailField = document.getElementById("send-mail");
mailField.addEventListener('click', () => {
    let mailTo = "trabajosa49@gmail.com";
    let emailSub = "Hi! I saw your portfolio and wanted to say...";

    window.location.href = `mailto:${mailTo}&subject=${emailSub}`
});

getProjects();


/*
*    I choose GraphQL API over REST API to make fewer requests and fetch specific data in one request
*    See: https://docs.github.com/en/rest/about-the-rest-api/comparing-githubs-rest-api-and-graphql-api?apiVersion=2026-03-10
*/

/*
    async function loadProject(path) {
        const container = document.getElementById("gh-projects");
        
        // Default message
        container.textContent = "No projects found ;/"

        // Cannot get projects filtering by starred list custom name. Roundabout by searching by topic
        const res = await fetch(path, {headers: {"Authorization": "Bearer xxx"}}); // Token in /settings/tokens

        const data = await res.json();
        console.log(data)
        // name, description, url, archived, languages_url (to get projects lang used), 
        // homepage (to access project public site), releases_url (to access project releases. Requires tag: https://api.github.com/repos/xxx/<repo>/tags)
        console.log(`Nombre ${data.name}, desc: ${data.description}, url: ${data.url}`);
    };

    // loadProject("https://api.github.com/repos/gandordev/steam-review-generator");
    // loadProject("https://api.github.com/user/starred");
    loadProject("search/repositories?q=user:gandordev+topic:test");
*/