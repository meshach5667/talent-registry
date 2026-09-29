const API_BASE = process.env.NEXT_PUBLIC_API_URL || "/api/v1";

class ApiClient {
  getToken() {
    if (typeof window !== "undefined") {
      return localStorage.getItem("talent_registry_token");
    }
    return null;
  }

  setToken(token) {
    if (typeof window !== "undefined") {
      if (token) {
        localStorage.setItem("talent_registry_token", token);
      } else {
        localStorage.removeItem("talent_registry_token");
      }
    }
  }

  async request(endpoint, options = {}) {
    const token = this.getToken();
    const headers = {
      ...(options.headers || {}),
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    if (!(options.body instanceof FormData)) {
      headers["Content-Type"] = "application/json";
    }

    const config = {
      ...options,
      headers,
    };

    const url = endpoint.startsWith("http") ? endpoint : `${API_BASE}${endpoint}`;

    try {
      const response = await fetch(url, config);
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        if (response.status === 401 && typeof window !== "undefined") {
          // Token expired or invalid
          if (
            !window.location.pathname.startsWith("/auth/") &&
            !window.location.pathname.startsWith("/passport/") &&
            window.location.pathname !== "/"
          ) {
            // Can redirect or clear token
          }
        }
        throw new Error(data.message || `Request failed with status ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error(`[API Error] ${endpoint}:`, error.message);
      throw error;
    }
  }

  // Auth endpoints
  login(email, password) {
    return this.request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  }

  register(userData) {
    return this.request("/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    });
  }


  exchangeGithubCode(code) {
    return this.request("/auth/github/exchange", {
      method: "POST",
      body: JSON.stringify({ code }),
    });
  }

  getMe() {
    return this.request("/auth/me");
  }

  uploadProfilePhoto(file) {
    const formData = new FormData();
    formData.append("photo", file);
    return this.request("/auth/photo", {
      method: "POST",
      body: formData,
    });
  }

  deleteProfilePhoto() {
    return this.request("/auth/photo", {
      method: "DELETE",
    });
  }

  // Profile endpoints
  getPublicPassport(slug) {
    return this.request(`/profiles/passport/${slug}`);
  }

  getMyProfile() {
    return this.request("/profiles/me");
  }

  updateProfile(profileData) {
    return this.request("/profiles/me", {
      method: "PUT",
      body: JSON.stringify(profileData),
    });
  }

  searchProfiles(params = {}) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== "") {
        searchParams.append(key, val);
      }
    });
    return this.request(`/profiles/search?${searchParams.toString()}`);
  }

  getSpotlight() {
    return this.request("/profiles/spotlight");
  }

  // Experience endpoints
  addExperience(data) {
    return this.request("/experiences", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  updateExperience(id, data) {
    return this.request(`/experiences/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  deleteExperience(id) {
    return this.request(`/experiences/${id}`, {
      method: "DELETE",
    });
  }

  // Project endpoints
  addProject(data) {
    return this.request("/projects", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  updateProject(id, data) {
    return this.request(`/projects/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  deleteProject(id) {
    return this.request(`/projects/${id}`, {
      method: "DELETE",
    });
  }

  // Verification endpoints
  requestVerification(data) {
    return this.request("/verifications/request", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  getVerificationByToken(token) {
    return this.request(`/verifications/review/${token}`);
  }

  submitVerificationDecision(token, decisionData) {
    return this.request(`/verifications/review/${token}`, {
      method: "POST",
      body: JSON.stringify(decisionData),
    });
  }

  getMyVerifications() {
    return this.request("/verifications/list");
  }

  resendVerification(id) {
    return this.request(`/verifications/${id}/resend`, {
      method: "POST",
    });
  }

  // Organization endpoints
  getOrganizations(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/organizations?${query}`);
  }

  getOrganization(idOrSlug) {
    return this.request(`/organizations/${idOrSlug}`);
  }

  updateOrganization(id, data) {
    return this.request(`/organizations/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  uploadOrgLogo(id, file) {
    const formData = new FormData();
    formData.append("logo", file);
    return this.request(`/organizations/${id}/logo`, {
      method: "POST",
      body: formData,
    });
  }

  getOrganizationDashboard(id) {
    return this.request(`/organizations/${id}/dashboard`);
  }

  // Feedback endpoints
  submitFeedback(data) {
    return this.request("/feedbacks", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  getUserFeedbacks(userId) {
    return this.request(`/feedbacks/user/${userId}`);
  }

  // Contact endpoints
  sendContactInquiry(data) {
    return this.request("/contacts", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  getContactRequests() {
    return this.request("/contacts");
  }

  respondToContact(id, status, responseMessage = "") {
    return this.request(`/contacts/${id}/respond`, {
      method: "PUT",
      body: JSON.stringify({ status, responseMessage }),
    });
  }

  // Notification endpoints
  getNotifications() {
    return this.request("/notifications");
  }

  markNotificationRead(id) {
    return this.request(`/notifications/${id}/read`, {
      method: "PUT",
    });
  }

  markAllNotificationsRead() {
    return this.request("/notifications/read-all", {
      method: "PUT",
    });
  }

  // Admin endpoints
  getAdminOverview() {
    return this.request("/admin/overview");
  }

  getAdminUsers(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/admin/users?${query}`);
  }

  updateUserStatus(id, status) {
    return this.request(`/admin/users/${id}/status`, {
      method: "PUT",
      body: JSON.stringify({ status }),
    });
  }

  toggleOrganizationVerification(id, verified) {
    return this.request(`/admin/organizations/${id}/verify`, {
      method: "PUT",
      body: JSON.stringify({ verified }),
    });
  }

  getDisputes() {
    return this.request("/admin/disputes");
  }

  resolveDispute(id, status, resolutionNotes) {
    return this.request(`/admin/disputes/${id}`, {
      method: "PUT",
      body: JSON.stringify({ status, resolutionNotes }),
    });
  }

  fileDispute(data) {
    return this.request("/admin/disputes", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  getAuditLogs(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/admin/audit-logs?${query}`);
  }
}

export const api = new ApiClient();
export default api;
