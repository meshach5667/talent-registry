const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

const User = require("../models/User");
const Organization = require("../models/Organization");
const Profile = require("../models/Profile");
const Experience = require("../models/Experience");
const Project = require("../models/Project");
const VerificationRequest = require("../models/VerificationRequest");
const Feedback = require("../models/Feedback");
const ContactRequest = require("../models/ContactRequest");
const Notification = require("../models/Notification");
const AuditLog = require("../models/AuditLog");
const Dispute = require("../models/Dispute");
const { updateReputationScore } = require("../services/reputation.service");

async function seedDatabase() {
  try {
    await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/talent_registry"
    );
    console.log("[Seeder] Connected to MongoDB.");

    // Clear existing collections
    await User.deleteMany({});
    await Organization.deleteMany({});
    await Profile.deleteMany({});
    await Experience.deleteMany({});
    await Project.deleteMany({});
    await VerificationRequest.deleteMany({});
    await Feedback.deleteMany({});
    await ContactRequest.deleteMany({});
    await Notification.deleteMany({});
    await AuditLog.deleteMany({});
    await Dispute.deleteMany({});
    console.log("[Seeder] Cleared old data.");

    // 1. Create Admin User
    const adminUser = await User.create({
      name: "Amara Okafor",
      email: "admin@talentregistry.africa",
      password: "password123",
      role: "admin",
      country: "Nigeria",
      city: "Abuja",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80",
      status: "active",
    });

    // 2. Create Organizations
    const orgPaystack = await Organization.create({
      name: "Paystack",
      slug: "paystack",
      logo: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=200&auto=format&fit=crop&q=80",
      website: "https://paystack.com",
      industry: "Fintech",
      country: "Nigeria",
      city: "Lagos",
      description: "Modern payment infrastructure enabling businesses across Africa to accept payments.",
      workEmailDomain: "paystack.com",
      verified: true,
      verifiedAt: new Date("2024-01-15"),
    });

    const orgFlutterwave = await Organization.create({
      name: "Flutterwave",
      slug: "flutterwave",
      logo: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&auto=format&fit=crop&q=80",
      website: "https://flutterwave.com",
      industry: "Fintech",
      country: "Nigeria",
      city: "Lagos",
      description: "Endless possibilities for African commerce with unified global payments.",
      workEmailDomain: "flutterwavego.com",
      verified: true,
      verifiedAt: new Date("2024-02-10"),
    });

    const orgSafaricom = await Organization.create({
      name: "Safaricom PLC",
      slug: "safaricom",
      logo: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=200&auto=format&fit=crop&q=80",
      website: "https://safaricom.co.ke",
      industry: "Telecommunications",
      country: "Kenya",
      city: "Nairobi",
      description: "Leading mobile communications and fintech provider, pioneer of M-PESA mobile money.",
      workEmailDomain: "safaricom.co.ke",
      verified: true,
      verifiedAt: new Date("2024-01-20"),
    });

    const orgAndela = await Organization.create({
      name: "Andela",
      slug: "andela",
      logo: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=200&auto=format&fit=crop&q=80",
      website: "https://andela.com",
      industry: "Software Engineering",
      country: "Nigeria",
      city: "Lagos",
      description: "Global talent network connecting world-class engineers from emerging markets with companies.",
      workEmailDomain: "andela.com",
      verified: true,
      verifiedAt: new Date("2024-03-01"),
    });

    const orgYoco = await Organization.create({
      name: "Yoco",
      slug: "yoco",
      logo: "https://images.unsplash.com/photo-1556742049-0a67e55722c6?w=200&auto=format&fit=crop&q=80",
      website: "https://yoco.com",
      industry: "Fintech",
      country: "South Africa",
      city: "Cape Town",
      description: "Financial technology company helping small businesses in South Africa get paid and grow.",
      workEmailDomain: "yoco.com",
      verified: true,
      verifiedAt: new Date("2024-04-12"),
    });

    // 3. Create Employer Users
    const employerTunde = await User.create({
      name: "Tunde Adebayo",
      email: "tunde@paystack.com",
      password: "password123",
      role: "employer",
      country: "Nigeria",
      city: "Lagos",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80",
      organization: orgPaystack._id,
      status: "active",
    });
    orgPaystack.adminUser = employerTunde._id;
    orgPaystack.members.push({ user: employerTunde._id, role: "owner" });
    await orgPaystack.save();

    const employerSarah = await User.create({
      name: "Sarah Mwangi",
      email: "sarah@safaricom.co.ke",
      password: "password123",
      role: "employer",
      country: "Kenya",
      city: "Nairobi",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80",
      organization: orgSafaricom._id,
      status: "active",
    });
    orgSafaricom.adminUser = employerSarah._id;
    orgSafaricom.members.push({ user: employerSarah._id, role: "owner" });
    await orgSafaricom.save();

    const employerKofi = await User.create({
      name: "Kofi Boateng",
      email: "kofi@flutterwave.com",
      password: "password123",
      role: "employer",
      country: "Ghana",
      city: "Accra",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80",
      organization: orgFlutterwave._id,
      status: "active",
    });
    orgFlutterwave.adminUser = employerKofi._id;
    orgFlutterwave.members.push({ user: employerKofi._id, role: "owner" });
    await orgFlutterwave.save();

    // 4. Create Professionals & Profiles
    // Professional 1: Kwame Mensah (Elite Talent, Ghana)
    const userKwame = await User.create({
      name: "Kwame Mensah",
      email: "kwame.mensah@talentregistry.africa",
      password: "password123",
      role: "professional",
      country: "Ghana",
      city: "Accra",
      avatar: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&auto=format&fit=crop&q=80",
      status: "active",
    });

    const profileKwame = await Profile.create({
      user: userKwame._id,
      passportSlug: "kwame-mensah",
      headline: "Principal Distributed Systems Architect | High-Throughput Fintech",
      profession: "Distributed Systems Engineer",
      yearsOfExperience: 8,
      country: "Ghana",
      city: "Accra",
      bio: "8+ years engineering low-latency distributed payment gateways and ledger reconciliation pipelines handling over $40M daily volume across West Africa. Passionate about fault-tolerant systems, Go, Kubernetes, and event sourcing architecture.",
      skills: [
        { name: "Go (Golang)", category: "Backend", verifiedCount: 3 },
        { name: "Distributed Systems", category: "Architecture", verifiedCount: 2 },
        { name: "PostgreSQL & CockroachDB", category: "Database", verifiedCount: 2 },
        { name: "Kafka & Event Sourcing", category: "Infrastructure", verifiedCount: 2 },
        { name: "Kubernetes / AWS", category: "Cloud & DevOps", verifiedCount: 1 },
      ],
      languages: ["English (Native)", "French (Conversational)", "Twi (Fluent)"],
      socialLinks: {
        github: "https://github.com",
        linkedin: "https://linkedin.com",
        portfolio: "https://kwamemensah.dev",
      },
      education: [
        {
          institution: "Kwame Nkrumah University of Science and Technology (KNUST)",
          degree: "B.Sc. Computer Engineering",
          fieldOfStudy: "Computer Systems Engineering",
          startYear: 2012,
          endYear: 2016,
          verified: true,
          verifiedBy: "KNUST Registrar",
        },
      ],
      certifications: [
        {
          title: "AWS Certified Solutions Architect – Professional",
          issuer: "Amazon Web Services",
          issueDate: new Date("2023-04-10"),
          credentialId: "AWS-PSA-994821",
          verified: true,
        },
      ],
      availability: {
        status: "open_to_offers",
        hourlyRate: 85,
        currency: "USD",
        remoteOnly: true,
      },
      passportViews: 142,
    });

    // Kwame's Experiences
    const kwameExp1 = await Experience.create({
      user: userKwame._id,
      title: "Lead Infrastructure Architect",
      company: "Paystack",
      organization: orgPaystack._id,
      location: "Lagos / Remote",
      locationType: "remote",
      employmentType: "full-time",
      startDate: new Date("2021-03-01"),
      isCurrent: true,
      description: "Spearheaded core multi-region transaction routing engine, achieving 99.995% uptime and reducing P99 latency by 42%. Mentored 12 backend engineers across Lagos, Nairobi and Accra.",
      skillsUsed: ["Go", "Kafka", "PostgreSQL", "Docker", "Terraform"],
      verificationStatus: "verified",
      verifiedBy: {
        verifierUser: employerTunde._id,
        verifierName: "Tunde Adebayo",
        verifierEmail: "tunde@paystack.com",
        verifierRole: "VP of Engineering",
        verifierOrganization: "Paystack",
        verifiedAt: new Date("2023-01-15"),
        verificationNotes: "Kwame led the core transaction routing overhaul with exemplary precision. His architecture handled Black Friday surges flawlessly without downtime.",
        verificationReferenceCode: "VER-EXP-PAYSTACK-KM21",
      },
    });

    const kwameExp2 = await Experience.create({
      user: userKwame._id,
      title: "Senior Backend Engineer",
      company: "Andela",
      organization: orgAndela._id,
      location: "Accra, Ghana",
      locationType: "remote",
      employmentType: "full-time",
      startDate: new Date("2018-05-01"),
      endDate: new Date("2021-02-28"),
      description: "Built scalable microservices for enterprise fintech partners in the US and Europe. Implemented automated CI/CD pipeline and event-driven data streaming.",
      skillsUsed: ["Go", "Node.js", "Docker", "RabbitMQ"],
      verificationStatus: "verified",
      verifiedBy: {
        verifierName: "Chiamaka Eze",
        verifierEmail: "talent-ops@andela.com",
        verifierRole: "Senior Technical Program Manager",
        verifierOrganization: "Andela",
        verifiedAt: new Date("2021-03-10"),
        verificationNotes: "Verified employment, role, and positive tenure record at Andela.",
        verificationReferenceCode: "VER-EXP-ANDELA-902",
      },
    });

    // Kwame's Projects
    const kwameProj1 = await Project.create({
      user: userKwame._id,
      title: "Sub-Second Multi-Currency Settlement Engine",
      description: "Engineered distributed settlement consensus pipeline reconciling inter-bank mobile money and card transactions across 4 African central banking rails in near real-time.",
      role: "Principal Architect",
      clientOrCompany: "Paystack",
      organization: orgPaystack._id,
      projectUrl: "https://paystack.com",
      technologies: ["Go", "gRPC", "Kafka", "PostgreSQL", "Redis"],
      startDate: new Date("2022-01-10"),
      endDate: new Date("2023-08-30"),
      metrics: "Reconciles 2.4M transactions daily with zero balance drift.",
      verificationStatus: "verified",
      verifiedBy: {
        verifierUser: employerTunde._id,
        verifierName: "Tunde Adebayo",
        verifierEmail: "tunde@paystack.com",
        verifierRole: "VP of Engineering",
        verifierOrganization: "Paystack",
        verifiedAt: new Date("2023-09-02"),
        verificationNotes: "Directly verified. The settlement engine is currently powering live production volume.",
        verificationReferenceCode: "VER-PRJ-SETTLE-883",
      },
    });

    // Kwame's Feedback
    await Feedback.create({
      professional: userKwame._id,
      author: employerTunde._id,
      organization: orgPaystack._id,
      experience: kwameExp1._id,
      rating: 5,
      technicalCompetence: 5,
      communication: 5,
      reliability: 5,
      review: "Kwame is one of the most thorough and dependable systems architects I have worked with across the continent. When critical production services were stressed during peak seasonal events, his failover patterns held gracefully. He sets the gold standard for verified engineering claims.",
      relationship: "Direct Manager",
      isVerifiedEmployer: true,
    });

    await updateReputationScore(userKwame._id);

    // Professional 2: Wanjiru Kamau (Kenya, Cloud & DevOps)
    const userWanjiru = await User.create({
      name: "Wanjiru Kamau",
      email: "wanjiru.kamau@talentregistry.africa",
      password: "password123",
      role: "professional",
      country: "Kenya",
      city: "Nairobi",
      avatar: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=400&auto=format&fit=crop&q=80",
      status: "active",
    });

    const profileWanjiru = await Profile.create({
      user: userWanjiru._id,
      passportSlug: "wanjiru-kamau",
      headline: "Senior Cloud & Site Reliability Engineer | Kubernetes & FinOps",
      profession: "DevOps & Cloud Architect",
      yearsOfExperience: 6,
      country: "Kenya",
      city: "Nairobi",
      bio: "Site reliability and infrastructure automation engineer focusing on mission-critical mobile money and banking workloads. Proven track record in multi-cloud migration, Kubernetes clusters management, and zero-downtime rollouts.",
      skills: [
        { name: "Kubernetes (EKS/GKE)", category: "DevOps", verifiedCount: 2 },
        { name: "Terraform & IaC", category: "DevOps", verifiedCount: 2 },
        { name: "AWS & GCP", category: "Cloud", verifiedCount: 2 },
        { name: "Prometheus & Grafana", category: "Observability", verifiedCount: 1 },
        { name: "Python / Bash", category: "Scripting", verifiedCount: 1 },
      ],
      education: [
        {
          institution: "University of Nairobi",
          degree: "B.Sc. Computer Science",
          startYear: 2014,
          endYear: 2018,
          verified: true,
        },
      ],
      availability: {
        status: "available",
        hourlyRate: 75,
        currency: "USD",
        remoteOnly: false,
      },
    });

    const wanjiruExp1 = await Experience.create({
      user: userWanjiru._id,
      title: "Senior Site Reliability Engineer",
      company: "Safaricom PLC",
      organization: orgSafaricom._id,
      location: "Nairobi, Kenya",
      locationType: "hybrid",
      employmentType: "full-time",
      startDate: new Date("2020-08-01"),
      isCurrent: true,
      description: "Managing Kubernetes clusters handling M-PESA API gateway requests. Implemented GitOps using ArgoCD and automated incident alerting.",
      skillsUsed: ["Kubernetes", "AWS", "ArgoCD", "Terraform", "Prometheus"],
      verificationStatus: "verified",
      verifiedBy: {
        verifierUser: employerSarah._id,
        verifierName: "Sarah Mwangi",
        verifierEmail: "sarah@safaricom.co.ke",
        verifierRole: "Engineering Manager",
        verifierOrganization: "Safaricom PLC",
        verifiedAt: new Date("2023-04-18"),
        verificationNotes: "Confirmed employment and leadership of our SRE modernization initiatives.",
        verificationReferenceCode: "VER-EXP-SAF-WK20",
      },
    });

    await Feedback.create({
      professional: userWanjiru._id,
      author: employerSarah._id,
      organization: orgSafaricom._id,
      experience: wanjiruExp1._id,
      rating: 5,
      technicalCompetence: 5,
      communication: 5,
      reliability: 5,
      review: "Wanjiru transformed our infrastructure monitoring posture. Her calm decision making during incident triage and proactive capacity forecasting saved thousands in cloud spend while raising availability.",
      relationship: "Direct Manager",
      isVerifiedEmployer: true,
    });

    await updateReputationScore(userWanjiru._id);

    // Professional 3: Chidi Anozie (Nigeria, Frontend Architect)
    const userChidi = await User.create({
      name: "Chidi Anozie",
      email: "chidi.anozie@talentregistry.africa",
      password: "password123",
      role: "professional",
      country: "Nigeria",
      city: "Lagos",
      avatar: "https://images.unsplash.com/photo-1522529599102-193c0d76b5b6?w=400&auto=format&fit=crop&q=80",
      status: "active",
    });

    await Profile.create({
      user: userChidi._id,
      passportSlug: "chidi-anozie",
      headline: "Staff Frontend Architect | Design Systems & Web Performance",
      profession: "Frontend Engineer",
      yearsOfExperience: 7,
      country: "Nigeria",
      city: "Lagos",
      bio: "Crafting bulletproof, accessible web applications and multi-brand design systems for hyper-growth African startups. Core contributor to open-source UI libraries.",
      skills: [
        { name: "React & Next.js", category: "Frontend", verifiedCount: 2 },
        { name: "TypeScript", category: "Languages", verifiedCount: 2 },
        { name: "Design Systems & Tailwind", category: "UI/UX", verifiedCount: 2 },
        { name: "Web Performance & Core Web Vitals", category: "Performance", verifiedCount: 1 },
      ],
      availability: {
        status: "open_to_offers",
        hourlyRate: 70,
        currency: "USD",
        remoteOnly: true,
      },
    });

    const chidiExp1 = await Experience.create({
      user: userChidi._id,
      title: "Senior Design Systems Engineer",
      company: "Flutterwave",
      organization: orgFlutterwave._id,
      location: "Lagos, Nigeria",
      locationType: "remote",
      employmentType: "full-time",
      startDate: new Date("2021-06-01"),
      endDate: new Date("2023-12-31"),
      description: "Built the unified design component library adopted by 28 engineering teams across Flutterwave checkout, dashboard, and mobile web experiences.",
      skillsUsed: ["React", "TypeScript", "Tailwind CSS", "Storybook"],
      verificationStatus: "verified",
      verifiedBy: {
        verifierUser: employerKofi._id,
        verifierName: "Kofi Boateng",
        verifierEmail: "kofi@flutterwave.com",
        verifierRole: "Head of Talent & Engineering Operations",
        verifierOrganization: "Flutterwave",
        verifiedAt: new Date("2024-01-10"),
        verificationNotes: "Verified. Chidi built foundational UI systems that sped up engineering delivery company-wide.",
        verificationReferenceCode: "VER-EXP-FLW-CA21",
      },
    });

    // Unverified experience to show contrast!
    await Experience.create({
      user: userChidi._id,
      title: "Freelance UI Specialist",
      company: "Independent Consultancy",
      location: "Lagos, Nigeria",
      locationType: "remote",
      employmentType: "freelance",
      startDate: new Date("2017-01-01"),
      endDate: new Date("2019-12-31"),
      description: "Delivered customized web interfaces for regional e-commerce stores.",
      skillsUsed: ["JavaScript", "HTML/CSS"],
      verificationStatus: "unverified",
    });

    await updateReputationScore(userChidi._id);

    // Professional 4: Zainab Al-Mansoor (Egypt, AI & Data Science)
    const userZainab = await User.create({
      name: "Zainab Al-Mansoor",
      email: "zainab.mansoor@talentregistry.africa",
      password: "password123",
      role: "professional",
      country: "Egypt",
      city: "Cairo",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80",
      status: "active",
    });

    await Profile.create({
      user: userZainab._id,
      passportSlug: "zainab-al-mansoor",
      headline: "Principal Machine Learning Engineer | Fraud Prevention & NLP",
      profession: "Machine Learning Engineer",
      yearsOfExperience: 6,
      country: "Egypt",
      city: "Cairo",
      bio: "Specializing in real-time fraud detection algorithms, graph neural networks for transaction monitoring, and Arabic/English NLP systems.",
      skills: [
        { name: "Python & PyTorch", category: "AI/ML", verifiedCount: 2 },
        { name: "Graph Neural Networks", category: "AI/ML", verifiedCount: 1 },
        { name: "MLOps & Kubeflow", category: "MLOps", verifiedCount: 1 },
        { name: "Feature Store & Feast", category: "Data", verifiedCount: 1 },
      ],
      availability: {
        status: "open_to_offers",
        hourlyRate: 90,
        currency: "USD",
        remoteOnly: true,
      },
    });

    await Experience.create({
      user: userZainab._id,
      title: "Lead AI Researcher",
      company: "Cairo AI Labs / Fintech Nexus",
      location: "Cairo, Egypt",
      locationType: "hybrid",
      employmentType: "full-time",
      startDate: new Date("2021-01-15"),
      isCurrent: true,
      description: "Deployed anomaly detection neural networks flagging financial illicit flows with 98.4% precision.",
      skillsUsed: ["Python", "PyTorch", "FastAPI", "Docker"],
      verificationStatus: "verified",
      verifiedBy: {
        verifierName: "Dr. Hesham Talaat",
        verifierEmail: "hesham.t@fintechnexus.eg",
        verifierRole: "Chief Research Scientist",
        verifierOrganization: "Fintech Nexus Egypt",
        verifiedAt: new Date("2023-05-11"),
        verificationNotes: "Verified research leadership and state-of-the-art fraud model deployments.",
        verificationReferenceCode: "VER-EXP-EGY-ZM21",
      },
    });

    await updateReputationScore(userZainab._id);

    // Professional 5: Thabo Mthembu (South Africa, Fullstack Fintech)
    const userThabo = await User.create({
      name: "Thabo Mthembu",
      email: "thabo.mthembu@talentregistry.africa",
      password: "password123",
      role: "professional",
      country: "South Africa",
      city: "Cape Town",
      avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&auto=format&fit=crop&q=80",
      status: "active",
    });

    await Profile.create({
      user: userThabo._id,
      passportSlug: "thabo-mthembu",
      headline: "Senior Fullstack Engineer | React Native & Node.js",
      profession: "Full Stack Engineer",
      yearsOfExperience: 5,
      country: "South Africa",
      city: "Cape Town",
      bio: "Fintech builder creating intuitive POS interfaces, merchant portals, and payment integrations. Passionate about empowering SMBs with modern software tools.",
      skills: [
        { name: "TypeScript", category: "Languages", verifiedCount: 1 },
        { name: "React Native", category: "Mobile", verifiedCount: 1 },
        { name: "Node.js & Express", category: "Backend", verifiedCount: 1 },
        { name: "GraphQL", category: "API", verifiedCount: 1 },
      ],
      availability: {
        status: "available",
        hourlyRate: 65,
        currency: "USD",
        remoteOnly: false,
      },
    });

    const thaboExp1 = await Experience.create({
      user: userThabo._id,
      title: "Senior Mobile Engineer",
      company: "Yoco",
      organization: orgYoco._id,
      location: "Cape Town, South Africa",
      locationType: "hybrid",
      employmentType: "full-time",
      startDate: new Date("2022-02-01"),
      isCurrent: true,
      description: "Co-developed modern POS companion app enabling offline card capture and merchant business analytics.",
      skillsUsed: ["React Native", "TypeScript", "Redux", "Bluetooth BLE"],
      verificationStatus: "verified",
      verifiedBy: {
        verifierName: "Jacques Van Der Merwe",
        verifierEmail: "jacques@yoco.com",
        verifierRole: "Director of Mobile Engineering",
        verifierOrganization: "Yoco",
        verifiedAt: new Date("2023-11-20"),
        verificationNotes: "Confirmed employment and crucial contributions to our point-of-sale mobile products.",
        verificationReferenceCode: "VER-EXP-YOCO-TM22",
      },
    });

    await updateReputationScore(userThabo._id);

    // Professional 6: Amina Diallo (Senegal, with PENDING verification request ready to test!)
    const userAmina = await User.create({
      name: "Amina Diallo",
      email: "amina.diallo@talentregistry.africa",
      password: "password123",
      role: "professional",
      country: "Senegal",
      city: "Dakar",
      avatar: "https://images.unsplash.com/photo-1534751516642-a1714f5a5b51?w=400&auto=format&fit=crop&q=80",
      status: "active",
    });

    await Profile.create({
      user: userAmina._id,
      passportSlug: "amina-diallo",
      headline: "Cybersecurity Analyst & Systems Auditor",
      profession: "Security Engineer",
      yearsOfExperience: 4,
      country: "Senegal",
      city: "Dakar",
      bio: "Focusing on ISO 27001, PCI-DSS compliance audits, penetration testing, and zero-trust cloud network architecture across West Africa.",
      skills: [
        { name: "Penetration Testing", category: "Security" },
        { name: "PCI-DSS Compliance", category: "Compliance" },
        { name: "Cloud Security", category: "Cloud" },
      ],
      availability: {
        status: "available",
        hourlyRate: 80,
        currency: "USD",
        remoteOnly: true,
      },
    });

    const aminaExp = await Experience.create({
      user: userAmina._id,
      title: "Security Consultant (Contract)",
      company: "Paystack",
      organization: orgPaystack._id,
      location: "Dakar / Remote",
      locationType: "remote",
      employmentType: "contract",
      startDate: new Date("2023-05-01"),
      endDate: new Date("2023-11-30"),
      description: "Conducted external application security audits, vulnerability scans, and remediation roadmap for partner payment plugins.",
      skillsUsed: ["Burp Suite", "OWASP", "Vulnerability Management"],
      verificationStatus: "pending",
    });

    // Create a pending verification request from Amina to Paystack (Tunde Adebayo)
    const aminaVerification = await VerificationRequest.create({
      type: "experience",
      professional: userAmina._id,
      experience: aminaExp._id,
      targetOrganization: orgPaystack._id,
      verifierEmail: "tunde@paystack.com",
      verifierName: "Tunde Adebayo",
      verifierTitle: "VP of Engineering",
      token: "demo-verify-token-amina-paystack",
      status: "pending",
      requestMessage: "Hi Tunde, please verify my contract work conducting application security audits on the partner plugins.",
    });

    // Create notification for Tunde
    await Notification.create({
      recipient: employerTunde._id,
      sender: userAmina._id,
      type: "verification_request",
      title: "Verification Request from Amina Diallo",
      message: "Amina Diallo requested you verify her contract experience as Security Consultant at Paystack.",
      actionUrl: `/verification/demo-verify-token-amina-paystack`,
      metadata: { verificationId: aminaVerification._id },
    });

    await updateReputationScore(userAmina._id);

    // 5. Create a sample Contact Request
    await ContactRequest.create({
      professional: userKwame._id,
      employer: employerSarah._id,
      organization: orgSafaricom._id,
      subject: "Principal Architecture Advisory - M-PESA Global Hub",
      message: "Hello Kwame, we reviewed your verified Paystack distributed systems work. Safaricom is building a new cross-border remittance gateway and we would like to invite you for an advisory / contract engagement.",
      roleOffered: "Lead Distributed Systems Advisor",
      engagementType: "consulting",
      budgetRange: "$100 - $120 / hour",
      status: "pending",
    });

    await Notification.create({
      recipient: userKwame._id,
      sender: employerSarah._id,
      type: "contact_request",
      title: "New Opportunity from Safaricom PLC",
      message: "Sarah Mwangi from Safaricom PLC sent you an inquiry: 'Principal Architecture Advisory - M-PESA Global Hub'.",
      actionUrl: "/dashboard",
    });

    // 6. Create sample Audit Logs
    await AuditLog.create({
      user: adminUser._id,
      action: "PLATFORM_INITIALIZED",
      targetType: "System",
      targetId: "0",
      ipAddress: "127.0.0.1",
      details: { version: "1.0.0-MVP", region: "Africa/Pan-African" },
    });

    await AuditLog.create({
      user: employerTunde._id,
      action: "VERIFICATION_APPROVED",
      targetType: "Experience",
      targetId: kwameExp1._id.toString(),
      ipAddress: "102.89.44.12",
      details: { professional: "Kwame Mensah", referenceCode: "VER-EXP-PAYSTACK-KM21" },
    });

    // 7. Create a Sample Dispute to showcase the Admin Dispute Management
    await Dispute.create({
      reporter: employerSarah._id,
      targetType: "profile",
      targetId: "unverified-bad-actor-id",
      targetTitle: "Suspected Duplicate Profile",
      reportedUser: userThabo._id,
      reason: "False Role Claim",
      details: "A profile was reported claiming a Senior Director title without verifiable org affiliation.",
      evidenceLinks: ["https://example.com/evidence1"],
      status: "open",
    });

    console.log("[Seeder] Successfully seeded database with rich African talent profiles, verified experiences, organizations, verifications, feedback, and audit logs!");
    process.exit(0);
  } catch (error) {
    console.error("[Seeder Error]", error);
    process.exit(1);
  }
}

seedDatabase();
