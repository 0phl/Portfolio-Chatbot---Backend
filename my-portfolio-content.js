// Enhanced Portfolio Content for RAG (Retrieval-Augmented Generation) system
// Comprehensive content about Ronan Dela Cruz with full context and personality
// Optimized for better chatbot responses and user engagement

const myPortfolioContent = [
  // === CORE IDENTITY & PERSONALITY ===
  {
    text: `I am Ronan Dela Cruz (nickname: Ron), a 22-year-old aspiring full-stack developer from the Philippines. I was born on February 15, 2003, and I'm currently a graduating student in my 4th year pursuing my Bachelor's degree in Information Technology at St. Dominic College of Asia, with an expected graduation in 2026.

Personal Details:
- Full Name: Ronan Dela Cruz
- Nickname: Ron
- Age: 22 years old
- Birthdate: February 15, 2003
- School: St. Dominic College of Asia
- Course: BS Information Technology
- Year Level: 4th Year (Graduating Student)
- Expected Graduation: 2026
- GitHub: https://github.com/0phl
- Mobile: 09760299219

I'm passionate about building modern web experiences and turning creative ideas into functional reality. As a graduating IT student, I'm eager to transition from academic projects to professional development work.

My personality: I'm helpful, clear, and communicate like a fellow IT student - keeping explanations student-friendly with simple language and practical examples. I believe in clean code, user-centered design, and continuous learning. I'm enthusiastic about technology but stay grounded and approachable.

My approach: I love connecting technical concepts to real-world applications and always try to relate answers to actual projects I've worked on. I'm collaborative, eager to learn, and believe in sharing knowledge with the developer community.`,
    category: "identity",
    title: "Core Identity & Personal Information",
    source: "portfolio",
    priority: "high",
    context_type: "foundational"
  },

  {
    text: `Communication Style & Approach:
- I explain things like I'm tutoring a classmate - friendly, clear, and relatable
- I use simple language and avoid overly technical jargon unless necessary
- I always try to provide practical examples and connect concepts to real projects
- I'm enthusiastic but not overwhelming - like a passionate student sharing what they've learned
- I acknowledge when I'm still learning something and frame it as part of my growth journey
- I'm from the Philippines, so I understand both local and international tech contexts
- I prefer collaborative discussions over one-way explanations

My tone is: Professional yet approachable, student-friendly, practical, and genuinely helpful. I sound like someone you'd want to work with on a group project.`,
    category: "communication",
    title: "Communication Style & Personality Traits",
    source: "portfolio",
    priority: "high",
    context_type: "behavioral"
  },
  // === TECHNICAL EXPERTISE ===
  {
    text: `My Technical Skills & Expertise:

🚀 Core Programming Languages (Main Focus):
- JavaScript & TypeScript: My strongest languages, used in most projects with modern ES6+ features
- PHP: Solid experience with web development, server-side scripting, and MySQL integration
- Node.js & Express.js: Building robust APIs, servers, and full-stack applications

🎨 Frontend Technologies (Primary Stack):
- React: My go-to framework, used extensively with hooks, context, state management, and modern patterns
- HTML5 & CSS3: Strong foundation with semantic markup, modern CSS, and responsive design
- Tailwind CSS: Preferred styling framework for rapid, consistent, and responsive development
- Bootstrap & Shadcn/ui: Component libraries for professional UI design
- Vite: Modern build tool for fast development experience and optimized builds

⚙️ Backend & Database (Core Skills):
- MySQL: Database design, complex queries, optimization, and PHP integration
- Express.js: RESTful API development, middleware, and server-side logic
- PHP: Server-side development, form handling, and database connectivity

📱 Mobile Development (Cross-Platform):
- Flutter: Building native mobile apps with Material Design and Firebase integration
- Firebase: Authentication, Firestore, Realtime Database, and hosting services
- Basic Java: Mobile development fundamentals and Android basics

🛠️ Development Tools & Workflow:
- Git & GitHub: Version control, collaboration, branching, and project management
- VS Code: Primary IDE with extensions for productivity and debugging
- Figma: UI/UX design, prototyping, and design systems

☁️ Deployment & Hosting:
- Render: Backend deployment for APIs and server-side applications
- Vercel: Frontend deployment for React applications and static sites
- Netlify: Frontend hosting for personal projects
- Firebase Hosting: Used for PULSE Super Admin web app deployment

🤖 AI & Modern Technologies (Recent Focus):
- Google Gemini: Building RAG systems and AI-powered chatbots
- Pinecone: Vector databases for semantic search and retrieval
- LangChain: RAG architecture and AI application development
- OpenAI & Anthropic: Working with various language models and AI APIs

📚 Currently Learning & Expanding:
- Python: Data processing, API development, and AI/ML applications
- REST API development: Advanced backend architecture and best practices
- Laravel: PHP framework for enterprise-level applications
- Advanced AI integration: RAG systems, vector databases, and intelligent applications

My approach: I focus on building real projects that solve actual problems. My main stack revolves around React, TypeScript, Node.js, PHP, and MySQL for web development, with Flutter for mobile. I'm passionate about creating user-friendly applications and recently diving deep into AI integration.`,
    category: "skills",
    title: "Technical Skills & Core Technologies",
    source: "portfolio",
    priority: "high",
    context_type: "technical"
  },
  // === PROFESSIONAL EXPERIENCE ===
  {
    text: `Current Role: Student Developer – Capstone Project at St. Dominic College of Asia
Duration: October 2024 – Present

PULSE - Public Updates, Local Services, and Engagement App (Capstone Project):
PULSE is a feature-rich community engagement mobile application designed to strengthen local communities through digital connectivity. Built with Flutter and powered by Firebase, it provides a comprehensive platform for community interaction, local commerce, civic engagement, and real-time communication.

Technical Architecture & Implementation:
- Mobile Application: Flutter with Material Design and custom animations
- Backend Services: Firebase (Authentication, Firestore Database, Realtime Database)
- Push Notifications: Firebase Cloud Messaging (FCM) for real-time updates
- File Management: Support for images, videos, documents (PDF, DOCX), and file attachments
- Analytics System: Community engagement tracking and PDF report generation

Key Features Developed:
- Community Management: Real-time community notices, announcements, and interactive engagement (likes, comments)
- Local Marketplace: Buy & sell platform with seller dashboard, advanced search & filtering, seller ratings & reviews, and real-time chat between buyers and sellers
- Volunteer Opportunities: Community volunteering discovery, event management, and participant tracking
- Community Reporting: Civic engagement tools, location-based reporting with GPS, status tracking, and administrative review process
- Admin Dashboard: Comprehensive community management tools with analytics and insights
- User Analytics: Barangay-level user analytics, demographics, and performance dashboards

Technical Challenges Solved:
- Real-time synchronization across multiple users and features
- Complex file handling for various media types and documents
- Location-based services requiring GPS permissions and accuracy
- Push notification system with customizable preferences
- Multi-role user management (residents, sellers, administrators)
- Performance optimization for community-scale usage

Project Impact & Learning:
This capstone project represents my most comprehensive mobile development experience, combining real-world community needs with technical innovation. I've learned to build scalable Flutter applications, integrate complex Firebase services, and design user experiences for diverse community members with varying technical literacy levels.`,
    category: "experience",
    title: "Current Role - PULSE Capstone Project",
    source: "portfolio",
    priority: "high",
    context_type: "professional"
  },

  {
    text: `Personal Projects Experience: Full-Stack Developer (Self-Initiated)
Duration: 2024 – Present | Independent Development & Learning

Project Portfolio Development:
I've been building a diverse portfolio of web applications, treating each project like a professional development engagement. This approach has given me comprehensive full-stack development experience and deep understanding of the complete software development lifecycle.

Major Projects & Technical Implementations:

S&Z Hot Pot Haven - E-commerce Web Application (January 2024 - March 2024):
- Tech Stack: PHP, MySQL, HTML5, CSS3, JavaScript, Bootstrap
- Project Scope: Modern web application for S&Z Hot Pot Haven, a premium hotpot ingredient store in Bacoor, Cavite
- Key Features: Product browsing with search functionality, shopping cart system, online ordering, customer interface, admin dashboard for product and order management
- Technical Implementation: PHP server-side processing, MySQL database design, Bootstrap responsive UI, JavaScript interactivity
- Business Impact: Complete e-commerce solution allowing customers to browse and order hotpot ingredients online
- Learning Outcomes: PHP web development, MySQL database management, e-commerce workflows, Bootstrap framework

AroundU - Neighborhood & Local Business Guide (2024):
- Tech Stack: React 18.2, TypeScript, Firebase, Leaflet.js, Tailwind CSS, Zustand
- Project Scope: Comprehensive web application connecting students with local businesses around educational institutions
- Key Features: Interactive map view with Leaflet, business discovery and filtering, detailed business profiles, real-time distance calculation, special offers system, event listings, alert system, business management tools
- Technical Implementation: React with TypeScript, Zustand state management, Firebase real-time data, Leaflet mapping integration, responsive design
- Business Impact: Platform for discovering, reviewing, and engaging with local businesses while providing business owners tools to reach students
- Learning Outcomes: Advanced React development, TypeScript integration, Firebase real-time applications, interactive mapping, location-based services

Car Rental System - Full-Stack Management System (November 2024):
- Tech Stack: PHP, MySQL, HTML5, CSS3, JavaScript, TCPDF, Font Awesome
- Project Scope: Comprehensive car rental management system with customer booking and administrative dashboard
- Key Features: Car browsing with search, no-registration booking, booking tracking with reference numbers, PDF invoice generation, admin dashboard, car management with image uploads, booking management, comprehensive reporting
- Technical Implementation: PHP architecture with modular code, normalized MySQL database, session management, file upload handling, TCPDF integration
- Business Impact: Complete rental management system streamlining customer bookings and administrative operations
- Learning Outcomes: Advanced PHP development, MySQL database design, file handling, PDF generation, admin dashboard development

IskedyulKo - Appointment Booking System (2024):
- Tech Stack: React 18, TypeScript, TailwindCSS, Vite, Express.js, Node.js, MySQL, JWT Authentication
- Project Scope: Full-stack appointment booking web application designed specifically for small Filipino businesses
- Key Features: Business dashboard with appointment overview and metrics, appointment management (confirm, cancel, complete), service management with pricing, business settings and working hours configuration, shareable booking links, customer booking process (4-step: Service → Date → Time → Details), appointment tracking with unique booking codes, no registration required for customers, mobile-friendly responsive design
- Technical Implementation: React frontend with TypeScript, Express.js backend with Node.js, MySQL database, JWT authentication, responsive TailwindCSS design
- Business Impact: Easy-to-use platform for small Filipino businesses to manage services and appointments while offering customers seamless booking experience
- Learning Outcomes: Full-stack development with modern React and Node.js, JWT authentication implementation, business workflow design, customer experience optimization

Linkfolio - Personal Bookmark Organizer (February 2025):
- Tech Stack: Next.js, TypeScript, Tailwind CSS, ShadCN UI, IndexedDB
- Project Scope: Personal digital bookmark organizer for individual use with local storage
- Key Features: Bookmark collection and categorization, offline access, privacy-focused local storage
- Technical Implementation: Next.js with TypeScript, IndexedDB for local data storage, ShadCN UI components
- Learning Outcomes: Next.js development, local storage solutions, privacy-focused application design

Development Philosophy & Skills Gained:
- Full-Stack Proficiency: Comprehensive understanding of frontend and backend integration
- Database Design: Expertise in MySQL database architecture and optimization
- User Experience Focus: Always prioritizing user needs and intuitive interface design
- Business Problem Solving: Building applications that address real-world business requirements
- Technology Versatility: Adapting to different tech stacks based on project requirements
- Independent Learning: Self-directed research and implementation of new technologies

Professional Impact:
This independent project experience has made me a resourceful and self-directed developer. I've gained expertise in making architectural decisions, debugging complex issues, and delivering complete solutions from concept to deployment. Most importantly, I've learned that effective software development requires understanding both technical implementation and business value.`,
    category: "experience",
    title: "Personal Projects & Full-Stack Development",
    source: "portfolio",
    priority: "medium",
    context_type: "professional"
  },
  // === DETAILED PROJECT SHOWCASE ===
  {
    text: `🎯 PULSE - Community Engagement Platform (Flagship Capstone Project)
Status: In Active Development | Capstone Project | October 2024 – Present

Project Overview:
PULSE (Public Updates, Local Services, and Engagement) is my capstone project - a comprehensive community engagement mobile application designed to strengthen local communities through digital connectivity. It's built to serve actual barangay communities in the Philippines, connecting residents with local government services and fostering community interaction.

🏗️ Technical Architecture:
- Mobile App: Flutter with Material Design and custom animations
- Backend: Firebase ecosystem (Authentication, Firestore, Realtime Database)
- Push Notifications: Firebase Cloud Messaging (FCM) for real-time updates
- File Support: Media-rich content including images, videos, documents (PDF, DOCX)
- Analytics: Community engagement tracking and reporting

🎨 Key Features I've Built:
- Community Notices & Announcements: Real-time community updates with media support
- Interactive Engagement: Like, comment, and engage with community content
- Local Marketplace: Buy & sell platform with seller dashboard and analytics
- Real-time Chat: Direct messaging between buyers and sellers
- Volunteer Opportunities: Community volunteering and event management
- Community Reporting: Location-based civic engagement and issue reporting
- Admin Dashboard: Comprehensive community management tools

🔧 Technical Challenges Solved:
- Real-time synchronization: Managing live updates across multiple users
- File handling: Supporting various media types and document formats
- Location services: GPS-enabled reporting and location-based features
- Push notifications: Reliable notification delivery with FCM
- User roles: Different access levels for residents, sellers, and administrators
- Performance optimization: Efficient data loading and offline capabilities

💡 What Makes This Special:
PULSE represents my most comprehensive project, combining mobile development, real-time systems, community engagement, and civic technology. It's designed to actually serve communities, not just as an academic exercise. The app addresses real community needs like communication, local commerce, and civic participation.

🎓 Learning Outcomes:
- Flutter mobile development with complex state management
- Firebase integration for real-time applications
- Community-focused software design and user experience
- Working with stakeholders and real-world requirements
- Building scalable applications for diverse user needs`,
    category: "projects",
    title: "PULSE - Community Engagement Platform",
    source: "portfolio",
    priority: "high",
    context_type: "project_detailed"
  },
  {
    text: `🤖 Portfolio Chatbot API - RAG-Powered AI Assistant (Latest Project)
Status: Completed | Personal Project | 2025

Project Overview:
A sophisticated RAG (Retrieval-Augmented Generation) powered chatbot API designed specifically for my portfolio website. This project represents my deep dive into AI integration, combining modern language models with vector databases to create a personality-aware assistant that can answer questions about my background, skills, and projects.

🏗️ Technical Architecture:
- Backend: Node.js with Express.js and TypeScript for type safety
- AI Integration: Google Gemini LLM for natural language generation
- Vector Database: Pinecone for semantic search and content retrieval
- RAG Framework: LangChain for orchestrating retrieval-augmented generation
- Content Processing: Enhanced metadata with personality-aware ranking
- Security: Comprehensive security suite with rate limiting, input validation, and DoS protection

🎯 Key Features I Built:
- Personality-Aware Responses: Maintains my communication style and personality
- Multi-Source Integration: Portfolio content, PDF documents, and contextual information
- Semantic Search: Advanced vector search with personality weighting
- Session Management: Conversation memory and context preservation
- Security Monitoring: IP blocking, suspicious pattern detection, and comprehensive logging
- Database Management: Tools for content optimization and performance monitoring

🔧 Technical Challenges Solved:
- RAG Implementation: Building effective retrieval-augmented generation pipeline
- Personality Consistency: Ensuring responses maintain my authentic voice and style
- Content Optimization: Semantic chunking and metadata enhancement for better retrieval
- Performance: Optimizing vector search and response generation speed
- Security: Implementing comprehensive protection against abuse and attacks
- Scalability: Designing for production deployment with monitoring and analytics

💡 What Makes This Special:
This project showcases my ability to work with cutting-edge AI technologies while maintaining focus on user experience and security. It's not just a chatbot - it's a comprehensive AI system that understands context, maintains personality, and provides accurate information about my professional background.

🎓 Learning Outcomes:
- Advanced AI integration with LLMs and vector databases
- RAG architecture design and implementation
- LangChain framework for AI application development
- Vector database optimization and semantic search
- Production-ready AI system deployment and monitoring
- Balancing AI capabilities with security and performance`,
    category: "projects",
    title: "Portfolio Chatbot API - RAG-Powered AI Assistant",
    source: "portfolio",
    priority: "high",
    context_type: "project_detailed"
  },

  {
    text: `📍 AroundU - Neighborhood & Local Business Guide
Status: Completed | Personal Project | 2024

Project Overview:
AroundU is a comprehensive web application designed to connect students with local businesses around educational institutions. It serves as a platform for discovering, reviewing, and engaging with nearby establishments while providing businesses with tools to reach their target audience effectively.

🛠️ Technical Implementation:
- Frontend: React 18.2 with TypeScript for type safety and modern development
- State Management: Zustand for efficient state handling
- Mapping: Leaflet with React Leaflet for interactive maps
- Routing: Leaflet Routing Machine for navigation features
- Backend: Firebase for authentication and real-time data
- UI Framework: Tailwind CSS with Headless UI components
- Form Handling: React Hook Form for efficient form management

🎯 Key Features I Built:
- Interactive Map View: Browse businesses with Leaflet-powered interactive maps
- Business Discovery: Search and filter by category, rating, and distance
- Detailed Business Profiles: Operating hours, photos, ratings, contact information
- Real-time Distance Calculation: GPS-based proximity calculations
- Special Offers: Student-exclusive discounts and promotions
- Event Listings: Local events and activities
- Alert System: Important notifications and announcements
- Business Management: Tools for business owners to manage profiles and promotions

💡 Technical Challenges & Solutions:
- Map Performance: Optimized marker rendering and clustering for smooth interactions
- Real-time Updates: Firebase integration for live business data and user interactions
- Location Services: Accurate GPS positioning and distance calculations
- Responsive Design: Mobile-first approach ensuring great experience across devices
- State Management: Efficient data flow with Zustand for complex application state

🎓 What I Learned:
- Advanced React development with TypeScript
- Interactive mapping with Leaflet and geolocation APIs
- Firebase integration for real-time applications
- Modern state management patterns with Zustand
- Building location-based applications with complex user interactions`,
    category: "projects",
    title: "AroundU - Neighborhood & Business Guide",
    source: "portfolio",
    priority: "medium",
    context_type: "project_detailed"
  },

  {
    text: `🍲 S&Z Hot Pot Haven - E-commerce Web Application
Status: Completed | Personal Project | January 2024 - March 2024

Project Overview:
A modern web application for S&Z Hot Pot Haven, a premium hotpot ingredient store located in Bacoor, Cavite. This website allows customers to browse products, add items to cart, and place orders online with an intuitive interface designed for both customers and administrators.

⚡ Technical Stack:
- Backend: PHP for server-side logic and business operations
- Database: MySQL for data storage and management
- Frontend: HTML5, CSS3, JavaScript for user interface
- Styling: Bootstrap for responsive design and components
- Development: Laragon local development environment
- PDF Generation: TCPDF library for invoice generation

🍽️ Core Features Developed:
- Product Catalog: Browse hotpot ingredients with detailed descriptions and pricing
- Shopping Cart: Add items to cart with quantity management
- Order Management: Complete order processing from cart to confirmation
- Customer Interface: User-friendly browsing and ordering experience
- Admin Dashboard: Backend management for products and orders
- Responsive Design: Mobile-friendly interface for all devices

🔧 Technical Implementation:
- PHP Backend: Server-side processing for orders, cart management, and user sessions
- MySQL Database: Structured data storage for products, orders, and customer information
- Bootstrap UI: Responsive grid system and pre-built components
- JavaScript Interactivity: Dynamic cart updates and form validation
- PDF Invoicing: Automated invoice generation for completed orders

💼 Business Logic Features:
- Product Management: Admin tools for adding, editing, and managing inventory
- Order Processing: Complete workflow from cart to order completion
- Customer Experience: Streamlined browsing and checkout process
- Inventory Tracking: Product availability and stock management
- Order History: Customer order tracking and history

🎯 Key Learning Outcomes:
- PHP web development and server-side programming
- MySQL database design and management
- E-commerce application architecture
- Bootstrap framework for responsive design
- Integration of frontend and backend technologies
- Business process automation and workflow design

This project taught me the fundamentals of full-stack web development using traditional technologies. It provided hands-on experience with PHP, MySQL, and creating complete e-commerce solutions for real businesses.`,
    category: "projects",
    title: "S&Z Hot Pot Haven - E-commerce Web Application",
    source: "portfolio",
    priority: "medium",
    context_type: "project_detailed"
  },

  {
    text: `🚗 Car Rental System - Full-Stack Web Application
Status: Completed | Personal Project | November 2024

Project Overview:
A comprehensive car rental management system built with PHP and MySQL, featuring a customer-facing booking interface and a complete administrative dashboard. The system allows customers to browse available vehicles, make bookings without registration, and track their reservations using unique reference numbers.

⚡ Technical Stack:
- Backend: PHP for server-side scripting and business logic
- Database: MySQL managed via PHPMyAdmin
- Frontend: HTML5, CSS3, JavaScript for user interface
- PDF Generation: TCPDF library for reports and invoices
- Icons: Font Awesome for consistent iconography
- Development: Laragon local development server

🚗 Key Features Developed:
- Car Browsing: View available cars with search functionality by brand/model
- Easy Booking: Book cars without registration required
- Booking Tracking: Check booking status using reference number
- Invoice Generation: Download PDF invoices for bookings
- Admin Dashboard: Overview statistics and system management
- Car Management: Add, edit, delete cars with image uploads
- Booking Management: View and manage all customer bookings
- Report Generation: Generate PDF reports for all bookings

🔧 Technical Implementation:
- PHP Architecture: Clean separation of concerns with modular PHP code
- MySQL Design: Normalized database structure for cars, bookings, and customers
- Session Management: Secure admin authentication and session handling
- File Uploads: Image upload functionality for car photos
- PDF Integration: TCPDF for generating professional invoices and reports
- Responsive CSS: Custom styling with mobile-friendly design

💼 Business Features:
- No Registration Booking: Streamlined customer experience without account creation
- Reference System: Unique booking codes for easy tracking
- Admin Security: Password-protected administrative access
- Comprehensive Reporting: Detailed booking reports and analytics
- Image Management: Car photo uploads and display system

🎯 Key Learning Outcomes:
- PHP web development and server-side programming
- MySQL database design and complex queries
- File upload handling and image management
- PDF generation and report creation
- Session management and authentication
- Building complete CRUD applications
- Admin dashboard design and functionality

This project strengthened my PHP and MySQL skills while teaching me how to build complete business management systems. It provided experience with file handling, PDF generation, and creating user-friendly interfaces for both customers and administrators.`,
    category: "projects",
    title: "Car Rental System - Full-Stack Management System",
    source: "portfolio",
    priority: "medium",
    context_type: "project_detailed"
  },

  {
    text: `📅 IskedyulKo - Appointment Booking System
Status: Completed | Personal Project | 2024

Project Overview:
IskedyulKo is a full-stack appointment booking web application designed specifically for small Filipino businesses. It provides an easy-to-use platform for business owners to manage their services and appointments while offering customers a seamless booking experience.

⚡ Technical Stack:
- Frontend: React 18 with TypeScript for type safety and modern development
- Styling: TailwindCSS for rapid, consistent UI development
- Build Tool: Vite for fast development and optimized builds
- Backend: Express.js with Node.js for server-side logic
- Database: MySQL for reliable data storage and management
- Authentication: JWT (JSON Web Tokens) for secure user authentication
- Routing: React Router DOM for client-side navigation

🏢 Key Features for Business Owners:
- Dashboard Overview: View today's appointments and key business metrics
- Appointment Management: Confirm, cancel, or mark appointments as complete
- Service Management: Add, edit, and delete services with pricing configuration
- Business Settings: Configure working hours and business information
- Shareable Booking Link: Custom URL for customers to book appointments
- Analytics: Track appointment trends and business performance

👥 Key Features for Customers:
- Easy Booking Process: 4-step booking flow (Service → Date → Time → Details)
- Appointment Tracking: Track booking status using unique booking code
- No Registration Required: Book appointments without creating accounts
- Mobile Friendly: Responsive design optimized for all devices
- Real-time Availability: Live updates on service and time slot availability

🔧 Technical Implementation:
- React Frontend: Modern component-based architecture with TypeScript
- Express Backend: RESTful API design with proper error handling
- MySQL Database: Normalized schema for businesses, services, appointments, and customers
- JWT Authentication: Secure token-based authentication for business owners
- Responsive Design: TailwindCSS for mobile-first, responsive layouts
- API Integration: Seamless frontend-backend communication

💼 Business Impact:
- Streamlined Operations: Eliminates manual appointment scheduling for small businesses
- Customer Convenience: Easy booking process without barriers
- Filipino Business Focus: Designed specifically for local business needs and workflows
- Scalable Solution: Architecture supports multiple businesses and high appointment volumes

🎯 Key Learning Outcomes:
- Full-stack development with modern React and Node.js
- JWT authentication implementation and security best practices
- MySQL database design for complex business workflows
- RESTful API development and frontend-backend integration
- Business process analysis and workflow optimization
- Customer experience design for service-based businesses

This project taught me how to build complete business solutions that address real-world needs. I gained experience in understanding business requirements, designing user-friendly workflows, and implementing secure, scalable web applications.`,
    category: "projects",
    title: "IskedyulKo - Appointment Booking System",
    source: "portfolio",
    priority: "medium",
    context_type: "project_detailed"
  },

  {
    text: `🔗 Linkfolio - Personal Bookmark Organizer
Status: Completed | Personal Project | February 2025

Project Overview:
Linkfolio is a personal digital bookmark organizer designed for individual use, helping users effortlessly collect, categorize, and access their favorite websites. All data is stored locally using IndexedDB, ensuring privacy and offline access without relying on external servers.

⚡ Technical Stack:
- Framework: Next.js for server-side rendering and modern React development
- Language: TypeScript for type safety and better development experience
- Styling: Tailwind CSS for rapid, consistent UI development
- UI Components: ShadCN UI for professional, accessible component library
- Database: IndexedDB for client-side data storage and offline functionality
- Build Tool: Next.js built-in optimization and bundling

🎯 Key Features Developed:
- Bookmark Collection: Easy-to-use interface for saving and organizing website links
- Category Management: Create custom categories to organize bookmarks logically
- Local Storage: All data stored locally using IndexedDB for privacy and speed
- Offline Access: Full functionality without internet connection after initial load
- Search Functionality: Quick search through bookmarks and categories
- Privacy-Focused: No external servers, no data tracking, complete user privacy
- Responsive Design: Optimized experience across desktop, tablet, and mobile devices

🔧 Technical Implementation:
- Next.js Architecture: Server-side rendering with client-side interactivity
- TypeScript Integration: Full type safety throughout the application
- IndexedDB Management: Efficient client-side database operations
- ShadCN UI Components: Professional, accessible user interface elements
- Tailwind CSS: Utility-first styling for rapid development and consistency
- Local-First Design: All functionality works offline with local data storage

💡 Design Philosophy:
- Privacy-First: No external dependencies for data storage or tracking
- User Control: Complete ownership of bookmark data
- Simplicity: Clean, intuitive interface focused on core functionality
- Performance: Fast loading and responsive interactions
- Accessibility: Designed with accessibility best practices

🎓 Key Learning Outcomes:
- Next.js development and server-side rendering concepts
- IndexedDB implementation for client-side data persistence
- Privacy-focused application design and architecture
- ShadCN UI component library integration
- Local-first application development principles
- TypeScript in Next.js applications for better code quality

This project taught me the importance of privacy-focused design and local-first applications. I gained experience in building applications that prioritize user privacy while maintaining excellent functionality and user experience.`,
    category: "projects",
    title: "Linkfolio - Personal Bookmark Organizer",
    source: "portfolio",
    priority: "medium",
    context_type: "project_detailed"
  },
  // === EDUCATION & LEARNING JOURNEY ===
  {
    text: `🎓 Formal Education:

Bachelor of Science in Information Technology
St. Dominic College of Asia | August 2022 - 2026 (4th Year - Graduating Student)

As a graduating IT student in my final year, my comprehensive program has provided a solid foundation in:
- Software Development: Object-oriented programming, data structures, algorithms
- Database Systems: Design, implementation, and optimization
- Web Technologies: Full-stack development, client-server architecture
- Systems Analysis: Requirements gathering, system design, project management
- Network Fundamentals: Understanding of networking concepts and security
- Mobile Development: Cross-platform application development
- Capstone Project: Currently developing PULSE, a community engagement platform

Senior High School - ICT Track
Informatics Philippines | 2020 - 2022

This specialized track gave me early exposure to:
- Programming fundamentals (started with C++ and Java)
- Web development basics (HTML, CSS, JavaScript)
- Database concepts and basic SQL
- Computer hardware and networking
- Digital literacy and productivity tools

🚀 Self-Directed Learning Philosophy:
I believe the best learning happens when you build real things. While my formal education provides the theoretical foundation, I learn best by:
- Building projects that solve actual problems
- Experimenting with new technologies through hands-on coding
- Reading documentation and following best practices
- Learning from the developer community and open source projects
- Teaching others what I've learned (which reinforces my own understanding)

📚 Current Learning Focus (2024-2025):
- Python: Data processing, API development, and exploring AI/ML applications
- Laravel: Enterprise-level PHP development and MVC architecture
- Advanced Firebase: Cloud Functions, advanced security rules, performance optimization
- REST API Design: Building scalable, well-documented APIs
- AI Integration: Working with various AI models and building RAG systems
- DevOps Basics: Understanding deployment, CI/CD, and cloud services

💡 Learning Approach:
I don't just follow tutorials - I build variations and improvements. For example, when learning about AI chatbots, I didn't just build a basic chatbot; I created a comprehensive RAG system with security features, logging, and performance optimization. This approach helps me understand not just how to use technologies, but how to apply them thoughtfully to real-world problems.`,
    category: "education",
    title: "Education & Continuous Learning Journey",
    source: "portfolio",
    priority: "medium",
    context_type: "background"
  },
  // === PERSONAL INTERESTS & VALUES ===
  {
    text: `🌟 Personal Interests & What Drives Me:

Physical Activities & Wellness:
I believe in maintaining a healthy balance between coding and physical activity. I enjoy going to the gym regularly, which helps me stay focused and energized for programming challenges. I also love jogging and running - there's something about the rhythm that helps me think through complex problems. Walking is another favorite activity of mine, especially when I need to clear my mind or brainstorm new project ideas.

Sports Background:
I used to play basketball actively, which taught me valuable lessons about teamwork, strategy, and perseverance - skills that translate well into software development and project collaboration.

Entertainment & Relaxation:
When I'm not coding or exercising, I enjoy watching anime and movies. These provide great inspiration for UI/UX design and storytelling in applications. Anime especially has influenced my appreciation for attention to detail and user experience design.

💻 Beyond Coding:
Outside of programming, I'm genuinely curious about how technology can improve people's lives. I enjoy exploring new technologies not just for the sake of learning, but to understand how they can solve real problems. I find myself constantly thinking about user experience - how can we make technology more accessible and helpful?

 Professional Passions:
- AI Integration: I'm fascinated by how AI can enhance web applications without overwhelming users
- Real-time Technologies: There's something magical about building systems where users see changes instantly
- Community-Focused Software: Building applications that bring people together and serve local communities
- Clean Code & Best Practices: I believe good code is not just functional, but readable and maintainable

 Community & Collaboration Values:
I believe in giving back to the tech community. While I'm still early in my career, I try to:
- Share what I learn through code comments and documentation
- Help classmates with programming challenges
- Contribute to discussions in developer communities
- Build projects that others can learn from and build upon

 Creative Problem Solving:
I approach development like solving puzzles. I enjoy the process of breaking down complex problems into smaller, manageable pieces. Whether it's figuring out how to optimize a database query or designing a user interface that feels intuitive, I find satisfaction in finding elegant solutions.

 Growth Mindset:
I'm comfortable with not knowing everything - in fact, I think that's what makes this field exciting. Every project teaches me something new. I've learned to embrace challenges as learning opportunities rather than obstacles.

 Work-Life Balance Philosophy:
I believe in sustainable development practices. While I'm passionate about coding, I also understand the importance of stepping away from the screen to gain fresh perspectives. My gym sessions, runs, and entertainment time aren't just hobbies - they're essential for maintaining creativity and problem-solving abilities.

🇵🇭 Cultural Context:
Being from the Philippines, I understand the importance of building technology that works in diverse environments - from high-speed internet in Manila to slower connections in rural areas. This perspective influences how I think about performance, accessibility, and user experience.`,
    category: "personal",
    title: "Personal Interests & Life Balance",
    source: "portfolio",
    priority: "medium",
    context_type: "personal"
  },
  // === CAREER GOALS & OPPORTUNITIES ===
  {
    text: `🚀 Current Career Status & Opportunities:

I'm currently a graduating student in my 4th year of BS Information Technology at St. Dominic College of Asia, with expected graduation in 2026. As a graduating IT student, I'm actively seeking internship opportunities and entry-level full-stack developer positions. I'm excited to transition from academic projects to professional development work where I can contribute to real-world applications and learn from experienced developers.

🎯 What I'm Looking For:

Ideal Opportunities:
- Entry-level or internship positions in full-stack web development
- Companies working with modern technologies (React, TypeScript, Node.js, MySQL, PHP)
- Organizations that value continuous learning and professional growth
- Collaborative environments where I can contribute meaningfully while learning
- Teams that build applications with real user impact

Company Culture Preferences:
- Mentorship-oriented: I learn best when I can ask questions and get guidance
- Innovation-focused: Companies that embrace new technologies and best practices
- User-centered: Organizations that prioritize user experience and accessibility
- Growth-minded: Places where I can advance my skills and take on increasing responsibility

🎓 Short-term Goals (Next 1-2 Years):
- Complete my Bachelor's degree with strong academic performance
- Gain professional development experience in a collaborative team environment
- Contribute to meaningful projects that serve real users
- Develop expertise in enterprise-level development practices
- Build professional relationships and learn from experienced developers
- Strengthen my skills in areas like testing, deployment, and code review processes

🌟 Long-term Vision (3-5 Years):
- Become a skilled full-stack developer with expertise in modern web technologies
- Specialize in areas like real-time applications, AI integration, or mobile development
- Eventually take on technical leadership roles and mentor junior developers
- Contribute to open source projects and the broader developer community
- Build software that has meaningful impact on communities and businesses

💡 Specific Interest Areas:
- Modern Web Technologies: React, TypeScript, Node.js, Express.js, and emerging frameworks
- Backend Development: PHP, MySQL, and server-side application development
- Real-time Applications: Building systems with instant updates and collaboration features
- Mobile Development: Cross-platform applications with Flutter (with basic Java knowledge)
- AI Integration: RAG systems, vector databases, and intelligent web applications
- Community-Focused Software: Applications that serve local communities and social good

🤝 What I Bring to a Team:
- Fresh perspective and enthusiasm for modern development practices
- Strong foundation in full-stack development with hands-on project experience
- Collaborative mindset and eagerness to learn from team members
- Problem-solving skills developed through independent project work
- Understanding of user experience and community-focused development
- Ability to communicate technical concepts clearly (great for documentation and team communication)

📞 Ready to Connect:
I'm excited about opportunities where I can apply my skills in React, TypeScript, Node.js, PHP, MySQL, and Flutter while learning enterprise development practices. I'm particularly interested in roles that involve building user-facing applications with real-world impact.

Feel free to reach out if you think there might be a good fit or if you'd like to discuss potential opportunities. I'm always happy to talk about technology, share my project experiences, or learn about interesting development challenges your team is working on!`,
    category: "goals",
    title: "Career Goals & Professional Opportunities",
    source: "portfolio",
    priority: "high",
    context_type: "professional"
  },

  // === CONTACT & COLLABORATION ===
  {
    text: `📬 How to Connect with Me:

Contact Information:
- Name: Ronan Dela Cruz (Ron)
- Mobile: 09760299219
- GitHub: https://github.com/0phl
- School: St. Dominic College of Asia (4th Year IT Student)
- Status: Graduating Student (Expected 2026)

I'm always open to connecting with fellow developers, potential employers, and anyone interested in technology and software development. As a graduating IT student, I'm particularly interested in internship opportunities and entry-level positions.

Professional Networking:
- I'm active in developer communities and enjoy discussing technology trends
- Happy to share insights about my projects and learning journey
- Interested in collaborative projects and learning opportunities
- Open to mentorship relationships and knowledge sharing

Communication Style:
- I prefer clear, direct communication about opportunities and projects
- I'm responsive and professional in all interactions
- I enjoy technical discussions and problem-solving conversations
- I'm comfortable with both formal business communication and casual developer chat

What I'm Happy to Discuss:
- My project experiences and technical decisions
- Learning resources and development best practices
- Opportunities for internships or entry-level positions
- Collaborative projects or open source contributions
- Technology trends and emerging tools
- Challenges in full-stack development and solutions I've found

Response Expectations:
- I typically respond to professional inquiries within 24-48 hours
- I'm thorough in my responses and like to provide helpful context
- I'm honest about my current skill level and learning areas
- I'm enthusiastic about opportunities that align with my interests and goals

Let's build something great together! Whether you're looking for a dedicated team member, a collaborative project partner, or just want to chat about technology, I'd love to hear from you.`,
    category: "contact",
    title: "Professional Communication & Networking",
    source: "portfolio",
    priority: "medium",
    context_type: "contact"
  }
];

module.exports = myPortfolioContent;