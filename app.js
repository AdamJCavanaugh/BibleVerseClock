class Time {
    getCurrentTime() {
        const now = new Date();
        const hours = now.getHours().toString();
        const minutes = now.getMinutes().toString().padStart(2, '0');
        return { hours, minutes };
    }

    showTime() {
        const timeElement = document.getElementById('time');
        const { hours, minutes } = this.getCurrentTime();
        timeElement.textContent = `Current Time: ${hours}:${minutes}`;
    }
}

// Function to fetch the Bible text file and parse verses
async function loadBible() {
    try {
        const response = await fetch('http://localhost:5500/bibles/kjv.txt');
        const bibleText = await response.text();
        const verses = parseBibleText(bibleText);
        return verses;
    } catch (error) {
        console.error('Error loading Bible text:', error);
    }
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
    const { hours, minutes } = new Time().getCurrentTime();
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
    const time = new Time()
    time.showTime();
    setInterval(time.showTime, 60000); // Update time every minute
    const verses = await loadBible();
    getVerseByTime(verses);
    setInterval(() => getVerseByTime(verses), 60000); // Update verse every minute
}

// Run the init function when the window loads
window.onload = init;
