const Profile = require("../models/Profile");
const Experience = require("../models/Experience");
const Project = require("../models/Project");
const Feedback = require("../models/Feedback");

/**
 * Calculates and updates reputation score for a professional user
 */
async function updateReputationScore(userId) {
  try {
    const profile = await Profile.findOne({ user: userId });
    if (!profile) return null;

    // Fetch verified experiences and projects
    const experiences = await Experience.find({ user: userId });
    const projects = await Project.find({ user: userId });
    const feedbacks = await Feedback.find({ professional: userId });

    const verifiedExperiences = experiences.filter(
      (e) => e.verificationStatus === "verified"
    );
    const verifiedProjects = projects.filter(
      (p) => p.verificationStatus === "verified"
    );

    // Profile completeness score (0-25)
    let completenessScore = 0;
    if (profile.headline && profile.headline.trim()) completenessScore += 5;
    if (profile.bio && profile.bio.trim().length > 30) completenessScore += 5;
    if (profile.skills && profile.skills.length >= 3) completenessScore += 5;
    if (profile.education && profile.education.length >= 1) completenessScore += 5;
    if (profile.socialLinks && (profile.socialLinks.github || profile.socialLinks.linkedin))
      completenessScore += 5;

    // Verified Experiences score (0-45)
    const expScore = Math.min(verifiedExperiences.length * 15, 45);

    // Verified Projects score (0-20)
    const projScore = Math.min(verifiedProjects.length * 10, 20);

    // Feedback score (0-10)
    let avgRating = 0;
    let feedbackScore = 0;
    if (feedbacks.length > 0) {
      const sum = feedbacks.reduce((acc, f) => acc + (f.rating || 0), 0);
      avgRating = Number((sum / feedbacks.length).toFixed(1));
      feedbackScore = Math.round((avgRating / 5) * 10);
    } else {
      // Default neutral feedback if unrated
      feedbackScore = verifiedExperiences.length > 0 ? 5 : 0;
    }

    const totalScore = Math.min(
      Math.max(completenessScore + expScore + projScore + feedbackScore, 10),
      100
    );

    // Determine tier
    let tier = "Unverified";
    if (totalScore >= 80) tier = "Elite Talent";
    else if (totalScore >= 60) tier = "Verified Pro";
    else if (totalScore >= 30) tier = "Emerging";

    // Reliability index (e.g. 70 - 99%)
    let reliabilityIndex = 75;
    if (verifiedExperiences.length > 0 || verifiedProjects.length > 0) {
      reliabilityIndex = Math.min(
        80 + (verifiedExperiences.length + verifiedProjects.length) * 4 + (avgRating ? (avgRating - 3) * 5 : 0),
        99
      );
    }

    profile.reputation = {
      score: totalScore,
      tier,
      verifiedExperienceCount: verifiedExperiences.length,
      verifiedProjectCount: verifiedProjects.length,
      totalVerifications: verifiedExperiences.length + verifiedProjects.length,
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
