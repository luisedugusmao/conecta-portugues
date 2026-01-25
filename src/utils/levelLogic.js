/**
 * Calculates the level, progress, and thresholds based on Total XP.
 * Logic:
 * Level 1 requires 500 XP.
 * Each subsequent level requires 20% more XP than the previous level.
 * 
 * Level 1 Delta: 500
 * Level 2 Delta: 600 (500 * 1.2)
 * Level 3 Delta: 720 (600 * 1.2)
 * ...
 */

export const calculateLevel = (totalXP = 0) => {
    let level = 1;
    let currentLevelXP = 0; // XP accumulated within the current level
    let xpNeededForNextLevel = 500; // Base XP for Level 1
    let accumulatedXP = 0; // Total XP threshold to reach current level

    // Iteratively find the level
    // We loop while totalXP is greater than the cumulative XP required to finish the current level
    while (totalXP >= accumulatedXP + xpNeededForNextLevel) {
        accumulatedXP += xpNeededForNextLevel;
        currentLevelXP = 0; // Reset for next calculation logic, though effectively we want remainder

        // Increase difficulty for next level
        xpNeededForNextLevel = Math.floor(xpNeededForNextLevel * 1.2);
        level++;
    }

    currentLevelXP = totalXP - accumulatedXP;
    const progress = Math.min((currentLevelXP / xpNeededForNextLevel) * 100, 100);
    const xpRemaining = xpNeededForNextLevel - currentLevelXP;

    return {
        level,
        currentLevelXP,
        xpNeededForNextLevel,
        progress,
        xpRemaining,
        levelTitle: getLevelTitle(level)
    };
};

export const getLevelTitle = (level) => {
    if (level < 5) return 'Novato';
    if (level < 10) return 'Aprendiz';
    if (level < 20) return 'Explorador';
    if (level < 30) return 'Veterano';
    if (level < 50) return 'Mestre';
    return 'Lenda';
};

export const getLevelReward = (levelsGained = 1) => {
    return levelsGained * 10;
};
