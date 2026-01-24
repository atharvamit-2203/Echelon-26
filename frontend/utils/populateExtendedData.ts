import { collection, addDoc, setDoc, doc } from 'firebase/firestore';
import { db } from '../config/firebase';

const indianCompanies = [
  { name: "Tata Consultancy Services", industry: "IT Services", location: "Mumbai" },
  { name: "Infosys", industry: "IT Services", location: "Bangalore" },
  { name: "Wipro", industry: "IT Services", location: "Bangalore" },
  { name: "HCL Technologies", industry: "IT Services", location: "Noida" },
  { name: "Tech Mahindra", industry: "IT Services", location: "Pune" },
  { name: "Reliance Industries", industry: "Conglomerate", location: "Mumbai" },
  { name: "HDFC Bank", industry: "Banking", location: "Mumbai" },
  { name: "Bharti Airtel", industry: "Telecommunications", location: "New Delhi" },
  { name: "Mahindra Group", industry: "Automotive", location: "Mumbai" },
  { name: "Bajaj Finserv", industry: "Financial Services", location: "Pune" }
];

const recruitingManagers = [
  { name: "Priya Sharma", email: "priya.sharma@tcs.com", company: "Tata Consultancy Services", experience: 8 },
  { name: "Rajesh Kumar", email: "rajesh.kumar@infosys.com", company: "Infosys", experience: 12 },
  { name: "Anita Patel", email: "anita.patel@wipro.com", company: "Wipro", experience: 6 },
  { name: "Vikram Singh", email: "vikram.singh@hcl.com", company: "HCL Technologies", experience: 10 },
  { name: "Meera Reddy", email: "meera.reddy@techmahindra.com", company: "Tech Mahindra", experience: 7 },
  { name: "Arjun Gupta", email: "arjun.gupta@ril.com", company: "Reliance Industries", experience: 15 },
  { name: "Kavya Nair", email: "kavya.nair@hdfcbank.com", company: "HDFC Bank", experience: 9 },
  { name: "Rohit Agarwal", email: "rohit.agarwal@airtel.com", company: "Bharti Airtel", experience: 11 },
  { name: "Deepika Joshi", email: "deepika.joshi@mahindra.com", company: "Mahindra Group", experience: 5 },
  { name: "Sanjay Verma", email: "sanjay.verma@bajajfinserv.in", company: "Bajaj Finserv", experience: 13 }
];

const sampleCVs = [
  {
    candidateId: "CV001",
    name: "Amit Sharma",
    email: "amit.sharma@email.com",
    phone: "+91-9876543210",
    age: 28,
    gender: "Male",
    experience: 5,
    skills: ["Java", "Spring Boot", "MySQL", "AWS"],
    education: "B.Tech Computer Science",
    location: "Bangalore",
    currentRole: "Senior Software Engineer",
    expectedSalary: "15 LPA",
    uploadedAt: new Date(),
    status: "under_review"
  },
  {
    candidateId: "CV002", 
    name: "Sneha Patel",
    email: "sneha.patel@email.com",
    phone: "+91-9876543211",
    age: 32,
    gender: "Female",
    experience: 8,
    skills: ["Python", "Django", "PostgreSQL", "Docker"],
    education: "M.Tech Software Engineering",
    location: "Pune",
    currentRole: "Tech Lead",
    expectedSalary: "22 LPA",
    uploadedAt: new Date(),
    status: "shortlisted"
  },
  {
    candidateId: "CV003",
    name: "Rajesh Kumar",
    email: "rajesh.kumar@email.com", 
    phone: "+91-9876543212",
    age: 45,
    gender: "Male",
    experience: 18,
    skills: ["Project Management", "Agile", "Scrum", "Leadership"],
    education: "MBA + B.E Electronics",
    location: "Mumbai",
    currentRole: "Project Manager",
    expectedSalary: "35 LPA",
    uploadedAt: new Date(),
    status: "rejected"
  },
  {
    candidateId: "CV004",
    name: "Priya Singh",
    email: "priya.singh@email.com",
    phone: "+91-9876543213", 
    age: 26,
    gender: "Female",
    experience: 3,
    skills: ["React", "Node.js", "MongoDB", "JavaScript"],
    education: "B.Tech Information Technology",
    location: "Delhi",
    currentRole: "Frontend Developer",
    expectedSalary: "12 LPA",
    uploadedAt: new Date(),
    status: "rescued"
  },
  {
    candidateId: "CV005",
    name: "Arjun Reddy",
    email: "arjun.reddy@email.com",
    phone: "+91-9876543214",
    age: 48,
    gender: "Male", 
    experience: 22,
    skills: ["Data Science", "Machine Learning", "Python", "R"],
    education: "PhD Computer Science",
    location: "Hyderabad",
    currentRole: "Senior Data Scientist",
    expectedSalary: "40 LPA",
    uploadedAt: new Date(),
    status: "rescued"
  }
];

export const populateExtendedData = async () => {
  try {
    // Add companies
    for (const company of indianCompanies) {
      await addDoc(collection(db, 'companies'), {
        ...company,
        addedAt: new Date(),
        active: true
      });
    }

    // Add recruiting managers
    for (const manager of recruitingManagers) {
      await addDoc(collection(db, 'recruiting_managers'), {
        ...manager,
        addedAt: new Date(),
        active: true,
        department: "Human Resources"
      });
    }

    // Add CVs
    for (const cv of sampleCVs) {
      await addDoc(collection(db, 'cvs'), cv);
    }

    // Add job postings
    const jobPostings = [
      {
        jobId: "JOB001",
        title: "Senior Software Engineer",
        company: "Tata Consultancy Services",
        location: "Mumbai",
        requirements: ["Java", "Spring Boot", "5+ years experience"],
        postedBy: "priya.sharma@tcs.com",
        postedAt: new Date(),
        status: "active"
      },
      {
        jobId: "JOB002", 
        title: "Data Scientist",
        company: "Infosys",
        location: "Bangalore",
        requirements: ["Python", "Machine Learning", "3+ years experience"],
        postedBy: "rajesh.kumar@infosys.com",
        postedAt: new Date(),
        status: "active"
      }
    ];

    for (const job of jobPostings) {
      await addDoc(collection(db, 'job_postings'), job);
    }

    console.log('Extended data populated successfully!');
  } catch (error) {
    console.error('Error populating extended data:', error);
  }
};