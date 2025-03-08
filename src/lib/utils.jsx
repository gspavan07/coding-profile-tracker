export function calculatePerformance(student) {
  const gfgRating = extractRating(student.gfg.Rating);
  const codechefRating = extractRating(student.codechef.Rating);
  const hackerrankBadges = student.hackerrank.Badges || [];
  const hackerrankScore = hackerrankBadges.reduce(
    (acc, badge) => acc + badge.stars * 5,
    0
  );

  const averageRating = (gfgRating + codechefRating) / 2; // Average GFG and CodeChef Ratings
  return averageRating + hackerrankScore; // Total Performance Score
}

export function extractRating(rating) {
  if (!rating || typeof rating !== "string") return 0; // Handle undefined/null values
  const match = rating.match(/\d+/); // Extract only numbers
  return match ? parseInt(match[0], 10) : 0; // Return number or 0 if not found
}
