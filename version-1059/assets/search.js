function normalize(value) {
    return String(value || "").toLowerCase().trim();
}

function createMeta(items) {
    return items
        .filter(Boolean)
        .map(function (item) {
            return "<span>" + item + "</span>";
        })
        .join("");
}

function renderCard(movie) {
    return [
        "<article class=\"search-result-card\">",
        "<a href=\"" + movie.url + "\"><img src=\"" + movie.cover + "\" alt=\"" + movie.title + "\" loading=\"lazy\"></a>",
        "<div>",
        "<h2><a href=\"" + movie.url + "\">" + movie.title + "</a></h2>",
        "<p>" + movie.oneLine + "</p>",
        "<div class=\"movie-card__meta\">" + createMeta([movie.year, movie.type, movie.region, movie.genre]) + "</div>",
        "</div>",
        "</article>"
    ].join("");
}

document.addEventListener("DOMContentLoaded", function () {
    var resultRoot = document.querySelector("[data-search-results]");
    var countRoot = document.querySelector("[data-search-count]");
    var input = document.querySelector("[data-search-input]");
    var query = new URLSearchParams(window.location.search).get("q") || "";

    if (input) {
        input.value = query;
    }

    if (!resultRoot) {
        return;
    }

    fetch("assets/search-index.json")
        .then(function (response) {
            return response.json();
        })
        .then(function (items) {
            var keyword = normalize(query);
            var results = items;

            if (keyword) {
                results = items.filter(function (movie) {
                    return normalize([
                        movie.title,
                        movie.region,
                        movie.type,
                        movie.year,
                        movie.genre,
                        movie.tags,
                        movie.oneLine
                    ].join(" ")).indexOf(keyword) !== -1;
                });
            }

            if (countRoot) {
                countRoot.textContent = keyword ? "找到 " + results.length + " 部相关影片" : "共收录 " + results.length + " 部影片";
            }

            if (!results.length) {
                resultRoot.innerHTML = "<p class=\"search-empty\">没有找到匹配的影片，请尝试更换关键词。</p>";
                return;
            }

            resultRoot.innerHTML = results.slice(0, 120).map(renderCard).join("");

            if (results.length > 120) {
                resultRoot.insertAdjacentHTML("afterend", "<p class=\"pagination-note\">已显示前 120 条匹配结果，请输入更精确的关键词继续筛选。</p>");
            }
        });
});
