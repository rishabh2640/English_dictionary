const API_URL = 'https://api.dictionaryapi.dev/api/v2/entries/en/';

// Elements
const searchForm = document.getElementById('search-form');
const searchInput = document.getElementById('search-input');
const resultContainer = document.getElementById('result-container');
const errorMessage = document.getElementById('error-message');
const loader = document.getElementById('loader');
const themeSwitch = document.getElementById('theme-switch');

const wordTitle = document.getElementById('word-title');
const wordPhonetic = document.getElementById('word-phonetic');
const playAudioBtn = document.getElementById('play-audio-btn');
const meaningsContainer = document.getElementById('meanings-container');
const sourceContainer = document.getElementById('source-container');
const sourceLink = document.getElementById('source-link');

let currentAudio = null;

// Initialize Theme
function initTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
        themeSwitch.checked = true;
    } else if (savedTheme === 'light') {
        document.documentElement.setAttribute('data-theme', 'light');
        themeSwitch.checked = false;
    } else {
        // Check system preference
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (prefersDark) {
            document.documentElement.setAttribute('data-theme', 'dark');
            themeSwitch.checked = true;
        }
    }
}

// Toggle Theme
themeSwitch.addEventListener('change', (e) => {
    if (e.target.checked) {
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
    } else {
        document.documentElement.setAttribute('data-theme', 'light');
        localStorage.setItem('theme', 'light');
    }
});

// Search functionality
searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const word = searchInput.value.trim();
    if (word) {
        fetchWord(word);
    }
});

async function fetchWord(word) {
    // Show loader, hide results and errors
    loader.classList.remove('hidden');
    resultContainer.classList.add('hidden');
    errorMessage.classList.add('hidden');
    
    try {
        const response = await fetch(`${API_URL}${word}`);
        const data = await response.json();
        
        if (response.ok) {
            renderData(data[0]);
        } else {
            showError(data);
        }
    } catch (error) {
        showError({
            title: "Network Error",
            message: "Unable to reach the dictionary service. Please check your connection.",
            resolution: "Try again later."
        });
    } finally {
        loader.classList.add('hidden');
    }
}

function renderData(data) {
    // Basic word info
    wordTitle.textContent = data.word;
    
    // Phonetic & Audio
    let phoneticText = "";
    let audioUrl = "";
    
    // Find the first phonetic object that has text and/or audio
    if (data.phonetics && data.phonetics.length > 0) {
        for (const ph of data.phonetics) {
            if (ph.text && !phoneticText) phoneticText = ph.text;
            if (ph.audio && !audioUrl) audioUrl = ph.audio;
        }
    }
    
    // Fallback if phonetics array missed text
    if (!phoneticText && data.phonetic) {
        phoneticText = data.phonetic;
    }
    
    wordPhonetic.textContent = phoneticText || "";
    
    // Handle Audio button
    if (audioUrl) {
        playAudioBtn.classList.remove('hidden');
        playAudioBtn.onclick = () => {
            if (currentAudio) {
                currentAudio.pause();
                currentAudio.currentTime = 0;
            }
            currentAudio = new Audio(audioUrl);
            currentAudio.play();
        };
    } else {
        playAudioBtn.classList.add('hidden');
        playAudioBtn.onclick = null;
    }
    
    // Meanings
    meaningsContainer.innerHTML = '';
    
    data.meanings.forEach(meaning => {
        const section = document.createElement('section');
        section.classList.add('meaning-section');
        
        // Part of speech header
        const posHeader = document.createElement('div');
        posHeader.classList.add('part-of-speech-header');
        posHeader.innerHTML = `
            <span class="part-of-speech">${meaning.partOfSpeech}</span>
            <div class="line"></div>
        `;
        section.appendChild(posHeader);
        
        // Definitions wrapper
        const defWrapper = document.createElement('div');
        defWrapper.innerHTML = `<h3 class="meaning-title">Meaning</h3>`;
        
        const ul = document.createElement('ul');
        ul.classList.add('definitions-list');
        
        meaning.definitions.forEach(def => {
            const li = document.createElement('li');
            li.classList.add('definition-item');
            
            let html = `<span>${def.definition}</span>`;
            if (def.example) {
                html += `<span class="example">"${def.example}"</span>`;
            }
            
            li.innerHTML = html;
            ul.appendChild(li);
        });
        
        defWrapper.appendChild(ul);
        section.appendChild(defWrapper);
        
        // Synonyms
        if (meaning.synonyms && meaning.synonyms.length > 0) {
            const synContainer = document.createElement('div');
            synContainer.classList.add('synonyms-container');
            
            const label = document.createElement('span');
            label.classList.add('synonyms-label');
            label.textContent = 'Synonyms';
            
            const list = document.createElement('div');
            list.classList.add('synonyms-list');
            
            meaning.synonyms.forEach(syn => {
                const item = document.createElement('span');
                item.classList.add('synonym-item');
                item.textContent = syn;
                item.onclick = () => {
                    searchInput.value = syn;
                    fetchWord(syn);
                };
                list.appendChild(item);
            });
            
            synContainer.appendChild(label);
            synContainer.appendChild(list);
            section.appendChild(synContainer);
        }

        // Antonyms
        if (meaning.antonyms && meaning.antonyms.length > 0) {
            const antContainer = document.createElement('div');
            antContainer.classList.add('antonyms-container');
            
            const label = document.createElement('span');
            label.classList.add('antonyms-label');
            label.textContent = 'Antonyms';
            
            const list = document.createElement('div');
            list.classList.add('antonyms-list');
            
            meaning.antonyms.forEach(ant => {
                const item = document.createElement('span');
                item.classList.add('antonym-item');
                item.textContent = ant;
                item.onclick = () => {
                    searchInput.value = ant;
                    fetchWord(ant);
                };
                list.appendChild(item);
            });
            
            antContainer.appendChild(label);
            antContainer.appendChild(list);
            section.appendChild(antContainer);
        }
        
        meaningsContainer.appendChild(section);
    });
    
    // Source
    if (data.sourceUrls && data.sourceUrls.length > 0) {
        sourceContainer.classList.remove('hidden');
        sourceLink.href = data.sourceUrls[0];
        sourceLink.querySelector('.link-text').textContent = data.sourceUrls[0];
    } else {
        sourceContainer.classList.add('hidden');
    }
    
    // Show results
    resultContainer.classList.remove('hidden');
}

function showError(data) {
    const errorTitle = document.getElementById('error-title');
    const errorResolution = document.getElementById('error-resolution');
    
    errorTitle.textContent = data.title || "No Definitions Found";
    errorResolution.textContent = `${data.message || ""} ${data.resolution || ""}`.trim() || 
        "Sorry, we couldn't find definitions for the word you were looking for.";
        
    errorMessage.classList.remove('hidden');
}

// Initial setup
initTheme();
