// Function to get the current time and return hours/minutes for use in other functions
function getCurrentTime() {
    const now = new Date();
    const hours = now.getHours().toString();
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    return { hours, minutes, seconds };
}

// Function to display current time
function showTime() {
    const timeElement = document.getElementById('time');
    const { hours, minutes, seconds } = getCurrentTime();
    timeElement.textContent = `Current Time: ${hours}:${minutes}:${seconds}`;
}

// Function to fetch the Bible text file and parse verses
async function loadBible(translation) {
    const response = await fetch(`bibles/${translation}.txt`);
    if (!response.ok) {
        throw new Error(`Failed to load ${translation.toUpperCase()} (${response.status})`);
    }
    const bibleText = await response.text();
    return parseBibleText(bibleText);
}

// Function to parse the Bible text into an array of verses
function parseBibleText(bibleText) {
    const lines = bibleText.split('\n');
    const verses = lines.map(line => {
        // Match and extract chapter and verse using regex
        const match = line.match(/(\d+):(\d+)/);
        if (match) {
            const chapter = match[1];
            const verse = match[2];
            return { chapter, verse, text: line };
        } else {
            // Handle lines that might not contain chapter and verse information
            return null;
        }
    }).filter(Boolean); // Remove any null entries
    return verses;
}


// Function to get a random verse
function getRandomVerse(verses) {
    const randomIndex = Math.floor(Math.random() * verses.length);
    return verses[randomIndex];
}

// Function to get a verse based on the current hour and minute
function getVerseByTime(verses) {
    const { hours, minutes } = getCurrentTime();
    const verseElement = document.getElementById('verse');
    
    // Remove leading zeroes
    const cleanHours = hours.replace(/^0+/, '');
    const cleanMinutes = minutes.replace(/^0+/, '');

    let matchingVerse;

    if (cleanMinutes === '0') {
        // If the minute is :00, get a random verse
        matchingVerse = getRandomVerse(verses);
    } else {
        // Filter verses that match the current time
        const matchingVerses = verses.filter(verse => verse.chapter === cleanHours && verse.verse === cleanMinutes);
        
        if (matchingVerses.length > 0) {
            // Pick a random verse from the matching verses
            const randomIndex = Math.floor(Math.random() * matchingVerses.length);
            matchingVerse = matchingVerses[randomIndex];
        } else {
            // If no matching verse is found, get a random verse
            matchingVerse = getRandomVerse(verses);
        }
    }

    verseElement.textContent = matchingVerse ? `${matchingVerse.text}` : "No matching verse found.";
}

// Initialize the app
async function init() {
    let verses;
    let lastMinute;
    let translationRequest = 0;
    const translationSelect = document.getElementById('translation');
    const verseElement = document.getElementById('verse');

    const updateClock = () => {
        showTime();
        const { hours, minutes } = getCurrentTime();
        const currentMinute = `${hours}:${minutes}`;
        if (lastMinute !== undefined && currentMinute !== lastMinute && verses) {
            getVerseByTime(verses);
        }
        lastMinute = currentMinute;
    };

    const updateTranslation = async () => {
        const request = ++translationRequest;
        const translation = translationSelect.value;
        try {
            const loadedVerses = await loadBible(translation);
            if (request !== translationRequest) {
                return;
            }
            verses = loadedVerses;
            getVerseByTime(verses);
        } catch (error) {
            if (request !== translationRequest) {
                return;
            }
            verses = undefined;
            console.error('Error loading Bible text:', error);
            verseElement.textContent = 'Unable to load selected translation.';
        }
    };

    updateClock();
    setInterval(updateClock, 1000);
    translationSelect.addEventListener('change', updateTranslation);
    await updateTranslation();
}

// Run the init function when the window loads
window.onload = init;
