import React, { useState } from 'react';
import { produce } from 'https://esm.sh/immer';
import { FormData, Member, Task, BudgetItem, Activity, Report, ActivityStatus, DirectExpense, BudgetItemStatus } from '../types';
import { useAppContext } from '../context/AppContext';
import ConfirmationModal from './ui/ConfirmationModal';

const newId = (prefix: string) => `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

const getBudgetItemId = (project: FormData, category: keyof FormData['budget']['expenses'], source: string): string => {
    const item = project.budget.expenses[category]?.find(i => i.source === source);
    if (!item) {
        console.warn(`Sample Data Warning: Could not find budget item with source '${source}' in category '${category}' for project '${project.projectTitle}'.`);
        return '';
    }
    return item.id;
};

const dateDaysAgo = (days: number): string => {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return date.toISOString().split('T')[0];
};

const rawMembers = [
    {
        firstName: 'Elena', lastName: 'Pascual', email: 'elena.pascual@example.com', province: 'ON', city: 'Toronto',
        shortBio: 'A passionate visual artist with 15+ years of experience in large-scale installations and community art.',
        artistBio: 'Elena Pascual is a visual artist based in Toronto, specializing in immersive installations that explore themes of memory, migration, and the environment. Her work often incorporates natural materials and found objects, creating powerful, site-specific narratives. She has exhibited internationally and is a strong advocate for public art.',
        availability: 'full-time'
    },
    {
        firstName: 'Marcus', lastName: 'Thorne', email: 'marcus.thorne@example.com', province: 'BC', city: 'Vancouver',
        shortBio: 'An accomplished producer and project manager with a focus on interdisciplinary arts and cultural festivals.',
        artistBio: 'With a background in theatre and event production, Marcus Thorne has a proven track record of bringing complex artistic visions to life. He excels at strategic planning, financial management, and stakeholder engagement, ensuring projects are delivered on time and within budget while maintaining artistic integrity.',
        availability: 'contract'
    },
    {
        firstName: 'Aisha', lastName: 'Khan', email: 'aisha.khan@example.com', province: 'QC', city: 'Montreal',
        shortBio: 'A multitalented designer and community organizer skilled in digital media, communications, and public relations.',
        artistBio: 'Aisha Khan is a communications strategist who empowers arts organizations through compelling design and narrative. She specializes in creating integrated campaigns that span digital and print media, fostering community engagement and amplifying the voices of underrepresented artists.',
        availability: 'part-time'
    },
    {
        firstName: 'Samuel', lastName: 'Chen', email: 'samuel.chen@example.com', province: 'MB', city: 'Winnipeg',
        shortBio: 'A gifted composer, sound designer, and multi-instrumentalist working at the intersection of classical, electronic, and folk traditions.',
        artistBio: 'Samuel Chen is a Winnipeg-based composer whose work is known for its emotional depth and textural complexity. He has scored numerous films and dance performances, and his unique blend of acoustic and electronic soundscapes has garnered critical acclaim. He is also a dedicated music educator.',
        availability: 'full-time'
    },
];


const createSampleProjects = (members: Member[]) => {
    const [elena, marcus, aisha, samuel] = members;
    const sumAmounts = (items: BudgetItem[] = []) => items.reduce((sum, item) => sum + (item.amount || 0), 0);

    // --- Project 1: Ancestral Weavers ---
    let p1 = {
        id: newId('proj'),
        projectTitle: 'Ancestral Weavers: A Digital Tapestry',
        status: 'Active',
        artisticDisciplines: ['visual', 'media', 'craft'],
        visualArtsGenres: ['installation', 'mixed-media'],
        mediaGenres: ['video-art', 'audio-art'],
        craftGenres: ['textile', 'fibre'],
        projectStartDate: '2024-10-01',
        projectEndDate: '2025-03-31',
        background: "Building on our collective's history of projects that merge traditional craft with contemporary technology, this initiative seeks to preserve and reinterpret ancestral weaving techniques for a modern audience. We have spent the last two years researching historical textile patterns and building relationships with cultural knowledge keepers, laying the groundwork for a project that is both respectful and innovative.",
        projectDescription: "We will create a large-scale, interactive textile installation that incorporates digitally projected video and a responsive soundscape. The physical tapestry will be hand-woven using traditional methods, while embedded sensors will trigger video projections of weavers' hands and audio narratives from community elders. The project aims to create a multi-sensory experience that bridges generations and explores the stories held within woven patterns, celebrating cultural heritage in a dynamic, accessible format.",
        collaboratorDetails: [
            { memberId: elena.id, role: 'Lead Artist & Weaver' },
            { memberId: aisha.id, role: 'Community Engagement & Media' },
            { memberId: marcus.id, role: 'Project Manager' },
            { memberId: samuel.id, role: 'Sound Designer' }
        ],
        audience: 'The primary audience includes local community members, particularly youth and elders, as well as gallery visitors interested in textile arts, digital media, and cultural heritage. We will reach them through partnerships with community centers, schools, social media campaigns, and local arts publications, culminating in a public exhibition.',
        paymentAndConditions: "All artists, elders, and collaborators will be compensated in accordance with CARFAC/RAAV standards. We are committed to creating a safe, inclusive, and respectful work environment, with clear communication protocols and regular team check-ins. All participants will retain ownership of their individual contributions.",
        culturalIntegrity: "This project is founded on deep consultation with Indigenous Knowledge Keepers who are central to the project's development and will be compensated for their expertise. Their guidance ensures that the stories and patterns are represented with honor and accuracy. We will follow strict protocols for handling cultural materials and knowledge, ensuring the project serves as a respectful tribute, not an appropriation.",
        whoWillWork: "Elena Pascual will lead the artistic vision and weaving process. Aisha Khan will manage community outreach, document the process, and develop promotional materials. Marcus Thorne will oversee the budget, timeline, and logistics. Samuel Chen will compose and produce the responsive soundscape.",
        howSelectionDetermined: "The core team was selected for their specific expertise and shared commitment to culturally sensitive art practices. Additional participants and storytellers from the community will be invited through our established partnerships, ensuring authentic representation.",
        budget: {
            revenues: {
                grants: [
                    { id: newId('b'), source: 'mac', description: 'This funding application', amount: 15000, status: 'Pending' as BudgetItemStatus },
                    { id: newId('b'), source: 'federalCanada', description: 'Digital Justice Grant', amount: 10000, actualAmount: 8000, status: 'Approved' as BudgetItemStatus },
                ],
                contributions: [
                    { id: newId('b'), source: 'inKindPartners', description: 'Gallery exhibition space', amount: 4000, actualAmount: 4000, status: 'Approved' as BudgetItemStatus },
                    { id: newId('b'), source: 'financialPartners', description: 'Sponsorship from Tech Manitoba', amount: 3000, actualAmount: 3000, status: 'Approved' as BudgetItemStatus },
                ],
                tickets: { numVenues: 0, percentCapacity: 0, venueCapacity: 0, avgTicketPrice: 0, description: '' },
                sales: [],
                fundraising: [],
            },
            expenses: {
                professionalFees: [
                    { id: newId('b'), source: 'artists', description: 'Lead Artist Fee (Elena)', amount: 8000 },
                    { id: newId('b'), source: 'designers', description: 'Sound Designer Fee (Samuel)', amount: 5000 },
                    { id: newId('b'), source: 'indigenous', description: 'Honoraria for Knowledge Keepers', amount: 3000 },
                    { id: newId('b'), source: 'consultant', description: 'Technical consultant for interactive display', amount: 2500 }
                ],
                production: [
                    { id: newId('b'), source: 'materials', description: 'Yarn, dye, loom parts, textiles', amount: 3500 },
                    { id: newId('b'), source: 'equipment', description: 'Projector, speakers, sensors', amount: 4000 },
                ],
                administration: [
                    { id: newId('b'), source: 'promotion', description: 'Marketing materials, social media', amount: 1200 },
                    { id: newId('b'), source: 'workshops', description: 'Community consultation costs', amount: 800 },
                ],
                travel: [ { id: newId('b'), source: 'transportation', description: 'Travel for elder consultation', amount: 500 }],
                research: [],
                professionalDevelopment: []
            },
        },
    } as unknown as FormData;

    // --- Project 2: Urban Echoes ---
    let p2 = {
        id: newId('proj'),
        projectTitle: 'Urban Echoes: A City Symphony',
        status: 'On Hold',
        artisticDisciplines: ['music', 'media'],
        musicGenres: ['electro-acoustic', 'new-music', 'instrumental'],
        mediaGenres: ['audio-art', 'documentary'],
        projectStartDate: '2025-05-01',
        projectEndDate: '2025-10-31',
        background: "Our collective is fascinated by the sonic landscapes of urban environments. This project follows our previous explorations into site-specific audio works, but on a much larger scale. We aim to capture the unique rhythm and voice of the city, transforming everyday sounds into a cohesive musical piece.",
        projectDescription: "We will create a 'city symphony' by recording, cataloging, and composing with found sounds from various Winnipeg neighborhoods. The final piece will be a multi-channel audio installation in a public space, accompanied by a short documentary film about the process and the people whose sounds are featured. The project celebrates the city's auditory identity and challenges audiences to listen more deeply to their surroundings.",
        collaboratorDetails: [
            { memberId: samuel.id, role: 'Lead Composer & Sound Artist' },
            { memberId: marcus.id, role: 'Producer & Location Manager' },
            { memberId: aisha.id, role: 'Documentary Filmmaker' }
        ],
        audience: "The audience includes new music enthusiasts, urban explorers, documentary film lovers, and the general public who frequent the presentation space. Promotion will be handled through music blogs, local radio, university partnerships, and targeted social media to reach people interested in sound art and urbanism.",
        paymentAndConditions: "All core artists and any paid assistants will receive fees based on industry standards. We will obtain clear, informed consent from anyone whose voice or distinct sound is featured in the final work. Safety protocols will be in place for all on-location recording sessions.",
        culturalIntegrity: "The project will be conducted with deep respect for the diverse neighborhoods we work in. We will actively engage with community members to ensure our recordings are representative and not intrusive. The documentary component will give voice to residents, allowing them to share the significance of their sonic environment, ensuring the project is a collaboration with the city, not an extraction from it.",
        whoWillWork: "Samuel Chen will lead the artistic direction, conducting field recordings and composing the symphony. Marcus Thorne will manage all production logistics, securing permits and scheduling. Aisha Khan will direct and produce the accompanying documentary film, capturing the human stories behind the sounds.",
        howSelectionDetermined: "The team was assembled based on their direct expertise in sound art, production, and filmmaking. Community participants for the documentary will be found through on-the-ground engagement during the recording process.",
        budget: {
            revenues: {
                tickets: { numVenues: 0, percentCapacity: 0, venueCapacity: 0, avgTicketPrice: 0, description: '' },
                fundraising: [ { id: newId('b'), source: 'crowdsourcing', description: 'Kickstarter for documentary post-production', amount: 4000, actualAmount: 4500, status: 'Approved' as BudgetItemStatus } ],
                grants: [ 
                    { id: newId('b'), source: 'mac', description: 'This application', amount: 12000, status: 'Pending' as BudgetItemStatus },
                    { id: newId('b'), source: 'municipalWinnipeg', description: 'WAC Individual Artist Grant', amount: 5000, actualAmount: 5000, status: 'Approved' as BudgetItemStatus }
                ],
                sales: [],
                contributions: [],
            },
            expenses: {
                professionalFees: [
                    { id: newId('b'), source: 'artists', description: 'Lead Composer Fee (Samuel)', amount: 7000 },
                    { id: newId('b'), source: 'consultant', description: 'Filmmaker Fee (Aisha)', amount: 5000 },
                ],
                production: [
                    { id: newId('b'), source: 'equipment', description: 'Specialized microphones, audio recorder', amount: 3000 },
                    { id: newId('b'), source: 'rentals', description: 'Audio post-production suite rental', amount: 2000 },
                ],
                travel: [ { id: newId('b'), source: 'transportation', description: 'Mileage for city-wide recording', amount: 500 } ],
                administration: [
                    { id: newId('b'), source: 'promotion', description: 'Online promotion for premiere', amount: 1500 },
                    { id: newId('b'), source: 'other', description: 'Data storage and hard drives', amount: 500 }
                ],
                research: [], 
                professionalDevelopment: [{ id: newId('b'), source: 'professionalDevelopment', description: 'Masterclass in field recording', amount: 1500 }]
            }
        }
    } as unknown as FormData;

    // --- Project 3: The Story Exchange ---
    let p3 = {
        id: newId('proj'),
        projectTitle: 'The Story Exchange Platform',
        status: 'Completed',
        artisticDisciplines: ['literary', 'theatre', 'multi-disciplinary'],
        literaryGenres: ['storytelling', 'spoken-word'],
        theatreGenres: ['devised-theatre', 'playwriting'],
        projectStartDate: '2025-01-15',
        projectEndDate: '2025-06-30',
        background: "This project is a direct response to the community's desire for more platforms for personal narrative and connection. Our previous workshops have shown a need for an ongoing space where stories can be shared and developed, moving beyond a one-off event into a sustainable practice of community dialogue.",
        projectDescription: "We will develop an online platform and a series of in-person workshops that facilitate the exchange of personal stories. Participants will be guided through a structured process of story development and performance. The online platform will serve as a living archive of these stories (with permission), and the workshops will culminate in a public performance. The goal is to build empathy and community through the power of shared experience.",
        collaboratorDetails: [
            { memberId: aisha.id, role: 'Lead Facilitator & Platform Manager' },
            { memberId: marcus.id, role: 'Producer & Event Coordinator' },
            { memberId: elena.id, role: 'Guest Instructor (Visual Storytelling)' }
        ],
        audience: "The primary participants are aspiring storytellers from all walks of life in Manitoba. The audience for the final performance will be the general public. We will reach participants through an open call promoted via writing groups, community theatres, libraries, and social media. The performance will be promoted to a broad audience.",
        paymentAndConditions: "All facilitators and guest instructors will be paid professional fees. Participants will not be charged a fee to ensure accessibility. We will create a brave and supportive space for sharing personal narratives, with clear ground rules for respectful listening and feedback. Participants will retain full rights to their stories.",
        culturalIntegrity: "The project is designed to be inclusive of all cultural backgrounds. We will actively seek a diverse group of participants and ensure our facilitation methods are culturally sensitive and trauma-informed. The platform will allow users to self-identify and contextualize their stories, ensuring their narratives are presented on their own terms.",
        whoWillWork: "Aisha Khan will lead the overall project, facilitate the workshops, and manage the online platform. Marcus Thorne will produce the final performance event and manage the project budget. Elena Pascual will be brought in as a guest instructor to lead a special workshop on incorporating visual elements into storytelling.",
        howSelectionDetermined: "Participants will be selected through an application process that prioritizes enthusiasm and commitment over prior experience. The selection panel will aim to create a diverse and balanced cohort. Guest instructors are chosen based on their expertise and ability to provide a unique perspective on storytelling.",
        budget: {
            revenues: {
                grants: [
                    { id: newId('b'), source: 'mac', description: 'This application', amount: 9000, status: 'Approved' as BudgetItemStatus, actualAmount: 9000 },
                    { id: newId('b'), source: 'provincialOther', description: 'Community Wellness Grant', amount: 5000, actualAmount: 5000, status: 'Denied' as BudgetItemStatus },
                ],
                fundraising: [
                    { id: newId('b'), source: 'donations', description: 'Donations at final performance', amount: 1000, actualAmount: 1250, status: 'Approved' as BudgetItemStatus }
                ],
                contributions: [],
                tickets: { numVenues: 0, percentCapacity: 0, venueCapacity: 0, avgTicketPrice: 0, description: '' },
                sales: [],
            },
            expenses: {
                professionalFees: [
                    { id: newId('b'), source: 'artists', description: 'Lead Facilitator Fee (Aisha)', amount: 6000 },
                    { id: newId('b'), source: 'consultant', description: 'Guest Instructor Fee (Elena)', amount: 1000 },
                ],
                production: [
                    { id: newId('b'), source: 'rentals', description: 'Venue rental for final performance', amount: 1500 },
                ],
                administration: [
                    { id: newId('b'), source: 'workshops', description: 'Workshop materials & catering', amount: 1000 },
                    { id: newId('b'), source: 'promotion', description: 'Promotion for call for participants & show', amount: 1000 },
                ],
                research: [
                    { id: newId('b'), source: 'research', description: 'Web platform development & hosting', amount: 3500 },
                ],
                travel: [],
                professionalDevelopment: []
            }
        },
    } as unknown as FormData;

    // Balance budgets
    [p1, p2, p3].forEach(p => {
        const totalRevenue = Object.values(p.budget.revenues).flat().reduce((sum, item) => {
            if (typeof item === 'object' && 'amount' in item) return sum + item.amount;
            return sum;
        }, 0) + (p.budget.revenues.tickets.numVenues * (p.budget.revenues.tickets.percentCapacity/100) * p.budget.revenues.tickets.venueCapacity * p.budget.revenues.tickets.avgTicketPrice);

        const totalExpenses = Object.values(p.budget.expenses).flat().reduce((sum, item) => sum + item.amount, 0);

        if (totalRevenue !== totalExpenses) {
            console.warn(`Project "${p.projectTitle}" budget is unbalanced. Revenue: ${totalRevenue}, Expenses: ${totalExpenses}. This will be auto-balanced in the sample data but indicates a configuration error.`);
            const difference = totalRevenue - totalExpenses;
            const primaryFeeItem = p.budget.expenses.professionalFees[0];
            if(primaryFeeItem) {
                primaryFeeItem.amount += difference;
            }
        }
    });

    return [p1, p2, p3].map(p => ({
      ...p,
      craftGenres: p.craftGenres || [],
      danceGenres: p.danceGenres || [],
      literaryGenres: p.literaryGenres || [],
      mediaGenres: p.mediaGenres || [],
      musicGenres: p.musicGenres || [],
      theatreGenres: p.theatreGenres || [],
      visualArtsGenres: p.visualArtsGenres || [],
      otherArtisticDisciplineSpecify: '',
      activityType: 'public-presentation',
      permissionConfirmationFiles: [],
      schedule: 'A detailed schedule with milestones and deadlines is being finalized and will be available shortly.',
      additionalInfo: 'No additional information provided at this time.',
    }));
};

const createSampleTasks = (projects: FormData[], members: Member[]): Task[] => {
    const [p1, p2, p3] = projects;
    const [elena, marcus, aisha, samuel] = members;

    const tasks: Task[] = [
        // --- Project 1: Ancestral Weavers Tasks (20 tasks) ---
        { id: newId('task'), taskCode: 'AWDT-01', projectId: p1.id, title: 'Finalize Elder Consultation Schedule', description: 'Coordinate with all Knowledge Keepers to set dates for initial consultation meetings.', assignedMemberId: marcus.id, status: 'To Do', startDate: dateDaysAgo(150), dueDate: dateDaysAgo(140), taskType: 'Milestone', isComplete: false, estimatedHours: 0, actualHours: 0, budgetItemId: '', workType: 'Paid', hourlyRate: 0, updatedAt: dateDaysAgo(150) },
        { id: newId('task'), taskCode: 'AWDT-02', projectId: p1.id, title: 'Research Historical Weaving Patterns', description: 'Conduct archival research and initial pattern analysis.', assignedMemberId: elena.id, status: 'Done', startDate: dateDaysAgo(140), dueDate: dateDaysAgo(120), taskType: 'Time-Based', isComplete: true, estimatedHours: 40, actualHours: 0, budgetItemId: getBudgetItemId(p1, 'professionalFees', 'artists'), workType: 'Paid', hourlyRate: 70, updatedAt: dateDaysAgo(130) },
        { id: newId('task'), taskCode: 'AWDT-03', projectId: p1.id, title: 'Conduct First Elder Consultation', description: 'Hold the initial meeting to discuss project vision and cultural protocols.', assignedMemberId: aisha.id, status: 'Done', startDate: dateDaysAgo(135), dueDate: dateDaysAgo(135), taskType: 'Time-Based', isComplete: true, estimatedHours: 8, actualHours: 0, budgetItemId: getBudgetItemId(p1, 'professionalFees', 'indigenous'), workType: 'Paid', hourlyRate: 100, updatedAt: dateDaysAgo(135) },
        { id: newId('task'), taskCode: 'AWDT-04', projectId: p1.id, title: 'Source and Purchase Weaving Materials', description: 'Order all yarn, natural dyes, and loom components.', assignedMemberId: marcus.id, status: 'Done', startDate: dateDaysAgo(120), dueDate: dateDaysAgo(110), taskType: 'Milestone', isComplete: true, estimatedHours: 0, actualHours: 0, budgetItemId: '', workType: 'Paid', hourlyRate: 0, updatedAt: dateDaysAgo(115) },
        { id: newId('task'), taskCode: 'AWDT-05', projectId: p1.id, title: 'Develop Sound Concept & Palette', description: 'Create initial sound design concepts based on research and consultation.', assignedMemberId: samuel.id, status: 'In Progress', startDate: dateDaysAgo(115), dueDate: dateDaysAgo(90), taskType: 'Time-Based', isComplete: false, estimatedHours: 30, actualHours: 0, budgetItemId: getBudgetItemId(p1, 'professionalFees', 'designers'), workType: 'Paid', hourlyRate: 60, updatedAt: dateDaysAgo(100) },
        { id: newId('task'), taskCode: 'AWDT-06', projectId: p1.id, title: 'Design Interactive Sensor System', description: 'Plan the hardware and software for the interactive components.', assignedMemberId: marcus.id, status: 'In Progress', startDate: dateDaysAgo(110), dueDate: dateDaysAgo(80), taskType: 'Time-Based', isComplete: false, estimatedHours: 35, actualHours: 0, budgetItemId: getBudgetItemId(p1, 'professionalFees', 'consultant'), workType: 'Paid', hourlyRate: 80, updatedAt: dateDaysAgo(95) },
        { id: newId('task'), taskCode: 'AWDT-07', projectId: p1.id, title: 'Begin Weaving - Section 1', description: 'Start the first major section of the physical tapestry.', assignedMemberId: elena.id, status: 'In Progress', startDate: dateDaysAgo(100), dueDate: dateDaysAgo(60), taskType: 'Time-Based', isComplete: false, estimatedHours: 80, actualHours: 0, budgetItemId: getBudgetItemId(p1, 'professionalFees', 'artists'), workType: 'Paid', hourlyRate: 70, updatedAt: dateDaysAgo(80) },
        { id: newId('task'), taskCode: 'AWDT-08', projectId: p1.id, title: 'Record Elder Narratives - Part 1', description: 'First round of audio recording sessions for the soundscape.', assignedMemberId: samuel.id, status: 'To Do', startDate: dateDaysAgo(85), dueDate: dateDaysAgo(80), taskType: 'Time-Based', isComplete: false, estimatedHours: 16, actualHours: 0, budgetItemId: getBudgetItemId(p1, 'professionalFees', 'designers'), workType: 'Paid', hourlyRate: 60, updatedAt: dateDaysAgo(85) },
        { id: newId('task'), taskCode: 'AWDT-09', projectId: p1.id, title: 'Develop Promotional Materials', description: 'Create initial designs for flyers, social media, and press kits.', assignedMemberId: aisha.id, status: 'To Do', startDate: dateDaysAgo(80), dueDate: dateDaysAgo(70), taskType: 'Time-Based', isComplete: false, estimatedHours: 25, actualHours: 0, budgetItemId: getBudgetItemId(p1, 'administration', 'promotion'), workType: 'Paid', hourlyRate: 55, updatedAt: dateDaysAgo(80) },
        { id: newId('task'), taskCode: 'AWDT-10', projectId: p1.id, title: 'Purchase Projector and Speakers', description: 'Finalize and purchase AV equipment.', assignedMemberId: marcus.id, status: 'To Do', startDate: dateDaysAgo(75), dueDate: dateDaysAgo(65), taskType: 'Milestone', isComplete: false, estimatedHours: 0, actualHours: 0, budgetItemId: '', workType: 'Paid', hourlyRate: 0, updatedAt: dateDaysAgo(75) },
        { id: newId('task'), taskCode: 'AWDT-11', projectId: p1.id, title: 'Weaving - Section 2', description: 'Continue with the second large section of the tapestry.', assignedMemberId: elena.id, status: 'To Do', startDate: dateDaysAgo(59), dueDate: dateDaysAgo(20), taskType: 'Time-Based', isComplete: false, estimatedHours: 80, actualHours: 0, budgetItemId: getBudgetItemId(p1, 'professionalFees', 'artists'), workType: 'Paid', hourlyRate: 70, updatedAt: dateDaysAgo(59) },
        { id: newId('task'), taskCode: 'AWDT-12', projectId: p1.id, title: 'Prototype Interactive System', description: 'Build and test a small-scale version of the sensor and projection system.', assignedMemberId: marcus.id, status: 'Backlog', startDate: dateDaysAgo(55), dueDate: dateDaysAgo(40), taskType: 'Time-Based', isComplete: false, estimatedHours: 40, actualHours: 0, budgetItemId: getBudgetItemId(p1, 'professionalFees', 'consultant'), workType: 'Paid', hourlyRate: 80, updatedAt: dateDaysAgo(55) },
        { id: newId('task'), taskCode: 'AWDT-13', projectId: p1.id, title: 'Edit and Mix Audio Narratives', description: 'Process and master the recorded elder stories.', assignedMemberId: samuel.id, status: 'Backlog', startDate: dateDaysAgo(50), dueDate: dateDaysAgo(30), taskType: 'Time-Based', isComplete: false, estimatedHours: 50, actualHours: 0, budgetItemId: getBudgetItemId(p1, 'professionalFees', 'designers'), workType: 'Paid', hourlyRate: 60, updatedAt: dateDaysAgo(50) },
        { id: newId('task'), taskCode: 'AWDT-14', projectId: p1.id, title: 'Video Content Creation', description: 'Film and edit video assets for projection.', assignedMemberId: aisha.id, status: 'Backlog', startDate: dateDaysAgo(45), dueDate: dateDaysAgo(25), taskType: 'Time-Based', isComplete: false, estimatedHours: 60, actualHours: 0, budgetItemId: getBudgetItemId(p1, 'administration', 'promotion'), workType: 'Paid', hourlyRate: 55, updatedAt: dateDaysAgo(45) },
        { id: newId('task'), taskCode: 'AWDT-15', projectId: p1.id, title: 'Final Weaving and Finishing', description: 'Complete the tapestry and prepare it for installation.', assignedMemberId: elena.id, status: 'Backlog', startDate: dateDaysAgo(19), dueDate: dateDaysAgo(5), taskType: 'Time-Based', isComplete: false, estimatedHours: 60, actualHours: 0, budgetItemId: getBudgetItemId(p1, 'professionalFees', 'artists'), workType: 'Paid', hourlyRate: 70, updatedAt: dateDaysAgo(19) },
        { id: newId('task'), taskCode: 'AWDT-16', projectId: p1.id, title: 'Integrate AV and Textile Components', description: 'Combine the physical tapestry with the interactive technology.', assignedMemberId: marcus.id, status: 'Backlog', startDate: dateDaysAgo(15), dueDate: dateDaysAgo(1), taskType: 'Time-Based', isComplete: false, estimatedHours: 30, actualHours: 0, budgetItemId: getBudgetItemId(p1, 'professionalFees', 'consultant'), workType: 'Paid', hourlyRate: 80, updatedAt: dateDaysAgo(15) },
        { id: newId('task'), taskCode: 'AWDT-17', projectId: p1.id, title: 'Plan Installation Logistics', description: 'Create a detailed plan for installing the work in the gallery.', assignedMemberId: marcus.id, status: 'Backlog', startDate: dateDaysAgo(10), dueDate: dateDaysAgo(1), taskType: 'Time-Based', isComplete: false, estimatedHours: 15, actualHours: 0, budgetItemId: getBudgetItemId(p1, 'administration', 'workshops'), workType: 'Paid', hourlyRate: 65, updatedAt: dateDaysAgo(10) },
        { id: newId('task'), taskCode: 'AWDT-18', projectId: p1.id, title: 'Final Sound Design Integration', description: 'Final mix and integration of the soundscape with the interactive system.', assignedMemberId: samuel.id, status: 'Backlog', startDate: dateDaysAgo(10), dueDate: dateDaysAgo(2), taskType: 'Time-Based', isComplete: false, estimatedHours: 25, actualHours: 0, budgetItemId: getBudgetItemId(p1, 'professionalFees', 'designers'), workType: 'Paid', hourlyRate: 60, updatedAt: dateDaysAgo(10) },
        { id: newId('task'), taskCode: 'AWDT-19', projectId: p1.id, title: 'Launch Marketing Campaign', description: 'Execute the main promotional push for the exhibition opening.', assignedMemberId: aisha.id, status: 'Backlog', startDate: dateDaysAgo(30), dueDate: dateDaysAgo(1), taskType: 'Time-Based', isComplete: false, estimatedHours: 20, actualHours: 0, budgetItemId: getBudgetItemId(p1, 'administration', 'promotion'), workType: 'Paid', hourlyRate: 55, updatedAt: dateDaysAgo(30) },
        { id: newId('task'), taskCode: 'AWDT-20', projectId: p1.id, title: 'Exhibition Installation', description: 'Install the completed work in the gallery space.', assignedMemberId: marcus.id, status: 'Backlog', startDate: dateDaysAgo(4), dueDate: dateDaysAgo(1), taskType: 'Time-Based', isComplete: false, estimatedHours: 40, actualHours: 0, budgetItemId: getBudgetItemId(p1, 'production', 'equipment'), workType: 'Volunteer', hourlyRate: 25, updatedAt: dateDaysAgo(4) },

        // --- Project 2: Urban Echoes Tasks (20 tasks) ---
        { id: newId('task'), taskCode: 'UECS-01', projectId: p2.id, title: 'Scout Recording Locations', description: 'Identify and get permissions for 10-15 key recording locations across the city.', assignedMemberId: marcus.id, status: 'Done', startDate: dateDaysAgo(120), dueDate: dateDaysAgo(100), taskType: 'Time-Based', isComplete: true, estimatedHours: 30, actualHours: 0, budgetItemId: getBudgetItemId(p2, 'travel', 'transportation'), workType: 'Paid', hourlyRate: 65, updatedAt: dateDaysAgo(110) },
        { id: newId('task'), taskCode: 'UECS-02', projectId: p2.id, title: 'Purchase Field Recording Equipment', description: 'Acquire specialized microphones and a portable recorder.', assignedMemberId: marcus.id, status: 'Done', startDate: dateDaysAgo(115), dueDate: dateDaysAgo(110), taskType: 'Milestone', isComplete: true, estimatedHours: 0, actualHours: 0, budgetItemId: '', workType: 'Paid', hourlyRate: 0, updatedAt: dateDaysAgo(112) },
        { id: newId('task'), taskCode: 'UECS-03', projectId: p2.id, title: 'Attend Field Recording Masterclass', description: 'Attend workshop to refine advanced recording techniques.', assignedMemberId: samuel.id, status: 'Done', startDate: dateDaysAgo(100), dueDate: dateDaysAgo(98), taskType: 'Time-Based', isComplete: true, estimatedHours: 16, actualHours: 0, budgetItemId: getBudgetItemId(p2, 'professionalDevelopment', 'professionalDevelopment'), workType: 'Paid', hourlyRate: 60, updatedAt: dateDaysAgo(99) },
        { id: newId('task'), taskCode: 'UECS-04', projectId: p2.id, title: 'Field Recording - Phase 1 (Industrial)', description: 'Capture sounds from industrial areas and transportation hubs.', assignedMemberId: samuel.id, status: 'In Progress', startDate: dateDaysAgo(90), dueDate: dateDaysAgo(70), taskType: 'Time-Based', isComplete: false, estimatedHours: 40, actualHours: 0, budgetItemId: getBudgetItemId(p2, 'professionalFees', 'artists'), workType: 'Paid', hourlyRate: 60, updatedAt: dateDaysAgo(80) },
        { id: newId('task'), taskCode: 'UECS-05', projectId: p2.id, title: 'Develop Documentary Treatment', description: 'Create a detailed plan and storyboard for the documentary.', assignedMemberId: aisha.id, status: 'In Progress', startDate: dateDaysAgo(90), dueDate: dateDaysAgo(75), taskType: 'Time-Based', isComplete: false, estimatedHours: 25, actualHours: 0, budgetItemId: getBudgetItemId(p2, 'professionalFees', 'consultant'), workType: 'Paid', hourlyRate: 55, updatedAt: dateDaysAgo(85) },
        { id: newId('task'), taskCode: 'UECS-06', projectId: p2.id, title: 'Field Recording - Phase 2 (Residential)', description: 'Capture sounds from diverse residential neighborhoods.', assignedMemberId: samuel.id, status: 'To Do', startDate: dateDaysAgo(69), dueDate: dateDaysAgo(50), taskType: 'Time-Based', isComplete: false, estimatedHours: 40, actualHours: 0, budgetItemId: getBudgetItemId(p2, 'professionalFees', 'artists'), workType: 'Paid', hourlyRate: 60, updatedAt: dateDaysAgo(69) },
        { id: newId('task'), taskCode: 'UECS-07', projectId: p2.id, title: 'Initial Documentary Filming', description: 'Film b-roll and initial interviews during recording sessions.', assignedMemberId: aisha.id, status: 'To Do', startDate: dateDaysAgo(69), dueDate: dateDaysAgo(50), taskType: 'Time-Based', isComplete: false, estimatedHours: 60, actualHours: 0, budgetItemId: getBudgetItemId(p2, 'professionalFees', 'consultant'), workType: 'Paid', hourlyRate: 55, updatedAt: dateDaysAgo(69) },
        // --- The Story Exchange Tasks (Project 3) ---
        { id: newId('task'), taskCode: 'TSEP-01', projectId: p3.id, title: 'Develop Web Platform Specs', description: 'Create detailed technical specifications for the story exchange website.', assignedMemberId: aisha.id, status: 'Done', startDate: dateDaysAgo(100), dueDate: dateDaysAgo(80), taskType: 'Time-Based', isComplete: true, estimatedHours: 30, actualHours: 0, budgetItemId: getBudgetItemId(p3, 'research', 'research'), workType: 'Paid', hourlyRate: 60, updatedAt: dateDaysAgo(85) },
        { id: newId('task'), taskCode: 'TSEP-02', projectId: p3.id, title: 'Design Workshop Curriculum', description: 'Outline the full curriculum for the in-person storytelling workshops.', assignedMemberId: aisha.id, status: 'In Progress', startDate: dateDaysAgo(79), dueDate: dateDaysAgo(60), taskType: 'Time-Based', isComplete: false, estimatedHours: 40, actualHours: 0, budgetItemId: getBudgetItemId(p3, 'professionalFees', 'artists'), workType: 'Paid', hourlyRate: 60, updatedAt: dateDaysAgo(70) },
        { id: newId('task'), taskCode: 'TSEP-03', projectId: p3.id, title: 'Issue Call for Participants', description: 'Create and distribute the call for workshop participants.', assignedMemberId: marcus.id, status: 'To Do', startDate: dateDaysAgo(59), dueDate: dateDaysAgo(45), taskType: 'Time-Based', isComplete: false, estimatedHours: 15, actualHours: 0, budgetItemId: getBudgetItemId(p3, 'administration', 'promotion'), workType: 'Paid', hourlyRate: 65, updatedAt: dateDaysAgo(59) },
        { id: newId('task'), taskCode: 'TSEP-04', projectId: p3.id, title: 'Select Workshop Cohort', description: 'Review applications and select the final group of participants.', assignedMemberId: aisha.id, status: 'Backlog', startDate: dateDaysAgo(44), dueDate: dateDaysAgo(40), taskType: 'Milestone', isComplete: false, estimatedHours: 0, actualHours: 0, budgetItemId: '', workType: 'Paid', hourlyRate: 0, updatedAt: dateDaysAgo(44) },
    ];
    return tasks;
};

const createSampleActivities = (tasks: Task[], members: Member[]): Activity[] => {
    const findTask = (code: string) => tasks.find(t => t.taskCode === code);
    const [elena, marcus, aisha, samuel] = members;

    const activityData: {taskCode: string, member: Member, desc: string, hours: number, status: ActivityStatus, daysAgo: number, startTime?: string, endTime?: string}[] = [
        { taskCode: 'AWDT-02', member: elena, desc: 'Work segment 1 for task: Research Historical Weaving Patterns.', hours: 40, status: 'Approved', daysAgo: 130 },
        { taskCode: 'AWDT-03', member: aisha, desc: 'Work segment 1 for task: Conduct First Elder Consultation.', hours: 2, status: 'Approved', daysAgo: 135, startTime: '10:00', endTime: '12:00' },
        { taskCode: 'AWDT-03', member: marcus, desc: 'Work segment 2 for task: Conduct First Elder Consultation.', hours: 2, status: 'Approved', daysAgo: 135 },
        { taskCode: 'AWDT-03', member: elena, desc: 'Work segment 3 for task: Conduct First Elder Consultation.', hours: 2, status: 'Approved', daysAgo: 135 },
        { taskCode: 'AWDT-05', member: samuel, desc: 'Work segment 1 for task: Develop Sound Concept & Palette.', hours: 30, status: 'Approved', daysAgo: 100 },
        { taskCode: 'AWDT-06', member: marcus, desc: 'Work segment 1 for task: Design Interactive Sensor System.', hours: 35, status: 'Approved', daysAgo: 95 },
        { taskCode: 'AWDT-07', member: elena, desc: 'Work segment 1 for task: Begin Weaving - Section 1.', hours: 40, status: 'Approved', daysAgo: 80 },
        { taskCode: 'AWDT-07', member: elena, desc: 'Work segment 2 for task: Begin Weaving - Section 1.', hours: 40, status: 'Pending', daysAgo: 61 },
        { taskCode: 'UECS-01', member: marcus, desc: 'Work segment 1 for task: Scout Recording Locations.', hours: 30, status: 'Approved', daysAgo: 110 },
        { taskCode: 'UECS-03', member: samuel, desc: 'Work segment 1 for task: Attend Field Recording Masterclass.', hours: 16, status: 'Approved', daysAgo: 99 },
        { taskCode: 'UECS-04', member: samuel, desc: 'Work segment 1 for task: Field Recording - Phase 1 (Industrial).', hours: 40, status: 'Approved', daysAgo: 80 },
        { taskCode: 'UECS-05', member: aisha, desc: 'Work segment 1 for task: Develop Documentary Treatment.', hours: 25, status: 'Approved', daysAgo: 85 },
        { taskCode: 'TSEP-01', member: aisha, desc: 'Work segment 1 for task: Develop Web Platform Specs.', hours: 30, status: 'Approved', daysAgo: 85 },
        { taskCode: 'TSEP-02', member: aisha, desc: 'Work segment 1 for task: Design Workshop Curriculum.', hours: 40, status: 'Pending', daysAgo: 70 },
    ];

    return activityData.map(data => {
        const task = findTask(data.taskCode);
        if (!task) return null;
        const updateDate = dateDaysAgo(data.daysAgo);
        const newActivity = {
            id: newId('act'),
            taskId: task.id,
            memberId: data.member.id,
            description: data.desc,
            startDate: dateDaysAgo(data.daysAgo + 1),
            endDate: dateDaysAgo(data.daysAgo),
            hours: data.hours,
            status: data.status,
            createdAt: updateDate,
            updatedAt: updateDate,
            startTime: data.startTime,
            endTime: data.endTime,
        };
        // This check fixes a type error where filter expects a boolean
        if (newActivity.startTime === undefined) delete newActivity.startTime;
        if (newActivity.endTime === undefined) delete newActivity.endTime;

        return newActivity as Activity;
    }).filter((a): a is Activity => a !== null);
};

const createSampleDirectExpenses = (projects: FormData[]): DirectExpense[] => {
    const [p1, p2, p3] = projects;
    return [
        {
            id: newId('dexp'),
            projectId: p1.id,
            budgetItemId: getBudgetItemId(p1, 'production', 'materials'),
            amount: 350,
            date: dateDaysAgo(118),
            description: 'Urgent order of special dye'
        },
        {
            id: newId('dexp'),
            projectId: p1.id,
            budgetItemId: getBudgetItemId(p1, 'travel', 'transportation'),
            amount: 75.50,
            date: dateDaysAgo(135),
            description: 'Taxi voucher for Elder'
        },
        {
            id: newId('dexp'),
            projectId: p2.id,
            budgetItemId: getBudgetItemId(p2, 'administration', 'other'),
            amount: 129.99,
            date: dateDaysAgo(110),
            description: 'LaCie Rugged Hard Drive for field recordings'
        },
    ];
};

const DetailedSampleData: React.FC = () => {
    const { setProjects, setMembers, setTasks, setActivities, setDirectExpenses, setReports, notify, clearAllData } = useAppContext();
    const [isClearModalOpen, setIsClearModalOpen] = useState(false);

    const handleLoadData = () => {
        const newMembers = rawMembers.map(m => ({
            ...m,
            id: newId('mem'),
            memberId: `M-${Math.floor(1000 + Math.random() * 9000)}`,
            postalCode: 'A1A 1A1',
            imageUrl: `https://i.pravatar.cc/256?u=${m.email}`
        }));
        
        const newProjects = createSampleProjects(newMembers);
        const newTasks = createSampleTasks(newProjects, newMembers);
        const newActivities = createSampleActivities(newTasks, newMembers);
        const newDirectExpenses = createSampleDirectExpenses(newProjects);
        
        setMembers(newMembers);
        setProjects(newProjects);
        setTasks(newTasks);
        setActivities(newActivities);
        setDirectExpenses(newDirectExpenses);
        setReports([]); // Clear old reports

        notify('Detailed sample data loaded successfully!', 'success');
    };

    const confirmClearData = () => {
        clearAllData();
        setIsClearModalOpen(false);
    };

    return (
        <div className="bg-white shadow-lg rounded-xl p-6 sm:p-8">
             {isClearModalOpen && (
                <ConfirmationModal
                    isOpen={isClearModalOpen}
                    onClose={() => setIsClearModalOpen(false)}
                    onConfirm={confirmClearData}
                    title="Clear All Application Data"
                    message={
                        <>
                            Are you absolutely sure you want to delete ALL application data? 
                            This includes all projects, members, tasks, and activities.
                            <br />
                            <strong className="font-bold text-red-700">This action cannot be undone.</strong>
                        </>
                    }
                    confirmButtonText="Yes, Delete Everything"
                />
            )}
            <div className="text-center">
                <i className="fa-solid fa-database text-6xl text-blue-500"></i>
                <h1 className="mt-4 text-3xl font-bold text-slate-900">Load Detailed Sample Data</h1>
                <p className="mt-2 text-lg text-slate-600 max-w-2xl mx-auto">This tool will populate the application with a rich, interconnected set of data, including multiple projects, members, tasks, and logged activities. It is ideal for testing reporting and financial tracking features.</p>
                
                <div className="mt-6 bg-red-100 border-l-4 border-red-500 text-red-800 p-4 max-w-2xl mx-auto text-left">
                    <div className="flex">
                        <div className="py-1"><i className="fa-solid fa-triangle-exclamation mr-3"></i></div>
                        <div>
                            <p className="font-bold">Warning!</p>
                            <p className="text-sm">Loading this data will <strong className="uppercase">completely replace</strong> any existing projects, members, tasks, and activities. This action cannot be undone.</p>
                        </div>
                    </div>
                </div>

                <div className="mt-8 flex items-center justify-center gap-4">
                    <button onClick={handleLoadData} className="px-8 py-3 text-lg font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                        <i className="fa-solid fa-bolt mr-2"></i>
                        Load Detailed Data
                    </button>
                     <button 
                        onClick={() => setIsClearModalOpen(true)}
                        className="px-8 py-3 text-lg font-medium text-red-700 bg-red-100 border border-red-200 rounded-md shadow-sm hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
                        <i className="fa-solid fa-trash-alt mr-2"></i>
                        Clear All Data
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DetailedSampleData;