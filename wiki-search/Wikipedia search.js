const searchInputEl = document.getElementById("searchInput");
const searchResultsEl = document.getElementById("searchResults");
const spinnerEl = document.getElementById("spinner");
const statusTextEl = document.getElementById("statusText");
const searchFormEl = document.getElementById("searchForm");
const clearButtonEl = document.getElementById("clearButton");

let debounceTimer;

function setStatus(message) {
    statusTextEl.textContent = message;
}

function toggleLoading(isLoading) {
    spinnerEl.classList.toggle("d-none", !isLoading);
}

function createAndAppendSearchResult(result) {
    const {
        link,
        title,
        description
    } = result;

    const resultItemEl = document.createElement("div");
    resultItemEl.classList.add("result-item");

    const titleEl = document.createElement("a");
    titleEl.href = link;
    titleEl.target = "_blank";
    titleEl.rel = "noopener noreferrer";
    titleEl.textContent = title || "Untitled";
    titleEl.classList.add("result-title");
    resultItemEl.appendChild(titleEl);

    const urlEl = document.createElement("a");
    urlEl.classList.add("result-url");
    urlEl.href = link;
    urlEl.target = "_blank";
    urlEl.rel = "noopener noreferrer";
    urlEl.textContent = link;
    resultItemEl.appendChild(urlEl);

    const descriptionEl = document.createElement("p");
    descriptionEl.classList.add("link-description");
    descriptionEl.textContent = description || "No description available.";
    resultItemEl.appendChild(descriptionEl);

    searchResultsEl.appendChild(resultItemEl);
}

function renderEmptyState(message) {
    const emptyEl = document.createElement("div");
    emptyEl.classList.add("empty-state");
    emptyEl.textContent = message;
    searchResultsEl.appendChild(emptyEl);
}

async function fetchResults(query) {
    const url = "https://apis.ccbp.in/wiki-search?search=" + encodeURIComponent(query.trim());
    const response = await fetch(url, {
        method: "GET"
    });

    if (!response.ok) {
        throw new Error("Unable to fetch results");
    }

    const jsonData = await response.json();
    return jsonData.search_results || [];
}

async function performSearch(query) {
    const trimmedQuery = query.trim();
    if (!trimmedQuery) {
        searchResultsEl.textContent = "";
        setStatus("Type to begin searching.");
        return;
    }

    toggleLoading(true);
    setStatus("Searching for \"" + trimmedQuery + "\"...");
    searchResultsEl.textContent = "";

    try {
        const searchResults = await fetchResults(trimmedQuery);
        toggleLoading(false);

        if (searchResults.length === 0) {
            renderEmptyState("No results found. Try a different keyword.");
            setStatus("No results for \"" + trimmedQuery + "\"");
            return;
        }

        searchResults.forEach(createAndAppendSearchResult);
        setStatus("Showing " + searchResults.length + " result(s) for \"" + trimmedQuery + "\"");
    } catch (error) {
        toggleLoading(false);
        renderEmptyState("Something went wrong. Please try again.");
        setStatus(error.message);
    }
}

function handleSubmit(event) {
    event.preventDefault();
    performSearch(searchInputEl.value);
}

function handleLiveSearch() {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(function() {
        performSearch(searchInputEl.value);
    }, 450);
}

function clearResults() {
    searchInputEl.value = "";
    searchResultsEl.textContent = "";
    setStatus("Cleared. Type to begin searching.");
    searchInputEl.focus();
}

searchFormEl.addEventListener("submit", handleSubmit);
searchInputEl.addEventListener("input", handleLiveSearch);
clearButtonEl.addEventListener("click", clearResults);