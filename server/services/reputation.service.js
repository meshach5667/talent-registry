const Profile = require("../models/Profile");
const Feedback = require("../models/Feedback");
const ContactRequest = require("../models/ContactRequest");

/**
 * Calculates and updates reputation score for a professional user
 * Focuses on actual platform activity: completed jobs, client ratings, client confirmations, and profile completeness.
 * Does NOT use work-history or project entries themselves as proof that employment is genuine.
 */
async function updateReputationScore(userId) {
  try {
    const profile = await Profile.findOne({ user: userId });
    if (!profile) return null;

    // Fetch actual platform activity: client ratings/feedbacks and confirmed client engagements
    const feedbacks = await Feedback.find({ professional: userId });
    const confirmedContacts = await ContactRequest.find({
      professional: userId,
      status: "accepted",
    });

    // 1. Profile completeness score (0-25)
    let completenessScore = 0;
    if (profile.headline && profile.headline.trim()) completenessScore += 5;
    if (profile.bio && profile.bio.trim().length > 30) completenessScore += 5;
    if (profile.skills && profile.skills.length >= 3) completenessScore += 5;
    if (profile.education && profile.education.length >= 1) completenessScore += 5;
    if (
      profile.socialLinks &&
      (profile.socialLinks.github || profile.socialLinks.linkedin || profile.socialLinks.portfolio)
    ) {
      completenessScore += 5;
    }

    // 2. Client Ratings & Reviews (0-50)
    let avgRating = 0;
    let ratingScore = 0;
    let feedbackBonus = 0;

    if (feedbacks.length > 0) {
      const sum = feedbacks.reduce((acc, f) => acc + (f.rating || 0), 0);
      avgRating = Number((sum / feedbacks.length).toFixed(1));
      ratingScore = Math.round((avgRating / 5) * 35);
      feedbackBonus = Math.min(feedbacks.length * 5, 15);
    }

    // 3. Completed Jobs & Client Confirmations (0-25)
    const clientReviewsCount = feedbacks.filter(
      (f) => f.relationship === "Client / Stakeholder" || f.isVerifiedEmployer
    ).length;
    const completedJobs = confirmedContacts.length + clientReviewsCount;
    const jobsScore = Math.min(completedJobs * 10, 25);

    // Total Reputation Score (10-100)
    const totalScore = Math.min(
      Math.max(completenessScore + ratingScore + feedbackBonus + jobsScore, 10),
      100
    );

    // Determine tier
    let tier = "Emerging";
    if (totalScore >= 80) tier = "Elite Talent";
    else if (totalScore >= 60) tier = "Pro Talent";
    else if (totalScore >= 30) tier = "Emerging";

    // Reliability index (70 - 99%)
    let reliabilityIndex = 75;
    if (feedbacks.length > 0) {
      const avgCompetence =
        feedbacks.reduce(
          (a, f) =>
            a +
            (f.technicalCompetence || 5) +
            (f.communication || 5) +
            (f.reliability || 5),
          0
        ) /
        (feedbacks.length * 3);
      reliabilityIndex = Math.min(
        Math.round(75 + (avgCompetence / 5) * 20 + Math.min(completedJobs * 2, 4)),
        99
      );
    }

    profile.reputation = {
      score: totalScore,
      tier,
      completedJobs,
      clientConfirmations: confirmedContacts.length,
      averageRating: avgRating,
      feedbackCount: feedbacks.length,
      reliabilityIndex: Math.round(reliabilityIndex),
    };

    await profile.save();
    return profile.reputation;
  } catch (error) {
    console.error("[Reputation Service Error]", error);
    return null;
  }
}

module.exports = {
  updateReputationScore,
};
