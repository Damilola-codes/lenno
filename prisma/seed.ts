import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create skills
  const skills = [
    // Programming & Development
    'JavaScript', 'TypeScript', 'Python', 'Java', 'C#', 'PHP', 'Ruby', 'Go', 'Rust', 'Swift',
    'React', 'Vue.js', 'Angular', 'Node.js', 'Express.js', 'Next.js', 'Nuxt.js',
    'HTML', 'CSS', 'SASS', 'Tailwind CSS', 'Bootstrap',
    'MongoDB', 'PostgreSQL', 'MySQL', 'Redis', 'Firebase',
    'AWS', 'Azure', 'Google Cloud', 'Docker', 'Kubernetes',
    'Git', 'GraphQL', 'REST API', 'Microservices',

    // Mobile Development
    'iOS Development', 'Android Development', 'React Native', 'Flutter', 'Xamarin',
    'Swift', 'Kotlin', 'Objective-C',

    // Design
    'UI/UX Design', 'Web Design', 'Graphic Design', 'Logo Design', 'Brand Design',
    'Figma', 'Adobe Photoshop', 'Adobe Illustrator', 'Adobe XD', 'Sketch',
    'Prototyping', 'Wireframing', 'User Research', 'Information Architecture',
    
    // Marketing & Business
    'Digital Marketing', 'SEO', 'SEM', 'Social Media Marketing', 'Content Marketing',
    'Email Marketing', 'PPC Advertising', 'Google Ads', 'Facebook Ads',
    'Analytics', 'Market Research', 'Business Strategy', 'Project Management',

    // Content & Writing
    'Content Writing', 'Copywriting', 'Technical Writing', 'Blog Writing',
    'Creative Writing', 'Proofreading', 'Editing', 'Translation',
    'Social Media Content', 'Email Copy', 'Sales Copy',

    // Data & Analytics
    'Data Science', 'Machine Learning', 'Artificial Intelligence', 'Data Analysis',
    'Python', 'R', 'SQL', 'Tableau', 'Power BI', 'Excel',
    'Statistics', 'Data Visualization', 'Big Data',

    // Other Skills
    'Video Editing', 'Photography', 'Animation', '3D Modeling', 'Voice Over',
    'Virtual Assistant', 'Customer Support', 'Lead Generation',
    'Blockchain', 'Cryptocurrency', 'Game Development', 'DevOps',
    'Cybersecurity', 'Quality Assurance', 'Testing'
  ];

  const createdSkills = await Promise.all(
    skills.map(skill => 
      prisma.skill.upsert({
        where: { name: skill },
        update: {},
        create: { name: skill }
      })
    )
  );

  console.log(`✅ Created ${createdSkills.length} skills`)
  // Create test users
  const clientPassword = await bcrypt.hash('password123', 12);
  const freelancerPassword = await bcrypt.hash('password123', 12);

  // Create a client
  const client = await prisma.user.upsert({
    where: { email: 'client@example.com' },
    update: {},
    create: {
      email: 'client@example.com',
      password: clientPassword,
      firstName: 'John',
      lastName: 'Client',
      username: 'johnclient',
      userType: 'CLIENT',
      isVerified: true,
      piWalletId: 'pi_wallet_client_123',
      profile: {
        create: {
          title: 'Tech Startup Founder',
          description: 'Building the next big thing in tech. Looking for talented developers and designers.',
          location: 'San Francisco, CA',
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
        }
      }
    },
    include: { profile: true }
  });

  // Create freelancers
  const freelancer1 = await prisma.user.upsert({
    where: { email: 'freelancer1@example.com' },
    update: {},
    create: {
      email: 'freelancer1@example.com',
      password: freelancerPassword,
      firstName: 'Jane',
      lastName: 'Developer',
      username: 'janedev',
      userType: 'FREELANCER',
      isVerified: true,
      piWalletId: 'pi_wallet_freelancer_456',
      profile: {
        create: {
          title: 'Full Stack Developer',
          description: 'Experienced full stack developer with 5+ years in React, Node.js, and cloud technologies.',
          hourlyRate: 75.00,
          location: 'New York, NY',
          website: 'https://janedev.com',
          avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
          skills: {
            connect: createdSkills.filter(skill => 
              ['JavaScript', 'TypeScript', 'React', 'Node.js'].includes(skill.name)
            ).map(skill => ({ id: skill.id }))
          }
        }
      }
    },
    include: { profile: { include: { skills: true } } }
  });

  const freelancer2 = await prisma.user.upsert({
    where: { email: 'freelancer2@example.com' },
    update: {},
    create: {
      email: 'freelancer2@example.com',
      password: freelancerPassword,
      firstName: 'Mike',
      lastName: 'Designer',
      username: 'mikedesign',
      userType: 'FREELANCER',
      isVerified: true,
      piWalletId: 'pi_wallet_freelancer_789',
      profile: {
        create: {
          title: 'UI/UX Designer',
          description: 'Creative designer specializing in modern web and mobile interfaces.',
          hourlyRate: 60.00,
          location: 'Austin, TX',
          website: 'https://mikedesign.com',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
          skills: {
            connect: createdSkills.filter(skill => 
              ['UI/UX Design', 'Web Design', 'Graphic Design'].includes(skill.name)
            ).map(skill => ({ id: skill.id }))
          }
        }
      }
    },
    include: { profile: { include: { skills: true } } }
  });

  // Create sample jobs
  const job1 = await prisma.job.create({
    data: {
      title: 'Build a React E-commerce Website',
      description: `We're looking for an experienced React developer to build a modern e-commerce website. 

Requirements:
- React with TypeScript
- Responsive design
- Payment gateway integration
- Admin dashboard
- SEO optimization

Timeline: 6-8 weeks
Budget: $3000-5000

Please include examples of your previous e-commerce projects in your proposal.`,
      budget: 4000.00,
      duration: '6-8 weeks',
      isHourly: false,
      clientId: client.id,
      skills: {
        connect: createdSkills.filter(skill => 
          ['React', 'TypeScript', 'JavaScript'].includes(skill.name)
        ).map(skill => ({ id: skill.id }))
      }
    }
  });

  const job2 = await prisma.job.create({
    data: {
      title: 'Mobile App UI/UX Design',
      description: `Need a talented designer to create UI/UX designs for a fitness tracking mobile app.

Deliverables:
- User research and personas
- Wireframes and user flows
- High-fidelity mockups
- Design system/style guide
- Prototype

Looking for modern, clean design that appeals to fitness enthusiasts.`,
      budget: 2500.00,
      duration: '4-6 weeks',
      isHourly: false,
      clientId: client.id,
      skills: {
        connect: createdSkills.filter(skill => 
          ['UI/UX Design', 'Mobile Development'].includes(skill.name)
        ).map(skill => ({ id: skill.id }))
      }
    }
  });

  const job3 = await prisma.job.create({
    data: {
      title: 'Python Data Analysis Script',
      description: `Looking for a Python developer to create a data analysis script for our sales data.

Requirements:
- Clean and process CSV data
- Generate charts and visualizations
- Statistical analysis
- Export results to PDF reports
- Well-documented code

Data includes sales transactions, customer info, and product details.`,
      budget: 800.00,
      duration: '1-2 weeks',
      isHourly: false,
      clientId: client.id,
      skills: {
        connect: createdSkills.filter(skill => 
          ['Python', 'Data Science'].includes(skill.name)
        ).map(skill => ({ id: skill.id }))
      }
    }
  });

  // Create sample proposals
  const proposal1 = await prisma.proposal.create({
    data: {
      jobId: job1.id,
      freelancerId: freelancer1.id,
      coverLetter: `Hi John,

I'm excited about your React e-commerce project! With over 5 years of experience building modern web applications, I'm confident I can deliver exactly what you need.

My approach:
- Start with a detailed requirements analysis
- Create a scalable architecture using React, TypeScript, and Next.js
- Implement secure payment processing with Stripe
- Build a comprehensive admin dashboard
- Ensure mobile responsiveness and SEO optimization

I've recently completed similar projects including an online marketplace and a subscription-based platform. You can check out my portfolio at janedev.com.

Timeline: I can start immediately and complete this within 7 weeks.
Rate: $4,200 for the complete project

Looking forward to discussing this further!

Best regards,
Jane`,
      proposedRate: 4200.00,
      duration: '7 weeks'
    }
  });

  const proposal2 = await prisma.proposal.create({
    data: {
      jobId: job2.id,
      freelancerId: freelancer2.id,
      coverLetter: `Hello!

Your fitness app UI/UX project sounds fantastic! I specialize in designing user-friendly mobile interfaces that drive engagement.

What I'll deliver:
✅ User research and persona development
✅ Complete user journey mapping
✅ Wireframes for all key screens
✅ High-fidelity designs in Figma
✅ Interactive prototype
✅ Comprehensive design system

I have extensive experience designing fitness and health apps. My recent project for a workout tracking app achieved 85% user retention rate in the first month.

I believe in creating designs that not only look great but also solve real user problems. Let's create something amazing together!

Timeline: 5 weeks
Investment: $2,300

Portfolio: mikedesign.com/fitness-apps

Best,
Mike`,
      proposedRate: 2300.00,
      duration: '5 weeks'
    }
  });

  // Accept one proposal and create a contract
  await prisma.proposal.update({
    where: { id: proposal1.id },
    data: { status: 'ACCEPTED' }
  });

  await prisma.job.update({
    where: { id: job1.id },
    data: { status: 'IN_PROGRESS' }
  });

  const contract1 = await prisma.contract.create({
    data: {
      jobId: job1.id,
      clientId: client.id,
      freelancerId: freelancer1.id,
      title: 'React E-commerce Website Development',
      description: 'Full-stack e-commerce website with React, TypeScript, and payment integration',
      amount: 4200.00,
      startDate: new Date(),
      status: 'ACTIVE'
    }
  });

  // Create milestones for the contract
  await prisma.milestone.createMany({
    data: [
      {
        contractId: contract1.id,
        title: 'Project Setup & Architecture',
        description: 'Initial project setup, architecture planning, and basic structure',
        amount: 1000.00,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
        isCompleted: true
      },
      {
        contractId: contract1.id,
        title: 'Frontend Development',
        description: 'Complete frontend implementation with all product pages',
        amount: 1500.00,
        dueDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000), // 3 weeks from now
        isCompleted: true
      },
      {
        contractId: contract1.id,
        title: 'Backend & Payment Integration',
        description: 'API development and payment gateway integration',
        amount: 1200.00,
        dueDate: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000), // 5 weeks from now
      },
      {
        contractId: contract1.id,
        title: 'Testing & Deployment',
        description: 'Final testing, optimization, and production deployment',
        amount: 500.00,
        dueDate: new Date(Date.now() + 49 * 24 * 60 * 60 * 1000), // 7 weeks from now
      }
    ]
  });

  // Create a completed contract with reviews
  const completedContract = await prisma.contract.create({
    data: {
      jobId: job3.id,
      clientId: client.id,
      freelancerId: freelancer1.id,
      title: 'Python Data Analysis Script',
      description: 'Custom Python script for sales data analysis and reporting',
      amount: 800.00,
      startDate: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000), // 3 weeks ago
      endDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
      status: 'COMPLETED'
    }
  });

  await prisma.job.update({
    where: { id: job3.id },
    data: { status: 'COMPLETED' }
  });

  // Create reviews for the completed contract
  await prisma.review.createMany({
    data: [
      {
        contractId: completedContract.id,
        giverId: client.id,
        receiverId: freelancer1.id,
        rating: 5,
        comment: 'Excellent work! Jane delivered exactly what we needed. The Python script is well-documented and the analysis insights are very valuable. Highly recommended!'
      },
      {
        contractId: completedContract.id,
        giverId: freelancer1.id,
        receiverId: client.id,
        rating: 5,
        comment: 'Great client to work with. Clear requirements, prompt communication, and quick payments. Looking forward to future projects!'
      }
    ]
  });

  console.log('Database seeded successfully!');
  console.log('Test accounts created:');
  console.log('Client: client@example.com / password123');
  console.log('Freelancer 1: freelancer1@example.com / password123');
  console.log('Freelancer 2: freelancer2@example.com / password123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
