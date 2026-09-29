const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

const User = require("../models/User");
const Organization = require("../models/Organization");
const Profile = require("../models/Profile");
const Experience = require("../models/Experience");
const Project = require("../models/Project");
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
    // Professional 1: Kwame Mensah (Ghana)
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
        { name: "Go (Golang)", category: "Backend" },
        { name: "Distributed Systems", category: "Architecture" },
        { name: "PostgreSQL & CockroachDB", category: "Database" },
        { name: "Kafka & Event Sourcing", category: "Infrastructure" },
        { name: "Kubernetes / AWS", category: "Cloud & DevOps" },
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
        },
      ],
      certifications: [
        {
          title: "AWS Certified Solutions Architect – Professional",
          issuer: "Amazon Web Services",
          issueDate: new Date("2023-04-10"),
          credentialId: "AWS-PSA-994821",
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

    // Kwame's Experiences (Work History)
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
      projectUrl: "https://paystack.com",
      link: "https://paystack.com",
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
      projectUrl: "https://andela.com",
      link: "https://andela.com",
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
    });

    // Kwame's Client Feedback & Ratings
    await Feedback.create({
      professional: userKwame._id,
      author: employerTunde._id,
      organization: orgPaystack._id,
      experience: kwameExp1._id,
      rating: 5,
      technicalCompetence: 5,
      communication: 5,
      reliability: 5,
      review: "Kwame is one of the most thorough and dependable systems architects I have worked with across the continent. When critical production services were stressed during peak seasonal events, his failover patterns held gracefully.",
      relationship: "Direct Manager",
      isVerifiedEmployer: true,
    });

    // Create a confirmed engagement for Kwame
    await ContactRequest.create({
      professional: userKwame._id,
      employer: employerSarah._id,
      organization: orgSafaricom._id,
      subject: "Principal Architecture Advisory - M-PESA Global Hub",
      message: "Hello Kwame, we reviewed your Paystack distributed systems work. Safaricom is building a new cross-border remittance gateway and we would like to invite you for an advisory engagement.",
      roleOffered: "Lead Distributed Systems Advisor",
      engagementType: "consulting",
      budgetRange: "$100 - $120 / hour",
      status: "accepted",
      responseMessage: "Delighted to collaborate with the Safaricom infrastructure team on the M-PESA Global Hub initiative.",
      respondedAt: new Date("2024-05-15"),
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
        { name: "Kubernetes (EKS/GKE)", category: "DevOps" },
        { name: "Terraform & IaC", category: "DevOps" },
        { name: "AWS & GCP", category: "Cloud" },
        { name: "Prometheus & Grafana", category: "Observability" },
        { name: "Python / Bash", category: "Scripting" },
      ],
      education: [
        {
          institution: "University of Nairobi",
          degree: "B.Sc. Computer Science",
          startYear: 2014,
          endYear: 2018,
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
      projectUrl: "https://safaricom.co.ke",
      link: "https://safaricom.co.ke",
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
        { name: "React & Next.js", category: "Frontend" },
        { name: "TypeScript", category: "Languages" },
        { name: "Design Systems & Tailwind", category: "UI/UX" },
        { name: "Web Performance & Core Web Vitals", category: "Performance" },
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
      projectUrl: "https://flutterwave.com",
      link: "https://flutterwave.com",
    });

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
    });

    await Feedback.create({
      professional: userChidi._id,
      author: employerKofi._id,
      organization: orgFlutterwave._id,
      experience: chidiExp1._id,
      rating: 5,
      technicalCompetence: 5,
      communication: 5,
      reliability: 5,
      review: "Chidi built foundational UI systems that sped up engineering delivery company-wide. Highly recommend his design systems capability.",
      relationship: "Direct Manager",
      isVerifiedEmployer: true,
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
        { name: "Python & PyTorch", category: "AI/ML" },
        { name: "Graph Neural Networks", category: "AI/ML" },
        { name: "MLOps & Kubeflow", category: "MLOps" },
        { name: "Feature Store & Feast", category: "Data" },
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
      projectUrl: "https://github.com",
      link: "https://github.com",
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
        { name: "TypeScript", category: "Languages" },
        { name: "React Native", category: "Mobile" },
        { name: "Node.js & Express", category: "Backend" },
        { name: "GraphQL", category: "API" },
      ],
      availability: {
        status: "available",
        hourlyRate: 65,
        currency: "USD",
        remoteOnly: false,
      },
    });

    await Experience.create({
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
      projectUrl: "https://yoco.com",
      link: "https://yoco.com",
    });

    await updateReputationScore(userThabo._id);

    // Professional 6: Amina Diallo (Senegal)
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
      projectUrl: "https://paystack.com",
      link: "https://paystack.com",
    });

    await Feedback.create({
      professional: userAmina._id,
      author: employerTunde._id,
      organization: orgPaystack._id,
      experience: aminaExp._id,
      rating: 5,
      technicalCompetence: 5,
      communication: 5,
      reliability: 5,
      review: "Amina conducted thorough application security audits on our partner integrations with high professionalism and delivered actionable remediation recommendations.",
      relationship: "Direct Manager",
      isVerifiedEmployer: true,
    });

    await updateReputationScore(userAmina._id);

    // Professional 7: Ngozi Eze (Nigeria, Technical Writer & Content Strategist)
    const userNgozi = await User.create({
      name: "Ngozi Eze",
      email: "ngozi.eze@talentregistry.africa",
      password: "password123",
      role: "professional",
      country: "Nigeria",
      city: "Lagos",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80",
      status: "active",
    });

    await Profile.create({
      user: userNgozi._id,
      passportSlug: "ngozi-eze",
      headline: "Senior Technical Writer & Content Strategist | Developer Documentation & API Guides",
      profession: "Technical Writer & Content Strategist",
      yearsOfExperience: 6,
      country: "Nigeria",
      city: "Lagos",
      bio: "Technical writer and documentation architect with 6+ years designing developer documentation portals, API references, tutorials, and technical content strategies for fintech and SaaS platforms across Africa.",
      skills: [
        { name: "Technical Writing", category: "Writing" },
        { name: "API Documentation", category: "Documentation" },
        { name: "Content Strategy", category: "Strategy" },
        { name: "Markdown & Docs-as-Code", category: "Tooling" },
        { name: "Developer Experience (DX)", category: "Product" },
      ],
      socialLinks: {
        github: "https://github.com",
        linkedin: "https://linkedin.com",
        portfolio: "https://ngozieze.writings.dev",
      },
      availability: {
        status: "available",
        hourlyRate: 65,
        currency: "USD",
        remoteOnly: true,
      },
      passportViews: 110,
    });

    const ngoziExp1 = await Experience.create({
      user: userNgozi._id,
      title: "Lead Technical Writer",
      company: "Paystack",
      organization: orgPaystack._id,
      location: "Lagos / Remote",
      locationType: "remote",
      employmentType: "full-time",
      startDate: new Date("2021-09-01"),
      isCurrent: true,
      description: "Spearheaded complete developer documentation overhaul, API integration quickstarts, and webhook reference guides used by 100,000+ developers.",
      skillsUsed: ["Technical Writing", "API Documentation", "Markdown", "Postman"],
      projectUrl: "https://paystack.com/docs",
      link: "https://paystack.com/docs",
    });

    await Project.create({
      user: userNgozi._id,
      title: "Interactive API Documentation & SDK Quickstart Hub",
      description: "Designed and authored comprehensive interactive API reference, reducing developer onboarding time from 3 days to under 45 minutes.",
      role: "Lead Technical Writer & Content Strategist",
      clientOrCompany: "Paystack",
      organization: orgPaystack._id,
      projectUrl: "https://paystack.com/docs/api",
      technologies: ["OpenAPI", "Markdown", "Swagger", "Postman"],
      startDate: new Date("2022-04-01"),
      endDate: new Date("2023-01-15"),
      metrics: "Over 120,000 monthly active developers, 45% reduction in integration support inquiries.",
    });

    await Feedback.create({
      professional: userNgozi._id,
      author: employerTunde._id,
      organization: orgPaystack._id,
      experience: ngoziExp1._id,
      rating: 5,
      technicalCompetence: 5,
      communication: 5,
      reliability: 5,
      review: "Ngozi bridged the gap between our core infrastructure and external developers brilliantly. Her documentation is clear, accurate, and loved by integration partners.",
      relationship: "Direct Manager",
      isVerifiedEmployer: true,
    });

    await updateReputationScore(userNgozi._id);

    // Professional 8: Farida Omar (Kenya, UI/UX & Product Designer)
    const userFarida = await User.create({
      name: "Farida Omar",
      email: "farida.omar@talentregistry.africa",
      password: "password123",
      role: "professional",
      country: "Kenya",
      city: "Nairobi",
      avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&auto=format&fit=crop&q=80",
      status: "active",
    });

    await Profile.create({
      user: userFarida._id,
      passportSlug: "farida-omar",
      headline: "Lead UI/UX & Product Designer | Fintech, Design Systems & Inclusive UX",
      profession: "UI/UX & Product Designer",
      yearsOfExperience: 5,
      country: "Kenya",
      city: "Nairobi",
      bio: "Human-centered digital product designer specializing in accessible mobile money experiences, design systems, and user research across East Africa.",
      skills: [
        { name: "UI/UX Design", category: "Design" },
        { name: "Figma & Prototyping", category: "Tooling" },
        { name: "Design Systems", category: "Design" },
        { name: "User Research & Usability Testing", category: "Research" },
        { name: "Interaction Design", category: "Design" },
      ],
      socialLinks: {
        linkedin: "https://linkedin.com",
        portfolio: "https://faridaomar.design",
      },
      availability: {
        status: "open_to_offers",
        hourlyRate: 70,
        currency: "USD",
        remoteOnly: true,
      },
      passportViews: 135,
    });

    const faridaExp1 = await Experience.create({
      user: userFarida._id,
      title: "Senior Product Designer",
      company: "Safaricom PLC",
      organization: orgSafaricom._id,
      location: "Nairobi, Kenya",
      locationType: "hybrid",
      employmentType: "full-time",
      startDate: new Date("2021-04-01"),
      isCurrent: true,
      description: "Led end-to-end UX architecture and design system for next-generation mobile merchant and remittance applications.",
      skillsUsed: ["Figma", "UI/UX Design", "User Research", "Prototyping"],
      projectUrl: "https://safaricom.co.ke",
      link: "https://safaricom.co.ke",
    });

    await Project.create({
      user: userFarida._id,
      title: "Mobile Merchant Checkout & Payment Flow Redesign",
      description: "Redesigned merchant payment flow and onboarding flow based on field research with 45 local business owners across Nairobi and Mombasa.",
      role: "Lead Product Designer",
      clientOrCompany: "Safaricom PLC",
      organization: orgSafaricom._id,
      projectUrl: "https://faridaomar.design/m-pesa-merchant",
      technologies: ["Figma", "FigJam", "Miro", "Protopie"],
      startDate: new Date("2022-06-01"),
      endDate: new Date("2023-02-28"),
      metrics: "Increased merchant activation rate from 52% to 86%, reduced transaction abandonment by 33%.",
    });

    await Feedback.create({
      professional: userFarida._id,
      author: employerSarah._id,
      organization: orgSafaricom._id,
      experience: faridaExp1._id,
      rating: 5,
      technicalCompetence: 5,
      communication: 5,
      reliability: 5,
      review: "Farida has exceptional design instincts and empathy for diverse user demographics. Her merchant redesign significantly improved user adoption.",
      relationship: "Direct Manager",
      isVerifiedEmployer: true,
    });

    await updateReputationScore(userFarida._id);

    // 5. Create sample Audit Logs
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
      action: "FEEDBACK_CREATED",
      targetType: "Feedback",
      targetId: kwameExp1._id.toString(),
      ipAddress: "102.89.44.12",
      details: { professional: "Kwame Mensah" },
    });

    // 6. Create a Sample Dispute to showcase Admin Dispute Management
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

    console.log("[Seeder] Successfully seeded database with African talent profiles, work history, organizations, feedback, and audit logs!");
    process.exit(0);
  } catch (error) {
    console.error("[Seeder Error]", error);
    process.exit(1);
  }
}

seedDatabase();
