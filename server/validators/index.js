/**
 * Simple request validator middleware generator
 */
function validate(schemaFn) {
  return (req, res, next) => {
    const errors = schemaFn(req.body);
    if (errors && errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: errors[0],
        errors,
      });
    }
    next();
  };
}

const authValidators = {
  register: validate((body) => {
    const errors = [];
    if (!body.name || body.name.trim().length < 2)
      errors.push("Full name is required (min 2 characters)");
    if (!body.email || !/^\S+@\S+\.\S+$/.test(body.email))
      errors.push("A valid email address is required");
    if (!body.password || body.password.length < 6)
      errors.push("Password must be at least 6 characters");
    if (
      body.role &&
      !["professional", "employer", "admin"].includes(body.role)
    )
      errors.push("Role must be professional, employer, or admin");
    return errors;
  }),
  login: validate((body) => {
    const errors = [];
    if (!body.email) errors.push("Email is required");
    if (!body.password) errors.push("Password is required");
    return errors;
  }),
};

const experienceValidators = {
  create: validate((body) => {
    const errors = [];
    if (!body.title || !body.title.trim()) errors.push("Job title is required");
    if (!body.company || !body.company.trim())
      errors.push("Company name is required");
    if (!body.startDate) errors.push("Start date is required");
    return errors;
  }),
};

const projectValidators = {
  create: validate((body) => {
    const errors = [];
    if (!body.title || !body.title.trim())
      errors.push("Project title is required");
    if (!body.description || !body.description.trim())
      errors.push("Project description is required");
    return errors;
  }),
};

const verificationValidators = {
  request: validate((body) => {
    const errors = [];
    if (!body.type || !["experience", "project"].includes(body.type))
      errors.push("Verification type must be 'experience' or 'project'");
    if (body.type === "experience" && !body.experienceId)
      errors.push("Experience ID is required");
    if (body.type === "project" && !body.projectId)
      errors.push("Project ID is required");
    if (!body.verifierEmail || !/^\S+@\S+\.\S+$/.test(body.verifierEmail))
      errors.push("A valid verifier work email address is required");
    return errors;
  }),
  decision: validate((body) => {
    const errors = [];
    if (!body.status || !["approved", "rejected"].includes(body.status))
      errors.push("Status decision must be 'approved' or 'rejected'");
    return errors;
  }),
};

const contactValidators = {
  create: validate((body) => {
    const errors = [];
    if (!body.professionalId) errors.push("Professional ID is required");
    if (!body.subject || body.subject.trim().length < 3)
      errors.push("Subject must be at least 3 characters");
    if (!body.message || body.message.trim().length < 10)
      errors.push("Message must be at least 10 characters");
    return errors;
  }),
};

module.exports = {
  authValidators,
  experienceValidators,
  projectValidators,
  verificationValidators,
  contactValidators,
};
