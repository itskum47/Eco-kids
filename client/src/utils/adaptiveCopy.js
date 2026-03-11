/**
 * Maps copy keys to grade-specific language.
 */
export const copy = (band, key) => {
    const dictionary = {
        'start_cta': {
            seedling: 'Start My Adventure 🚀',
            explorer: 'Begin Exploring →',
            challenger: 'Take the Challenge →',
            expert: 'Open Dashboard →',
        },
        'correct': {
            seedling: 'Amazing! You got it! ⭐',
            explorer: 'Nice one! 🌿',
            challenger: 'Correct! +EP awarded',
            expert: 'Correct (+EP)',
        },
        'wrong': {
            seedling: 'Oops! Try again! 😊',
            explorer: 'Not quite — try again!',
            challenger: 'Incorrect. Review and retry.',
            expert: 'Incorrect.',
        },
        'view_lesson': {
            seedling: 'Tap to learn! 👆',
            explorer: 'Read this lesson',
            challenger: 'Study this topic',
            expert: 'Read the full content',
        },
        'greeting': {
            seedling: 'Hello, Little Eco Hero! 🌳',
            explorer: 'Ready to Explore, Eco Explorer? 🌿',
            challenger: 'Take the Climate Challenge 🌍',
            expert: 'Environmental Science & Policy 🔬',
        },
        'sub_greeting': {
            seedling: "Let's learn how to save our planet today!",
            explorer: "Discover India's nature — earn points, complete challenges, save the planet.",
            challenger: 'NCERT-aligned environmental science for Class 7–9. Earn EP. Beat your school.',
            expert: 'NCERT Class 10–12 | SDG Progress | Carbon Footprint | Green Careers',
        }
    };

    return dictionary[key]?.[band] || key;
};
