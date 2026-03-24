export const getRules = async () => {
    return [
        "Enter words that start with the last letter of the previous word.",
        "Each word must be at least 2 letters long.",
        "You have 60 seconds to enter each word.",
        "Score points based on word length (1 points per letter).",
        "Avoid repeating words that have already been played.",
        "The game ends when time runs out.",
    ]
}