import mongoose from "mongoose";
import { env } from "./config/env.js";
import { hashPassword } from "./auth/password.js";
import { User } from "./models/user.model.js";
import { Society } from "./models/society.model.js";
import { Event } from "./models/event.model.js";
import { Recruitment } from "./models/recruitment.model.js";
import { Announcement } from "./models/announcement.model.js";
import { Application } from "./models/application.model.js";

async function seed() {
  console.log("Connecting to MongoDB:", env.MONGODB_URI);
  await mongoose.connect(env.MONGODB_URI);

  console.log("Clearing existing mock data...");
  await Promise.all([
    User.deleteMany({ email: { $in: [
      "sam@example.edu", "acm@example.edu", "robotics@example.edu",
      "dance@example.edu", "music@example.edu", "photo@example.edu",
      "nss@example.edu", "ecell@example.edu", "lit@example.edu",
      "sports@example.edu", "pending@example.edu", "aman@example.edu",
      "priya@example.edu", "rohit@example.edu"
    ] } }),
    Society.deleteMany({ name: { $in: [
      "ACM Student Chapter", "Robotics Club", "Dance Society", "Music Club",
      "Photography Club", "NSS", "Entrepreneurship Cell", "Literary Society", "Sports Club"
    ] } }),
    Event.deleteMany({ title: { $in: [
      "Web Development Workshop", "Hackathon 2026", "Tech Talk: AI in Real World", "DSA Bootcamp"
    ] } }),
    Recruitment.deleteMany({ title: "Recruitment 2026" }),
    Announcement.deleteMany({ title: { $in: [
      "Campus Recruitment Drives Officially Open for Fall 2026", "Annual TechFest Dates Announced"
    ] } }),
  ]);

  const defaultPasswordHash = await hashPassword("password123");

  console.log("Creating users...");
  // 1. Primary Student
  const sam = await User.create({
    accountType: "student",
    email: "sam@example.edu",
    passwordHash: defaultPasswordHash,
    username: "sam.student",
    fullName: "Sam Student",
    batchYear: 2026,
    universityRollNumber: "U2026-00421",
    phoneNumber: "+919876543210",
  });

  // Additional Students for Applications
  const aman = await User.create({
    accountType: "student",
    email: "aman@example.edu",
    passwordHash: defaultPasswordHash,
    username: "aman.kumar",
    fullName: "Aman Kumar",
    batchYear: 2028,
    universityRollNumber: "U2028-0104",
    phoneNumber: "+919876543211",
  });

  const priya = await User.create({
    accountType: "student",
    email: "priya@example.edu",
    passwordHash: defaultPasswordHash,
    username: "priya.singh",
    fullName: "Priya Singh",
    batchYear: 2028,
    universityRollNumber: "U2028-0205",
    phoneNumber: "+919876543212",
  });

  const rohit = await User.create({
    accountType: "student",
    email: "rohit@example.edu",
    passwordHash: defaultPasswordHash,
    username: "rohit.das",
    fullName: "Rohit Das",
    batchYear: 2028,
    universityRollNumber: "U2028-0306",
    phoneNumber: "+919876543213",
  });

  // 2. Clubs
  const acmClub = await User.create({
    accountType: "club",
    email: "acm@example.edu",
    passwordHash: defaultPasswordHash,
    clubName: "ACM Student Chapter",
    foundedYear: 2017,
    approvalStatus: "approved",
    approvedAt: new Date(),
  });

  const roboticsClub = await User.create({
    accountType: "club",
    email: "robotics@example.edu",
    passwordHash: defaultPasswordHash,
    clubName: "Robotics Club",
    foundedYear: 2018,
    approvalStatus: "approved",
    approvedAt: new Date(),
  });

  const danceClub = await User.create({
    accountType: "club",
    email: "dance@example.edu",
    passwordHash: defaultPasswordHash,
    clubName: "Dance Society",
    foundedYear: 2016,
    approvalStatus: "approved",
    approvedAt: new Date(),
  });

  const musicClub = await User.create({
    accountType: "club",
    email: "music@example.edu",
    passwordHash: defaultPasswordHash,
    clubName: "Music Club",
    foundedYear: 2019,
    approvalStatus: "approved",
    approvedAt: new Date(),
  });

  const photoClub = await User.create({
    accountType: "club",
    email: "photo@example.edu",
    passwordHash: defaultPasswordHash,
    clubName: "Photography Club",
    foundedYear: 2018,
    approvalStatus: "approved",
    approvedAt: new Date(),
  });

  const nssClub = await User.create({
    accountType: "club",
    email: "nss@example.edu",
    passwordHash: defaultPasswordHash,
    clubName: "NSS",
    foundedYear: 2015,
    approvalStatus: "approved",
    approvedAt: new Date(),
  });

  const ecellClub = await User.create({
    accountType: "club",
    email: "ecell@example.edu",
    passwordHash: defaultPasswordHash,
    clubName: "Entrepreneurship Cell",
    foundedYear: 2017,
    approvalStatus: "approved",
    approvedAt: new Date(),
  });

  const litClub = await User.create({
    accountType: "club",
    email: "lit@example.edu",
    passwordHash: defaultPasswordHash,
    clubName: "Literary Society",
    foundedYear: 2019,
    approvalStatus: "approved",
    approvedAt: new Date(),
  });

  const sportsClub = await User.create({
    accountType: "club",
    email: "sports@example.edu",
    passwordHash: defaultPasswordHash,
    clubName: "Sports Club",
    foundedYear: 2014,
    approvalStatus: "approved",
    approvedAt: new Date(),
  });

  // Pending club for admin review testing
  await User.create({
    accountType: "club",
    email: "pending@example.edu",
    passwordHash: defaultPasswordHash,
    clubName: "AI Research Guild",
    foundedYear: 2026,
    approvalStatus: "pending",
  });

  console.log("Creating societies...");
  const acmSociety = await Society.create({
    ownerId: acmClub.id,
    name: "ACM Student Chapter",
    foundedYear: 2017,
    category: "Technical",
    tagline: "Advancing Computing as a Science & Profession",
    about: "ACM is a global community of computing professionals. We organize workshops, coding competitions, tech talks, and help students grow in the field of computer science.",
    websiteUrl: "https://acm-campus.org",
    socialLinks: [
      { platform: "Instagram", url: "https://instagram.com/acm_chapter" },
      { platform: "LinkedIn", url: "https://linkedin.com/company/acm-chapter" },
    ],
    team: [
      { name: "Rohan Kumar", role: "President", batchYear: 2025 },
      { name: "Riya Sharma", role: "Vice President & CEO", batchYear: 2025 },
      { name: "Aditya Verma", role: "Tech Lead", batchYear: 2026 },
      { name: "Sneha Patel", role: "Events Head", batchYear: 2026 },
    ],
    memberCountsByYear: [
      { batchYear: 2028, count: 35 },
      { batchYear: 2027, count: 25 },
      { batchYear: 2026, count: 30 },
      { batchYear: 2025, count: 30 },
    ],
    tags: ["Workshops", "Competitions", "Tech Talks", "Hackathons"],
  });

  await Society.create({
    ownerId: roboticsClub.id,
    name: "Robotics Club",
    foundedYear: 2018,
    category: "Technical",
    tagline: "Designing Autonomous Machines & Embedded Systems",
    about: "Dedicated to robotics, IoT, ROS, and hands-on hardware engineering. We build drones, robotic arms, and compete in national robowars.",
    socialLinks: [],
    team: [{ name: "Karan Mehra", role: "Captain", batchYear: 2025 }],
    memberCountsByYear: [{ batchYear: 2028, count: 20 }, { batchYear: 2027, count: 25 }, { batchYear: 2026, count: 25 }, { batchYear: 2025, count: 15 }],
    tags: ["Hardware", "IoT", "RoboWars", "Drones"],
  });

  await Society.create({
    ownerId: danceClub.id,
    name: "Dance Society",
    foundedYear: 2016,
    category: "Cultural",
    tagline: "Expression through Rhythm, Beats & Soul",
    about: "The official collegiate western and classical dance society, showcasing award-winning choreography across university fests.",
    socialLinks: [],
    team: [{ name: "Ananya Roy", role: "President", batchYear: 2025 }],
    memberCountsByYear: [{ batchYear: 2028, count: 30 }, { batchYear: 2027, count: 30 }, { batchYear: 2026, count: 20 }, { batchYear: 2025, count: 15 }],
    tags: ["HipHop", "Contemporary", "Choreography"],
  });

  await Society.create({
    ownerId: musicClub.id,
    name: "Music Club",
    foundedYear: 2019,
    category: "Cultural",
    tagline: "Harmony, Acoustics, and Electrifying Bands",
    about: "Uniting vocalists, guitarists, drummers, and sound producers to make memorable campus symphonies and rock nights.",
    socialLinks: [],
    team: [{ name: "Tanmay Bhatt", role: "Lead" }],
    memberCountsByYear: [{ batchYear: 2028, count: 15 }, { batchYear: 2027, count: 15 }, { batchYear: 2026, count: 20 }, { batchYear: 2025, count: 10 }],
    tags: ["Vocals", "Instrumental", "Acoustic"],
  });

  await Society.create({
    ownerId: photoClub.id,
    name: "Photography Club",
    foundedYear: 2018,
    category: "Other",
    tagline: "Capturing Timeless Campus Moments",
    about: "Dedicated to visual storytelling, digital photography, cinematography, and post-processing workshops.",
    socialLinks: [],
    team: [{ name: "Dhruv Kapoor", role: "Lead" }],
    memberCountsByYear: [{ batchYear: 2028, count: 25 }, { batchYear: 2027, count: 20 }, { batchYear: 2026, count: 15 }, { batchYear: 2025, count: 10 }],
    tags: ["Shutter", "Portraits", "Videography"],
  });

  await Society.create({
    ownerId: nssClub.id,
    name: "NSS",
    foundedYear: 2015,
    category: "Social",
    tagline: "Not Me, But You - Selfless Community Service",
    about: "National Service Scheme chapter organizing blood donation drives, educational outreach, and green campus sustainability campaigns.",
    socialLinks: [],
    team: [{ name: "Pooja Nair", role: "Secretary" }],
    memberCountsByYear: [{ batchYear: 2028, count: 50 }, { batchYear: 2027, count: 40 }, { batchYear: 2026, count: 35 }, { batchYear: 2025, count: 25 }],
    tags: ["Service", "Community", "BloodDonation"],
  });

  await Society.create({
    ownerId: ecellClub.id,
    name: "Entrepreneurship Cell",
    foundedYear: 2017,
    category: "Startup",
    tagline: "Igniting Ideas, Fostering Founders & Startups",
    about: "Building a vibrant startup culture on campus through pitch competitions, angel investor connects, and founder incubation.",
    socialLinks: [],
    team: [{ name: "Samar Joshi", role: "Head" }],
    memberCountsByYear: [{ batchYear: 2028, count: 30 }, { batchYear: 2027, count: 35 }, { batchYear: 2026, count: 25 }, { batchYear: 2025, count: 20 }],
    tags: ["Startup", "Venture", "Pitching"],
  });

  await Society.create({
    ownerId: litClub.id,
    name: "Literary Society",
    foundedYear: 2019,
    category: "Cultural",
    tagline: "Words, Debates, Poetry & Creative Expression",
    about: "The hub for debaters, poets, quizmasters, and writers. We conduct parliamentary debates and publish the official campus newsletter.",
    socialLinks: [],
    team: [{ name: "Aisha Qureshi", role: "Editor" }],
    memberCountsByYear: [{ batchYear: 2028, count: 20 }, { batchYear: 2027, count: 18 }, { batchYear: 2026, count: 15 }, { batchYear: 2025, count: 12 }],
    tags: ["Debate", "Poetry", "MUN"],
  });

  await Society.create({
    ownerId: sportsClub.id,
    name: "Sports Club",
    foundedYear: 2014,
    category: "Sports",
    tagline: "Athleticism, Team Spirit & Championship Grit",
    about: "Coordinating inter-departmental tournaments in football, basketball, cricket, badminton, and athletics.",
    socialLinks: [],
    team: [{ name: "Harsh Vardhan", role: "Secretary" }],
    memberCountsByYear: [{ batchYear: 2028, count: 60 }, { batchYear: 2027, count: 50 }, { batchYear: 2026, count: 50 }, { batchYear: 2025, count: 40 }],
    tags: ["Football", "Cricket", "Athletics"],
  });

  console.log("Creating events...");
  const now = new Date();
  await Event.create({
    societyId: acmSociety.id,
    title: "Web Development Workshop",
    summary: "Build and deploy your first modern full-stack web application from scratch.",
    description: "A hands-on workshop designed for students to master React, Node.js, and API integrations with interactive exercises.",
    startsAt: new Date(Date.now() + 10 * 86400000),
    location: "ACM Lab, Block A",
    mode: "in-person",
    status: "published",
    createdBy: acmClub.id,
  });

  await Event.create({
    societyId: acmSociety.id,
    title: "Hackathon 2026",
    summary: "24-hour sprint building AI, Web3, and Open Source solutions for prizes worth ₹1,00,000.",
    description: "Assemble your team of 2-4 and build solutions for real campus and industry problems. Mentors and food provided!",
    startsAt: new Date(Date.now() + 25 * 86400000),
    location: "Main Auditorium",
    mode: "in-person",
    status: "published",
    createdBy: acmClub.id,
  });

  await Event.create({
    societyId: acmSociety.id,
    title: "Tech Talk: AI in Real World",
    summary: "Industry speaker session on LLMs, agentic systems, and deployment practices.",
    description: "Join senior AI research engineers as they discuss current industry trends and interview preparation in computer vision and generative AI.",
    startsAt: new Date(Date.now() + 45 * 86400000),
    location: "Online (Google Meet)",
    mode: "online",
    status: "published",
    createdBy: acmClub.id,
  });

  console.log("Creating recruitments...");
  const acmRecruitment = await Recruitment.create({
    societyId: acmSociety.id,
    title: "Recruitment 2026",
    description: "Calling passionate developers, designers, and writers to lead ACM initiatives for the academic year 2026-27.",
    positions: [
      { title: "Web Development", seats: 3 },
      { title: "UI/UX Design", seats: 2 },
      { title: "Content Writing", seats: 2 },
      { title: "Event Management", seats: 2 },
      { title: "Graphic Design", seats: 1 },
    ],
    opensAt: new Date(Date.now() - 5 * 86400000),
    closesAt: new Date(Date.now() + 20 * 86400000),
    applicationUrl: "https://forms.google.com/abcd123",
    status: "open",
    createdBy: acmClub.id,
  });

  console.log("Creating applications...");
  await Application.create([
    {
      societyId: acmSociety.id,
      recruitmentId: acmRecruitment.id,
      studentId: aman.id,
      positionTitle: "Web Development",
      coverLetter: "Experience with React, TypeScript, and Node.js. Built 3 full-stack projects.",
      status: "pending",
    },
    {
      societyId: acmSociety.id,
      recruitmentId: acmRecruitment.id,
      studentId: priya.id,
      positionTitle: "UI/UX Design",
      coverLetter: "Figma portfolio with complete mobile design systems and micro-interactions.",
      status: "shortlisted",
      decisionNote: "Great portfolio links. Schedule interview for round 2.",
    },
    {
      societyId: acmSociety.id,
      recruitmentId: acmRecruitment.id,
      studentId: rohit.id,
      positionTitle: "Graphic Design",
      coverLetter: "Photoshop and Illustrator graphics for college fest posters.",
      status: "pending",
    },
  ]);

  console.log("Creating announcements...");
  await Announcement.create([
    {
      title: "Campus Recruitment Drives Officially Open for Fall 2026",
      body: "All approved societies have posted their open recruitment forms. Students from 1st and 2nd years are encouraged to apply before deadlines.",
      status: "published",
      publishedAt: new Date(),
      createdBy: "admin",
    },
    {
      title: "Annual TechFest Dates Announced",
      body: "TechFest 2026 will be held from January 15-18. Registration for competitive events opens next week on CampusConnect.",
      societyId: acmSociety.id,
      status: "published",
      publishedAt: new Date(),
      createdBy: acmClub.id,
    },
  ]);

  console.log("✅ Seed completed successfully!");
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error("Seed error:", err);
  process.exit(1);
});
