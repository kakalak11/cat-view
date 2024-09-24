const API_KEY = "live_xZjBI0DsGYFT7iYVbmdmtoT8AIW0xd2AWLQYXW9Ua0dDqMYA5Ucue761hsXWdVIT";
const headers = { 'x-api-key': API_KEY };
const baseUrl = "https://api.thecatapi.com/v1";
const storageKey = "favoriteCats";
const _localStorage = window.localStorage;
let fetchData = [];
let currentPage = 0;
const imgDiv = document.getElementById('cat-image');
const modal = document.getElementById("myModal");
const btn = document.getElementById("myBtn");
const span = document.getElementsByClassName("close")[0];

fetch(`${baseUrl}/images/search?limit=10`, headers)
    .then((response) => response.json())
    .then(data => {
        fetchData = fetchData.concat(data);

        randomImageCache();
    });

function randomImageCache() {
    if (fetchData) {
        const randIndex = Math.floor(Math.random() * fetchData.length);

        if (fetchData[randIndex] && fetchData[randIndex].url) {
            imgDiv.src = fetchData[randIndex].url;
            currentPage = randIndex;
        }
    }
}

function fetchNewImage(id) {
    fetch(`${baseUrl}/images/${id ? id : "search"}`, headers)
        .then((response) => response.json())
        .then(data => {
            if (data.length > 0) {
                data = data.pop();
            }
            if (data && data.url) {
                imgDiv.src = data.url;
                fetchData = fetchData.concat(data);
                currentPage = fetchData.length - 1;
            }
            Array.from(favListEl.children).forEach(element => element.style.color = 'black');
        })
        .catch(err => {
            throw new Error(err)
        });
}

function nextImage() {
    currentPage++
    if (currentPage >= fetchData.length) {
        currentPage = 0;
    }

    if (fetchData[currentPage] && fetchData[currentPage].url) {
        imgDiv.src = fetchData[currentPage].url;
    }
}

function prevImage() {
    currentPage--;
    if (currentPage < 0) {
        currentPage = fetchData.length - 1;
    }

    if (fetchData[currentPage] && fetchData[currentPage].url) {
        imgDiv.src = fetchData[currentPage].url;
    }
}

function saveImage() {
    const id = fetchData[currentPage].id;
    if (_localStorage) {
        let favCats = _localStorage.getItem(storageKey);
        if (favCats) {
            favCats = JSON.parse((favCats))
            if (favCats.findIndex(favId => id === favId) === -1) {
                favCats = favCats.concat(id);
            }
            _localStorage.setItem(storageKey, JSON.stringify(favCats));
        } else {
            _localStorage.setItem(storageKey, JSON.stringify([id]));
        }
    }
    syncSavedCats();
}

function getSavedImages() {
    let data = []
    if (_localStorage) {
        data = _localStorage.getItem(storageKey);
        if (data) {
            data = JSON.parse(data);
        }
    }
    return data;
}



// When the user clicks on the button, open the modal
btn.onclick = function () {
    modal.style.display = "block";
}

// When the user clicks on <span> (x), close the modal
span.onclick = function () {
    modal.style.display = "none";
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function (event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
}

let favListEl = document.getElementById("favorite-list");

function addListElement(content) {
    const newDiv = document.createElement("li");
    const newContent = document.createTextNode(content);
    newDiv.appendChild(newContent);
    newDiv.setAttribute("style", "margin: 10px");

    const newButton = document.createElement("button");
    newButton.setAttribute("style", "margin-left: 10px; float: right");
    const btnContent = document.createTextNode("Show");
    newButton.appendChild(btnContent);

    const delButton = document.createElement("button");
    delButton.setAttribute("style", "margin-left: 10px; float: right");
    const delBtnContent = document.createTextNode("Delete");
    delButton.appendChild(delBtnContent);

    newDiv.appendChild(newButton);
    newDiv.appendChild(delButton);
    newButton.onclick = handleSaveImageClick.bind(this, content, newDiv);
    delButton.onclick = handleRemoveImageClick.bind(this, content);
    favListEl.appendChild(newDiv);
}

function syncSavedCats() {
    const savedImages = getSavedImages();
    favListEl.innerHTML = '';

    if (savedImages.length > 0) {
        savedImages.forEach((id) => {
            addListElement(id);
        })
    } else {
        addListElement("You have no favorite cat yet !");
    }
}

function handleSaveImageClick(id, element) {
    fetchNewImage(id);
    modal.style.display = "none";
    Array.from(favListEl.children).forEach(element => element.style.color = 'black');
    element.style.color = "red";
}

function handleRemoveImageClick(id) {
    if (_localStorage) {
        let favCats = _localStorage.getItem(storageKey);
        if (favCats) {
            favCats = JSON.parse((favCats))
            const imageIndex = favCats.findIndex(favId => id === favId);
            if (imageIndex > -1) {
                favCats.splice(imageIndex, 1);
                _localStorage.setItem(storageKey, JSON.stringify(favCats));
                syncSavedCats();
            }
        }
    }
}

syncSavedCats();