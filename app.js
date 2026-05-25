// UI Elements
const searchInput = document.getElementById('searchInput');
const autocompleteDropdown = document.getElementById('autocompleteDropdown');
const loadingSpinner = document.getElementById('loadingSpinner');
const resultsContainer = document.getElementById('resultsContainer');
const errorContainer = document.getElementById('errorContainer');
const errorTitle = document.getElementById('errorTitle');
const errorMessage = document.getElementById('errorMessage');

const wordTitle = document.getElementById('wordTitle');
const wordPhonetic = document.getElementById('wordPhonetic');
const playAudioBtn = document.getElementById('playAudioBtn');
const meaningsContainer = document.getElementById('meaningsContainer');
const sourceContainer = document.getElementById('sourceContainer');
const sourceLink = document.getElementById('sourceLink');

// State
let audioObject = null;
const CACHE_KEY = 'dictionary_cache';

// Init Cache
function getCache() {
    const cache = localStorage.getItem(CACHE_KEY);
    return cache ? JSON.parse(cache) : {};
}

function setCache(word, data) {
    const cache = getCache();
    cache[word.toLowerCase()] = data;
    try {
        localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
    } catch (e) {
        console.warn('Cache quota exceeded, clearing cache.');
        localStorage.removeItem(CACHE_KEY);
        localStorage.setItem(CACHE_KEY, JSON.stringify({ [word.toLowerCase()]: data }));
    }
}

// Debounce Utility
function debounce(func, delay) {
    let timeoutId;
    return (...args) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            func.apply(null, args);
        }, delay);
    };
}

// Data Fetching
async function fetchWordData(word) {
    const cache = getCache();
    const lowerWord = word.toLowerCase();
    
    if (cache[lowerWord]) {
        return cache[lowerWord];
    }

    const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`);
    
    if (!response.ok) {
        if (response.status === 404) {
            throw new Error('Not Found');
        }
        throw new Error('Network response was not ok');
    }

    const data = await response.json();
    setCache(lowerWord, data);
    return data;
}

// Audio Handling
function setupAudio(phonetics) {
    audioObject = null;
    playAudioBtn.classList.add('hidden');
    
    if (!phonetics || phonetics.length === 0) return;
    
    const audioSource = phonetics.find(p => p.audio && p.audio.length > 0);
    if (audioSource) {
        audioObject = new Audio(audioSource.audio);
        playAudioBtn.classList.remove('hidden');
    }
}

playAudioBtn.addEventListener('click', () => {
    if (audioObject) {
        audioObject.play();
    }
});

// Render Results
function renderResults(data) {
    errorContainer.classList.add('hidden');
    resultsContainer.classList.remove('hidden');
    autocompleteDropdown.classList.add('hidden');

    const entry = data[0]; // Take the first result
    
    // Word Header
    wordTitle.textContent = entry.word;
    wordPhonetic.textContent = entry.phonetic || '';
    
    // Find phonetic text if not at top level
    if (!entry.phonetic && entry.phonetics) {
        const pInfo = entry.phonetics.find(p => p.text);
        if (pInfo) {
            wordPhonetic.textContent = pInfo.text;
        }
    }
    
    setupAudio(entry.phonetics);

    // Meanings
    meaningsContainer.innerHTML = '';
    entry.meanings.forEach(meaning => {
        const section = document.createElement('div');
        section.className = 'meaning-section';
        
        const posHeader = document.createElement('div');
        posHeader.className = 'part-of-speech';
        posHeader.innerHTML = `<h3>${meaning.partOfSpeech}</h3>`;
        section.appendChild(posHeader);
        
        const meaningHeading = document.createElement('h4');
        meaningHeading.className = 'meaning-heading';
        meaningHeading.textContent = 'Meaning';
        section.appendChild(meaningHeading);
        
        const list = document.createElement('ul');
        list.className = 'definition-list';
        
        meaning.definitions.forEach(def => {
            const li = document.createElement('li');
            li.className = 'definition-item';
            
            let html = `<span>${def.definition}</span>`;
            if (def.example) {
                html += `<span class="example">"${def.example}"</span>`;
            }
            li.innerHTML = html;
            list.appendChild(li);
        });
        
        section.appendChild(list);
        
        // Synonyms
        if (meaning.synonyms && meaning.synonyms.length > 0) {
            const synDiv = document.createElement('div');
            synDiv.className = 'synonyms-container';
            synDiv.innerHTML = `<span class="synonyms-label">Synonyms</span> <span class="synonyms-list">${meaning.synonyms.join(', ')}</span>`;
            section.appendChild(synDiv);
        }
        
        // Antonyms
        if (meaning.antonyms && meaning.antonyms.length > 0) {
            const antDiv = document.createElement('div');
            antDiv.className = 'synonyms-container';
            antDiv.innerHTML = `<span class="synonyms-label">Antonyms</span> <span class="synonyms-list">${meaning.antonyms.join(', ')}</span>`;
            section.appendChild(antDiv);
        }
        
        meaningsContainer.appendChild(section);
    });
    
    // Source
    if (entry.sourceUrls && entry.sourceUrls.length > 0) {
        sourceLink.href = entry.sourceUrls[0];
        sourceLink.textContent = entry.sourceUrls[0];
        sourceContainer.classList.remove('hidden');
    } else {
        sourceContainer.classList.add('hidden');
    }
}

// Error Rendering
function renderError(type, word) {
    resultsContainer.classList.add('hidden');
    errorContainer.classList.remove('hidden');
    autocompleteDropdown.classList.add('hidden');
    
    if (type === 'Not Found') {
        errorTitle.textContent = 'No Definitions Found';
        errorMessage.textContent = `Sorry pal, we couldn't find definitions for the word "${word}". You can try the search again or head to the web instead.`;
    } else {
        errorTitle.textContent = 'Something went wrong';
        errorMessage.textContent = 'We encountered an error while searching for the word. Please check your connection and try again.';
    }
}

// Autocomplete and Prefetching
async function handleSearchInput(value) {
    const word = value.trim();
    if (!word) {
        autocompleteDropdown.classList.add('hidden');
        resultsContainer.classList.add('hidden');
        errorContainer.classList.add('hidden');
        return;
    }
    
    // Show spinner
    loadingSpinner.classList.remove('hidden');
    
    try {
        // Prefetch definition
        const data = await fetchWordData(word);
        
        // Populate Autocomplete (in a real app, this might come from a different lightweight endpoint, 
        // but here we just suggest the word itself and related words if any, or just show the fetched word)
        const suggestions = [data[0].word];
        
        renderSuggestions(suggestions, data);
        
    } catch (error) {
        if (error.message === 'Not Found') {
            autocompleteDropdown.innerHTML = '<li class="autocomplete-item"><i>No suggestions</i></li>';
            autocompleteDropdown.classList.remove('hidden');
        } else {
            autocompleteDropdown.classList.add('hidden');
        }
    } finally {
        loadingSpinner.classList.add('hidden');
    }
}

function renderSuggestions(suggestions, prefetchedData) {
    autocompleteDropdown.innerHTML = '';
    if (suggestions.length === 0) {
        autocompleteDropdown.classList.add('hidden');
        return;
    }
    
    suggestions.forEach(sug => {
        const li = document.createElement('li');
        li.className = 'autocomplete-item';
        li.innerHTML = `<i class="ri-search-line"></i> ${sug}`;
        li.addEventListener('click', () => {
            searchInput.value = sug;
            renderResults(prefetchedData);
        });
        autocompleteDropdown.appendChild(li);
    });
    
    autocompleteDropdown.classList.remove('hidden');
}

// Submit Search
async function performExplicitSearch(word) {
    if (!word) return;
    
    loadingSpinner.classList.remove('hidden');
    autocompleteDropdown.classList.add('hidden');
    
    try {
        const data = await fetchWordData(word);
        renderResults(data);
    } catch (error) {
        renderError(error.message, word);
    } finally {
        loadingSpinner.classList.add('hidden');
    }
}

// Event Listeners
const debouncedInputHandler = debounce((e) => {
    handleSearchInput(e.target.value);
}, 300);

searchInput.addEventListener('input', debouncedInputHandler);

searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const word = searchInput.value.trim();
        performExplicitSearch(word);
    }
});

// Close dropdown when clicking outside
document.addEventListener('click', (e) => {
    if (!e.target.closest('.search-container')) {
        autocompleteDropdown.classList.add('hidden');
    }
});
