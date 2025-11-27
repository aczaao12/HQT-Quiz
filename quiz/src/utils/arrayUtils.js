/**
 * Shuffles an array using the Fisher-Yates (Knuth) Algorithm.
 * @param {Array<T>} array - The array to shuffle.
 * @returns {Array<T>} The shuffled array.
 */
export const shuffleArray = (array) => {
    let currentIndex = array.length, randomIndex;

    // While there remain elements to shuffle.
    while (currentIndex !== 0) {
        // Pick a remaining element.
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        // And swap it with the current element.
        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]
        ];
    }

    return array;
};