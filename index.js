import van from "https://cdn.jsdelivr.net/gh/vanjs-org/van/public/van-1.5.2.min.js"
const { a, aside, button, div, footer, h1, h3, header, img, main, p, section, small, ul, li } = van.tags;

const API_KEY = "live_xZjBI0DsGYFT7iYVbmdmtoT8AIW0xd2AWLQYXW9Ua0dDqMYA5Ucue761hsXWdVIT";
const headers = { 'x-api-key': API_KEY, "Access-Control-Allow-Origin": true };
const baseUrl = "https://api.thecatapi.com/v1";
const storageKey = "favoriteCats";
const _localStorage = window.localStorage;

const FavoriteList = (catImageDiv) => {
    const favList = van.state([]);
    const currentId = van.state("");

    getSavedImages();

    function fetchNewImage(_, id) {
        fetch(`${baseUrl}/images/${id ? id : "search"}`, headers)
            .then((response) => response.json())
            .then(data => {
                if (data.length > 0) {
                    data = data.pop();
                }
                if (data) {
                    catImageDiv.src = data.url;
                    catImageDiv.width = data.width;
                    catImageDiv.height = data.height;

                    currentId.val = data.id;
                    favList.val.push(data.id);
                }
            })
            .catch(err => {
                throw new Error(err)
            });
    }

    function saveImage() {
        if (!_localStorage) return;

        let favCats = _localStorage.getItem(storageKey);
        const id = currentId.val;
        if (favCats) {
            favCats = JSON.parse((favCats))
            if (favCats.findIndex(favId => id === favId) === -1) {
                favCats = favCats.concat(id);
            }
            favList.val = favCats;
            _localStorage.setItem(storageKey, JSON.stringify(favCats));
        } else {
            _localStorage.setItem(storageKey, JSON.stringify([id]));
        }
    }

    function getSavedImages() {
        if (!_localStorage) return;

        let data = _localStorage.getItem(storageKey);
        if (data) {
            data = JSON.parse(data);
        }
        favList.val = favList.val.concat(data) || [];
    }

    function renderList(favList = []) {
        const list = favList;
        const liDivs = list.map(id => {
            
            return li({
                style: "margin: 5px", onclick: (evt) => {
                    fetchNewImage(evt, id);
                    liDivs.forEach(div => div.classList.remove("selected"));
                    evt.currentTarget.classList.add("selected");

                },
            }, id);
        });

        return liDivs;
    }

    return aside({ class: "side-bar" },
        button({ onclick: fetchNewImage },
            "New Cat",
        ),
        button({ onclick: saveImage },
            "Save cat",
        ),
        button({ id: "myBtn" },
            "Open Saved",
        ),
        section({ class: "favorite-section" },
            h3(
                "Your favorite cats",
            ),
            ul({ id: "favorite-list" }, "", renderList(favList.val))
        ),
    )
}


const App = () => {
    const catImageDiv = img({ id: "cat-image", alt: "A cat" });

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
                FavoriteList(catImageDiv),
                div({ class: "main-view" },
                    div({ class: "image-container" },
                        catImageDiv,
                    ),
                    div({ class: "button-container" },
                        button({ id: "prev-button" },
                            "Previous",
                        ),
                        button({ id: "next-button" },
                            "Next",
                        ),
                    ),
                ),
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