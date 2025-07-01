// Portfolio content for RAG (Retrieval-Augmented Generation) system
// Each object represents searchable content about Ronan Dela Cruz's portfolio

const myPortfolioContent = [
  {
    text: `I am Ronan Dela Cruz, an aspiring full-stack developer passionate about building modern web experiences and turning ideas into reality. I specialize in creating responsive, user-friendly web applications with modern technologies. My journey in tech started through my Information Technology studies, and I've been continuously learning and growing in this field. I love building modern web experiences, turning ideas into reality, and I'm passionate about clean code.`,
    category: "about",
    title: "About Me - Professional Summary",
    source: "portfolio"
  },
  
  {
    text: `My core technical skills include:
    
Programming Languages: JavaScript, TypeScript, PHP, Java, C++, Dart
Frontend Technologies: React, Next.js, HTML5, CSS3, Tailwind CSS, Bootstrap, Shadcn/ui, Vite
Backend Technologies: Node.js, PHP, Java, MySQL, Firebase
Mobile Development: Flutter
Tools & Development: Git, GitHub, VS Code, Figma
Deployment & Hosting: Netlify, Vercel
AI & Modern Tech: OpenAI, Anthropic Claude, Google Gemini

Currently Learning: Python, REST API development, Laravel

I'm constantly expanding my skill set and staying updated with the latest technologies and industry best practices. I work across the full stack development field and have experience with a variety of technologies.`,
    category: "skills",
    title: "Technical Skills & Technologies",
    source: "portfolio"
  },
  
  {
    text: `Current Role: Student Developer – Capstone Project at St. Dominic College of Asia
    Duration: October 2024 – Present
    
    In my current role, I co-develop PULSE, a barangay-level mobile application featuring Material Design UI with custom animations for public updates, digital services, and community marketplace engagement. Key accomplishments include:
    - Built the SuperAdmin web dashboard using Flutter Web with responsive layouts and data visualization tools
    - Integrated Firebase Authentication, Firestore, and Realtime Database with custom Node.js notification server
    - Implemented email notifications with PIN verification, custom push notification channels, and role-based access control
    - Collaborated in an Agile development environment with sprint planning and stakeholder presentations
    
    Previous Experience:
    Full-Stack Developer (Personal Projects) - Self-Initiated | Freelance-style builds (2024 – Present)
    - Developed AroundU, a neighborhood and business guide app using Firebase and Leaflet.js
    - Built S&Z Hot Pot Haven, an e-commerce-inspired food ordering system with real-time order tracking
    - Created responsive UIs using React, Vite, TypeScript, and Tailwind CSS
    - Developed a Car Rental System using PHP and MySQL
    
    This experience has given me strong skills in full-stack development, Firebase integration, real-time applications, and Agile methodologies. It taught me the importance of user-centered design and collaborative development.`,
    category: "experience",
    title: "Professional Work Experience",
    source: "portfolio"
  },
  
  {
    text: `Project 1: PULSE - Barangay Community Platform
    Technologies: Flutter, Flutter Web, Firebase Authentication, Firestore, Realtime Database, Node.js, Material Design
    Description: A comprehensive barangay-level mobile application and web dashboard system that connects community members with local government services, public updates, and marketplace features.
    Key Features: Material Design UI with custom animations, SuperAdmin web dashboard with data visualization, real-time notifications, role-based access control, community marketplace
    Challenges & Solutions: Integrated multiple Firebase services with custom Node.js server for optimized real-time data flow and implemented secure role-based access across mobile and web platforms
    Status: Currently in development as capstone project
    
    This project demonstrates my ability to work with complex Firebase architectures, create responsive web dashboards, and implement real-time communication systems.`,
    category: "projects",
    title: "Featured Project - PULSE Platform",
    source: "portfolio"
  },
  
  {
    text: `Project 2: AroundU - Neighborhood Guide App
    Technologies: Firebase, Leaflet.js, JavaScript, HTML5, CSS3
    Description: A location-based neighborhood and business guide application that helps users discover local businesses and community features in their area.
    Key Features: Interactive maps with Leaflet.js, location-based business listings, community features, Firebase backend
    Impact: Provides users with comprehensive local business information and community connectivity
    Status: Completed personal project
    
    This project showcases my expertise in location-based services, map integration, and Firebase backend development.`,
    category: "projects",
    title: "Featured Project - AroundU",
    source: "portfolio"
  },
  
  {
    text: `Project 3: S&Z Hot Pot Haven - Food Ordering System
    Technologies: React, TypeScript, Firebase, PDF generation libraries
    Description: An e-commerce-inspired food ordering system designed for a hot pot restaurant with comprehensive order management and tracking capabilities.
    Key Features: Real-time order tracking, automated PDF invoice generation, responsive UI, order management system
    Learning Outcomes: Gained experience in e-commerce development patterns, real-time data synchronization, and automated document generation
    Status: Completed personal project
    
    Building this project helped me master e-commerce development patterns and understand real-time order tracking systems.`,
    category: "projects",
    title: "Featured Project - S&Z Hot Pot Haven",
    source: "portfolio"
  },
  
  {
    text: `Education:
    Bachelor of Science in Information Technology from St. Dominic College of Asia (August 2022 - Present)
    Pursuing a comprehensive program focused on modern information technology concepts, software development, and systems design.
    
    Senior High School:
    ICT (Information and Communication Technology) from Informatics Philippines (2020 - 2022)
    Completed senior high school with a focus on Information and Communication Technology, building a foundation in information technology and digital skills.
    
    Continuous Learning:
    I regularly take online courses and work on personal projects to stay current. Recent learning includes:
    - Python programming and REST API development
    - Laravel framework for PHP development
    - Advanced Firebase features and integrations
    - AI integration with OpenAI, Anthropic, and Google Gemini
    
    I believe in lifelong learning and am always exploring new technologies and methodologies. My education combines formal IT education with hands-on project experience.`,
    category: "education",
    title: "Education & Continuous Learning",
    source: "portfolio"
  },
  
  {
    text: `Outside of coding, I enjoy exploring new technologies and working on creative projects. I find that continuous learning helps me stay innovative and brings fresh perspectives to my development work.
    
    I'm also passionate about creating user-friendly applications and believe in maintaining a good balance between technical excellence and user experience.
    
    Professional Interests:
    I'm particularly excited about AI integration in web applications, real-time technologies, and mobile development. I enjoy working on projects that solve real-world problems and have meaningful impact on communities.
    
    I believe in giving back to the tech community through open source contributions and sharing knowledge with fellow developers. I'm always interested in collaborative projects and learning from other developers.`,
    category: "personal",
    title: "Personal Interests & Values",
    source: "portfolio"
  },
  
  {
    text: `I'm currently open to internship opportunities and entry-level full-stack developer positions. As a final year IT student, I'm eager to gain professional experience and contribute to meaningful projects.
    
    What I'm looking for:
    - Entry-level or internship positions in full-stack web development
    - Opportunities to work with modern technologies like React, TypeScript, Node.js, and Firebase
    - Companies that value continuous learning and professional growth
    - Collaborative environments where I can contribute to real-world applications
    
    Career Goals:
    Short-term: Complete my Bachelor's degree, gain professional development experience, and contribute to impactful projects
    Long-term: Become a skilled full-stack developer, specialize in modern web technologies, and eventually lead development teams
    
    I'm particularly interested in opportunities that involve modern web technologies, real-time applications, mobile development, and AI integration. I'm excited about roles where I can apply my skills in React, TypeScript, Firebase, and Flutter.
    
    Feel free to reach out if you think there might be a good fit or if you'd like to discuss potential opportunities for internships or entry-level positions!`,
    category: "goals",
    title: "Career Goals & Opportunities",
    source: "portfolio"
  }
];

module.exports = myPortfolioContent;