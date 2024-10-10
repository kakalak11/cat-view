import van from "https://cdn.jsdelivr.net/gh/vanjs-org/van/public/van-1.5.2.min.js"
const { a, aside, button, div, footer, h1, h3, header, img, main, p, section, small, ul, li } = van.tags;

const API_KEY = "live_xZjBI0DsGYFT7iYVbmdmtoT8AIW0xd2AWLQYXW9Ua0dDqMYA5Ucue761hsXWdVIT";
const headers = { 'x-api-key': API_KEY, "Access-Control-Allow-Origin": true };
const baseUrl = "https://api.thecatapi.com/v1";
const storageKey = "favoriteCats";
const _localStorage = window.localStorage;
const params = new URLSearchParams(window.location.search);

function getSavedImages() {
    if (!_localStorage) return [];
    let data = _localStorage.getItem(storageKey);
    if (data) {
        data = JSON.parse(data);
    }
    return data;
}

function FavoriteList({ onGetNewImage, currentId, onSaveImage, savedImages }) {
    const listItems = van.derive(() => {
        let isNewAdded = savedImages.val.length > savedImages.oldVal.length;
        return renderList(savedImages.val, isNewAdded, currentId)
    });

    function renderList(list = [], isNewAdded, currentId) {

        return ul({ id: "favorite-list" }, "", list.map((id, index) => {
            const isLastItem = index === list.length - 1;
            const isCurrentFavorite = (isNewAdded && isLastItem) || currentId.val === id;

            return li({
                style: "margin: 5px",
                class: isCurrentFavorite ? "selected" : "",
                onclick: (evt) => {
                    evt.currentTarget.classList.add("selected");
                    currentId.val = id;
                    params.set('id', id);
                    window.history.replaceState({}, '', `${location.pathname}?${params}`);
                },
            }, id);
        }))
    }

    return aside({ class: "side-bar" },
        button({ onclick: onGetNewImage },
            "New Cat",
        ),
        button({ onclick: onSaveImage },
            "Save cat",
        ),
        button({ id: "myBtn" },
            "Open Saved",
        ),
        section({ class: "favorite-section" },
            h3(
                "Your favorite cats",
            ),
            listItems
        ),
    )
}

function showBreedInfo() {
    const ulDiv = ul({ class: "breed-info-list" });

    fetch("https://api.thecatapi.com/v1/breeds", headers)
        .then(response => response.json())
        .then(data => {
            for (const key in data[0]) {
                van.add(ulDiv, li({}, data[0][key]));
            }
        });


    return div({ class: "main-view" }, ulDiv);
}




function App() {
    const currentScreen = van.state("image-view");
    const imgData = van.state({});
    const savedImages = van.state(getSavedImages());
    const currentId = van.state(params.get("id"));

    van.derive(() => {
        // getNewImage(null, currentId.val);
        fetch(`${baseUrl}/images/${currentId.val ? currentId.val : "search"}`, headers)
            .then((response) => response.json())
            .then(data => {
                if (data.length > 0) {
                    data = data.pop();
                }

                imgData.val = data;
            })
            .catch(err => {
                throw new Error(err)
            });
    });

    const catImageDiv = van.derive(() => {
        if (Object.keys(imgData.val).length > 0) {
            const { url: src, width, height, id } = imgData.val;
            return img({ id: "cat-image", alt: "A cat", width, height, src });
        } else {
            return div({}, "No content");
        }
    });

    function saveImage(dataState) {
        const { id = null } = dataState.val;
        if (!_localStorage || !id) return;

        let favCats = _localStorage.getItem(storageKey);
        if (favCats) {
            favCats = JSON.parse((favCats))
            if (favCats.findIndex(favId => id === favId) === -1) {
                favCats = favCats.concat(id);
            }
            savedImages.val = favCats;
            _localStorage.setItem(storageKey, JSON.stringify(favCats));
        } else {
            _localStorage.setItem(storageKey, JSON.stringify([id]));
        }
    }

    function getNewImage(_, id = "") {
        // help, i dont know but i had to code like this
        if (currentId.val) {
            currentId.val = "";
        } else if (currentId.val == currentId.oldVal) {
            fetch(`${baseUrl}/images/${currentId.val ? currentId.val : "search"}`, headers)
                .then((response) => response.json())
                .then(data => {
                    if (data.length > 0) {
                        data = data.pop();
                    }

                    imgData.val = data;
                })
                .catch(err => {
                    throw new Error(err)
                });
        } else {
            currentId.val = id;
        }
    }

    // const detailViewDiv = showBreedInfo();
    const imgViewDiv = div({ class: "main-view" },
        div({ class: "image-container" },
            catImageDiv,
        ),
        div({ class: "button-container" },
            button({},
                "Previous",
            ),
            button({ onclick: () => currentScreen.val = "image-view" },
                "Detail",
            ),
            button({},
                "Next",
            ),
        ),
    );



    return div(
        header(
            h1(
                "View cat for peace of mind",
            ),
            p(
                "This is a front-end for cat API",
            ),
            div(
                "Try yours here 👉 ",
                a({ href: "https://thecatapi.com/" },
                    "https://thecatapi.com/",
                ),
            ),
        ),
        main(
            div({ class: "parent" },
                FavoriteList({ onGetNewImage: getNewImage, currentId, savedImages, onSaveImage: saveImage.bind(this, imgData) }),
                van.derive(() => currentScreen.val == "image-view" ? imgViewDiv : detailViewDiv)
            ),
        ),
        footer(
            small(
                "Coded by kakalak",
            ),
        )
    );
};

van.add(document.body, App())