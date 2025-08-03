// SightWordTracker object to manage sight words
class SightWordTracker {
    constructor() {
        this.sightWords = [];
    }

    // Add a sight word
    addSightWord(word) {
        if (!this.sightWords.includes(word)) {
            this.sightWords.push(word);
            console.log(`Added sight word: ${word}`);
        } else {
            console.log(`Sight word "${word}" already exists.`);
        }
    }

    // Retrieve all sight words
    getSightWords() {
        return this.sightWords;
    }

    // Query sight words based on a search term
    querySightWords(term) {
        return this.sightWords.filter(word => word.includes(term));
    }
}