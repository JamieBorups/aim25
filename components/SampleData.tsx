import React, { useState } from 'react';
import { FormData, Member, Task, BudgetItem, Report, DirectExpense, BudgetItemStatus } from '../types';
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
    return date.toISOString();
};

// --- SAMPLE DATA DEFINITIONS ---

const rawMembers = [
    {
        firstName: 'Jane', lastName: 'Doe', email: 'jane.doe@example.com', province: 'ON', city: 'Toronto',
        shortBio: 'A passionate visual artist with 10+ years of experience in community-based art projects.',
        artistBio: 'Jane Doe is a visual artist based in Toronto, specializing in large-scale murals and public art installations. Her work explores themes of community, identity, and environmentalism.',
        availability: 'full-time'
    },
    {
        firstName: 'John', lastName: 'Smith', email: 'john.smith@example.com', province: 'BC', city: 'Vancouver',
        shortBio: 'An experienced project manager and producer, focused on arts and culture events.',
        artistBio: 'With a background in theatre production, John Smith has managed a wide range of artistic projects, from small gallery shows to large multi-day festivals. He excels at logistics, budgeting, and team coordination.',
        availability: 'contract'
    },
    {
        firstName: 'Emily', lastName: 'Jones', email: 'emily.jones@example.com', province: 'QC', city: 'Montreal',
        shortBio: 'A versatile designer and tech enthusiast with skills in graphic design, web development, and digital media.',
        artistBio: 'Emily Jones bridges the gap between art and technology. Her portfolio includes branding for arts organizations, interactive web experiences, and digital assets for storytelling projects.',
        availability: 'part-time'
    },
    {
        firstName: 'Michael', lastName: 'Lee', email: 'michael.lee@example.com', province: 'MB', city: 'Winnipeg',
        shortBio: 'A composer and multi-instrumentalist with a focus on contemporary and folk music.',
        artistBio: 'Michael Lee is a Winnipeg-based musician whose compositions blend traditional folk melodies with modern electronic soundscapes. He has scored several independent films and regularly performs with his ensemble.',
        availability: 'full-time'
    },
];

const createSampleProjects = (members: Member[]) => {
    const [jane, john, emily, michael] = members;
    const sumAmounts = (items: BudgetItem[] = []) => items.reduce((sum, item) => sum + (item.amount || 0), 0);

    // --- Project 1: Mural ---
    let p1 = {
        id: newId('proj'),
        projectTitle: 'Community Mural Project',
        status: 'Active',
        artisticDisciplines: ['visual', 'multi-disciplinary'],
        visualArtsGenres: ['painting', 'mixed-media'],
        projectStartDate: '2024-09-01',
        projectEndDate: '2024-11-30',
        background: 'This project continues our collective’s tradition of creating public art that reflects local stories and culture.',
        projectDescription: 'We will create a large-scale mural on the side of the community center, designed with input from local residents. The project aims to beautify the neighborhood and foster a sense of shared identity.',
        collaboratorDetails: [
            { memberId: jane.id, role: 'Lead Artist' },
            { memberId: emily.id, role: 'Designer & Community Outreach' },
            { memberId: john.id, role: 'Project Manager' }
        ],
        audience: 'The primary audience is the local residents of the downtown east-side neighborhood. We will reach them through local community channels, social media, and on-site events.',
        paymentAndConditions: "All artists and collaborators will be paid fair wages according to CARFAC standards. A safe and respectful work environment will be maintained at all times, with regular check-ins and clear communication channels.",
        culturalIntegrity: "The project is led by community members and artists with deep ties to the neighborhood. We will hold several consultation sessions to ensure the mural's themes and imagery are respectful and representative of the community's diverse cultural heritage.",
        whoWillWork: "Jane Doe, our Lead Artist, brings extensive experience in large-scale public art. Emily Jones will lead design and community engagement, leveraging her digital skills to create promotional materials. John Smith will ensure the project stays on schedule and budget.",
        howSelectionDetermined: "The core team was selected based on their proven track record and commitment to community-engaged arts. Any additional volunteers will be recruited from the local community to foster ownership and participation.",
        budget: {
            revenues: {
                grants: [
                    { id: newId('b'), source: 'mac', description: 'Application for this grant', amount: 8000, status: 'Pending' as BudgetItemStatus },
                    { id: newId('b'), source: 'municipalWinnipeg', description: 'City Arts Grant', amount: 2000, status: 'Approved' as BudgetItemStatus, actualAmount: 2000 },
                ],
                contributions: [
                    { id: newId('b'), source: 'inKindPartners', description: 'Community Center wall space', amount: 2500, status: 'Approved' as BudgetItemStatus },
                    { id: newId('b'), source: 'financialPartners', description: 'Local business sponsorship', amount: 1500, status: 'Approved' as BudgetItemStatus, actualAmount: 1500 },
                ],
                tickets: { numVenues: 0, percentCapacity: 0, venueCapacity: 0, avgTicketPrice: 0, description: '' },
                sales: [],
                fundraising: [
                    { id: newId('b'), source: 'donations', description: 'Online donation campaign', amount: 1000, status: 'Pending' as BudgetItemStatus },
                ],
            },
            expenses: {
                professionalFees: [
                    { id: newId('b'), source: 'artists', description: 'Lead artist fee', amount: 0 }, // Balancing item
                    { id: newId('b'), source: 'designers', description: 'Graphic design for promotion', amount: 1500 },
                ],
                production: [
                    { id: newId('b'), source: 'materials', description: 'Paints, brushes, supplies', amount: 3500 },
                    { id: newId('b'), source: 'rentals', description: 'Scaffolding and equipment rental', amount: 1200 },
                ],
                administration: [
                    { id: newId('b'), source: 'promotion', description: 'Social media ads, flyers', amount: 500 },
                    { id: newId('b'), source: 'workshops', description: 'Community consultation session costs', amount: 750 },
                     { id: newId('b'), source: 'other', description: 'Project liability insurance', amount: 400 },
                ],
                travel: [], research: [], professionalDevelopment: []
            },
        },
    } as unknown as FormData;

    const p1TotalRevenue = sumAmounts(p1.budget.revenues.grants) + sumAmounts(p1.budget.revenues.contributions) + sumAmounts(p1.budget.revenues.fundraising);
    const p1ExpensesSoFar = sumAmounts(p1.budget.expenses.professionalFees) + sumAmounts(p1.budget.expenses.production) + sumAmounts(p1.budget.expenses.administration);
    p1.budget.expenses.professionalFees[0].amount = p1TotalRevenue - p1ExpensesSoFar;
    

    // --- Project 2: Music Festival ---
    let p2 = {
        id: newId('proj'),
        projectTitle: 'Summer Folk Fusion Festival',
        status: 'Active',
        artisticDisciplines: ['music'],
        musicGenres: ['contemporary-folk', 'world-music', 'instrumental'],
        projectStartDate: '2025-06-15',
        projectEndDate: '2025-08-30',
        background: 'An annual festival celebrating the diversity of modern folk music.',
        projectDescription: 'A one-day outdoor music festival featuring local and regional artists. The event will feature a main stage, workshops with artists, and food vendors.',
        collaboratorDetails: [
            { memberId: michael.id, role: 'Artistic Director & Performer' },
            { memberId: john.id, role: 'Festival Producer' }
        ],
        audience: "Our audience includes folk music enthusiasts, families, and culturally curious individuals from the wider region. We target them via music blogs, local radio, and partnerships with cultural organizations.",
        paymentAndConditions: "All performers are guaranteed fees based on CARFAC's recommended rates for musicians. We provide a safe, professional backstage environment and clear technical and scheduling information well in advance.",
        culturalIntegrity: "The festival's curation is led by Michael Lee, an artist deeply embedded in the folk community. We actively seek out a diverse lineup that represents a variety of folk traditions, and we foster an environment of respectful cultural exchange among artists and audience members.",
        whoWillWork: "Michael Lee will curate the artistic lineup and perform. John Smith, with his extensive festival production experience, will manage all logistics, from vendor contracts to volunteer coordination, ensuring a smooth event.",
        howSelectionDetermined: "A programming committee led by Michael Lee will select performers based on artistic merit, originality, and their fit with the festival's theme. We prioritize local and emerging artists to provide them with a professional platform.",
        budget: {
            revenues: {
                tickets: { numVenues: 1, percentCapacity: 80, venueCapacity: 500, avgTicketPrice: 25, description: 'General Admission' },
                fundraising: [ { id: newId('b'), source: 'sponsorship', description: 'Local business sponsor', amount: 3000, status: 'Approved' as BudgetItemStatus, actualAmount: 3000 } ],
                grants: [ { id: newId('b'), source: 'provincialOther', description: 'Provincial Tourism Grant', amount: 2000, status: 'Pending' as BudgetItemStatus } ],
                sales: [ { id: newId('b'), source: 'merchandise', description: 'T-shirts and artist merch', amount: 1000, status: 'Pending' as BudgetItemStatus } ],
                contributions: [],
            },
            expenses: {
                professionalFees: [
                    { id: newId('b'), source: 'artists', description: 'Fee for lead composer/performer', amount: 0 }, // Balancing Item
                    { id: newId('b'), source: 'consultant', description: 'Sound Engineer', amount: 1200 },
                ],
                production: [
                    { id: newId('b'), source: 'rentals', description: 'Stage, sound system, and lighting', amount: 5500 },
                ],
                travel: [
                    { id: newId('b'), source: 'transportation', description: 'Travel for guest performer', amount: 800 },
                    { id: newId('b'), source: 'accommodations', description: 'Hotel for guest performer', amount: 1000 },
                ],
                administration: [
                    { id: newId('b'), source: 'promotion', description: 'Marketing and advertising', amount: 1500 },
                    { id: newId('b'), source: 'other', description: 'Volunteer coordination costs', amount: 300 },
                ],
                research: [], professionalDevelopment: []
            }
        }
    } as unknown as FormData;

    const p2TicketRevenue = (p2.budget.revenues.tickets.numVenues || 0) * ((p2.budget.revenues.tickets.percentCapacity || 0) / 100) * (p2.budget.revenues.tickets.venueCapacity || 0) * (p2.budget.revenues.tickets.avgTicketPrice || 0);
    const p2TotalRevenue = p2TicketRevenue + sumAmounts(p2.budget.revenues.fundraising) + sumAmounts(p2.budget.revenues.grants) + sumAmounts(p2.budget.revenues.sales);
    const p2ExpensesSoFar = sumAmounts(p2.budget.expenses.professionalFees) + sumAmounts(p2.budget.expenses.production) + sumAmounts(p2.budget.expenses.travel) + sumAmounts(p2.budget.expenses.administration);
    p2.budget.expenses.professionalFees[0].amount = p2TotalRevenue - p2ExpensesSoFar;
    

    // --- Project 3: Workshop ---
    let p3 = {
        id: newId('proj'),
        projectTitle: 'The Digital Storytelling Workshop',
        status: 'Completed',
        artisticDisciplines: ['literary', 'media'],
        literaryGenres: ['storytelling', 'creative-non-fiction'],
        mediaGenres: ['audio-art', 'video-art'],
        projectStartDate: '2025-02-01',
        projectEndDate: '2025-03-15',
        background: 'An educational initiative to empower emerging artists with digital tools.',
        projectDescription: 'A 4-week online workshop series teaching participants how to blend traditional narrative with digital media, including audio and video production.',
        collaboratorDetails: [
            { memberId: jane.id, role: 'Lead Instructor' },
            { memberId: emily.id, role: 'Technical Facilitator' }
        ],
        audience: "The workshop is designed for emerging writers, artists, and storytellers in Manitoba who are looking to expand their skills into digital media. We will reach them through our mailing list, social media, and by partnering with local writing and arts groups.",
        paymentAndConditions: "Instructors are paid a professional fee based on standard workshop rates. All intellectual property created by participants remains their own. We will create a supportive and collaborative online learning environment.",
        culturalIntegrity: "The workshop encourages participants to tell their own stories, from their own cultural perspectives. Lead instructor Jane Doe has extensive experience in facilitating workshops that are inclusive and respectful of diverse backgrounds. We will establish clear community guidelines for respectful feedback and interaction.",
        whoWillWork: "Jane Doe will design the curriculum and lead the instruction, drawing on her experience as a community-engaged artist. Emily Jones will provide technical support and facilitate the online platform, ensuring a smooth experience for all participants.",
        howSelectionDetermined: "Participants will be selected via an open call. A small panel, including the instructors, will review applications based on artistic potential and the applicant's stated goals for the workshop, ensuring a diverse and committed cohort.",
        budget: {
            revenues: {
                grants: [
                    { id: newId('b'), source: 'federalCanada', description: 'Digital arts grant', amount: 4000, status: 'Approved' as BudgetItemStatus, actualAmount: 4000 },
                    { id: newId('b'), source: 'provincialOther', description: 'Arts Education Grant', amount: 3000, status: 'Denied' as BudgetItemStatus },
                ],
                contributions: [
                    { id: newId('b'), source: 'financialApplicant', description: 'Participant fees', amount: 1500, status: 'Approved' as BudgetItemStatus, actualAmount: 1500 }
                ],
                tickets: { numVenues: 0, percentCapacity: 0, venueCapacity: 0, avgTicketPrice: 0, description: '' },
                sales: [],
                fundraising: [],
            },
            expenses: {
                professionalFees: [
                    { id: newId('b'), source: 'artists', description: 'Lead Instructor Fee (Jane)', amount: 0 }, // Balancing item
                    { id: newId('b'), source: 'consultant', description: 'Technical Support (Emily)', amount: 1000 },
                ],
                administration: [
                    { id: newId('b'), source: 'workshops', description: 'Platform fees & materials', amount: 500 },
                    { id: newId('b'), source: 'promotion', description: 'Workshop promotion', amount: 750 },
                ],
                 professionalDevelopment: [
                    { id: newId('b'), source: 'professionalDevelopment', description: 'Software licenses for workshop', amount: 450 },
                ],
                travel: [], production: [], research: []
            }
        },
    } as unknown as FormData;

    const p3TotalRevenue = sumAmounts(p3.budget.revenues.grants) + sumAmounts(p3.budget.revenues.contributions);
    const p3ExpensesSoFar = sumAmounts(p3.budget.expenses.professionalFees) + sumAmounts(p3.budget.expenses.administration) + sumAmounts(p3.budget.expenses.professionalDevelopment);
    p3.budget.expenses.professionalFees[0].amount = p3TotalRevenue - p3ExpensesSoFar;
    

    return [p1, p2, p3].map(p => ({
      ...p,
      craftGenres: [],
      danceGenres: [],
      literaryGenres: p.literaryGenres || [],
      mediaGenres: p.mediaGenres || [],
      musicGenres: p.musicGenres || [],
      theatreGenres: [],
      visualArtsGenres: p.visualArtsGenres || [],
      otherArtisticDisciplineSpecify: '',
      activityType: 'public-presentation',
      permissionConfirmationFiles: [],
      schedule: 'Schedule details to be confirmed.',
      additionalInfo: '',
    }));
};

const createSampleTasks = (projects: FormData[], members: Member[]): Task[] => {
    const [p1, p2, p3] = projects;
    const [jane, john, emily, michael] = members;

    return [
        // Project 1 Tasks
        { id: newId('task'), taskCode: 'CMP-01', projectId: p1.id, title: 'Design Mural Concept', description: 'Develop 3 initial concepts for community review.', assignedMemberId: jane.id, status: 'Done', startDate: '2024-09-02', dueDate: '2024-09-15', taskType: 'Time-Based', isComplete: true, estimatedHours: 40, actualHours: 0, budgetItemId: getBudgetItemId(p1, 'professionalFees', 'artists'), workType: 'Paid', hourlyRate: 50, updatedAt: dateDaysAgo(20) },
        { id: newId('task'), taskCode: 'CMP-02', projectId: p1.id, title: 'Community Feedback Session', description: 'Host a session to get feedback on concepts.', assignedMemberId: emily.id, status: 'Done', startDate: '2024-09-16', dueDate: '2024-09-20', taskType: 'Time-Based', isComplete: true, estimatedHours: 8, actualHours: 0, budgetItemId: getBudgetItemId(p1, 'professionalFees', 'designers'), workType: 'Paid', hourlyRate: 40, updatedAt: dateDaysAgo(18) },
        { id: newId('task'), taskCode: 'CMP-03', projectId: p1.id, title: 'Purchase Mural Supplies', description: 'Order all paints, primers, and brushes.', assignedMemberId: john.id, status: 'In Progress', startDate: '2024-09-21', dueDate: '2024-10-01', taskType: 'Time-Based', isComplete: false, estimatedHours: 10, actualHours: 0, budgetItemId: getBudgetItemId(p1, 'production', 'materials'), workType: 'In-Kind', hourlyRate: 0, updatedAt: dateDaysAgo(5) },
        { id: newId('task'), taskCode: 'CMP-04', projectId: p1.id, title: 'Paint Mural - Phase 1', description: 'Prime and outline the mural.', assignedMemberId: jane.id, status: 'To Do', startDate: '2024-10-02', dueDate: '2024-10-15', taskType: 'Time-Based', isComplete: false, estimatedHours: 60, actualHours: 0, budgetItemId: getBudgetItemId(p1, 'professionalFees', 'artists'), workType: 'Paid', hourlyRate: 50, updatedAt: dateDaysAgo(2) },

        // Project 2 Tasks
        { id: newId('task'), taskCode: 'SFFF-01', projectId: p2.id, title: 'Book Festival Venue', description: 'Finalize contract with the park.', assignedMemberId: john.id, status: 'Done', startDate: '2025-01-15', dueDate: '2025-02-01', taskType: 'Milestone', isComplete: true, estimatedHours: 0, actualHours: 0, budgetItemId: '', workType: 'Paid', hourlyRate: 0, updatedAt: dateDaysAgo(30) },
        { id: newId('task'), taskCode: 'SFFF-02', projectId: p2.id, title: 'Compose Opening Number', description: 'Write and arrange the festival’s opening piece.', assignedMemberId: michael.id, status: 'In Progress', startDate: '2025-02-02', dueDate: '2025-05-01', taskType: 'Time-Based', isComplete: false, estimatedHours: 80, actualHours: 0, budgetItemId: getBudgetItemId(p2, 'professionalFees', 'artists'), workType: 'Paid', hourlyRate: 50, updatedAt: dateDaysAgo(10) },
        { id: newId('task'), taskCode: 'SFFF-03', projectId: p2.id, title: 'Hire Sound Engineer', description: 'Find and contract a live sound engineer.', assignedMemberId: john.id, status: 'To Do', startDate: '2025-04-01', dueDate: '2025-04-15', taskType: 'Time-Based', isComplete: false, estimatedHours: 10, actualHours: 0, budgetItemId: getBudgetItemId(p2, 'professionalFees', 'consultant'), workType: 'Paid', hourlyRate: 60, updatedAt: dateDaysAgo(1) },
        
        // Project 3 Tasks
        { id: newId('task'), taskCode: 'DSW-01', projectId: p3.id, title: 'Develop Workshop Curriculum', description: 'Outline all 4 weeks, including exercises and examples.', assignedMemberId: jane.id, status: 'In Progress', startDate: '2025-01-02', dueDate: '2025-01-15', taskType: 'Time-Based', isComplete: false, estimatedHours: 30, actualHours: 0, budgetItemId: getBudgetItemId(p3, 'professionalFees', 'artists'), workType: 'Paid', hourlyRate: 55, updatedAt: dateDaysAgo(8) },
        { id: newId('task'), taskCode: 'DSW-02', projectId: p3.id, title: 'Set up Online Platform', description: 'Configure online learning environment and tools.', assignedMemberId: emily.id, status: 'To Do', startDate: '2025-01-16', dueDate: '2025-01-20', taskType: 'Time-Based', isComplete: false, estimatedHours: 15, actualHours: 0, budgetItemId: getBudgetItemId(p3, 'professionalFees', 'consultant'), workType: 'Paid', hourlyRate: 45, updatedAt: dateDaysAgo(4) },
        { id: newId('task'), taskCode: 'DSW-03', projectId: p3.id, title: 'Onboard Participants', description: 'Send welcome emails and instructions.', assignedMemberId: emily.id, status: 'Backlog', startDate: '2025-01-21', dueDate: '2025-01-25', taskType: 'Time-Based', isComplete: false, estimatedHours: 5, actualHours: 0, budgetItemId: getBudgetItemId(p3, 'professionalFees', 'consultant'), workType: 'Volunteer', hourlyRate: 0, updatedAt: dateDaysAgo(20) },
    ];
};

const createSampleActivities = (tasks: Task[], members: Member[]) => {
    const [t1, t2, t3, _t4, _t5, t6, _t7, t8] = tasks;
    const [jane, john, emily, michael] = members;

    const activityData = [
        { task: t1, member: jane, desc: 'Initial brainstorming and sketching.', date: '2024-09-08', hours: 25, status: 'Approved' as const, daysAgo: 22 },
        { task: t1, member: jane, desc: 'Refining sketches into full concepts.', date: '2024-09-14', hours: 20, status: 'Approved' as const, daysAgo: 20 },
        { task: t2, member: emily, desc: 'Preparing materials and facilitating the community session.', date: '2024-09-20', hours: 10, status: 'Approved' as const, daysAgo: 18 },
        { task: t3, member: john, desc: 'Contacting vendors and placing orders for supplies.', date: '2024-09-22', hours: 4, status: 'Pending' as const, daysAgo: 5 },
        { task: t6, member: michael, desc: 'First draft of the main theme.', date: '2025-02-28', hours: 35, status: 'Approved' as const, daysAgo: 15 },
        { task: t8, member: jane, desc: 'Week 1 & 2 curriculum development.', date: '2025-01-08', hours: 15, status: 'Approved' as const, daysAgo: 10 },
        { task: t8, member: jane, desc: 'Week 3 & 4 curriculum development.', date: '2025-01-14', hours: 12, status: 'Pending' as const, daysAgo: 2 },
    ];

    return activityData.map(data => {
        const updateDate = dateDaysAgo(data.daysAgo);
        return {
            id: newId('act'),
            taskId: data.task.id,
            memberId: data.member.id,
            description: data.desc,
            startDate: new Date(data.date).toISOString().split('T')[0],
            endDate: new Date(data.date).toISOString().split('T')[0],
            hours: data.hours,
            status: data.status,
            createdAt: updateDate,
            updatedAt: updateDate,
        };
    });
};


const SampleData: React.FC = () => {
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
        
        setMembers(newMembers);
        setProjects(newProjects);
        setTasks(newTasks);
        setActivities(newActivities);
        setDirectExpenses([]);
        setReports([]); // Clear old reports

        notify('Sample data loaded successfully!', 'success');
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
                <i className="fa-solid fa-flask-vial text-6xl text-amber-500"></i>
                <h1 className="mt-4 text-3xl font-bold text-slate-900">Load Sample Data</h1>
                <p className="mt-2 text-lg text-slate-600 max-w-2xl mx-auto">This is a temporary development tool to populate the application with a set of sample projects, members, and tasks for testing purposes.</p>
                
                <div className="mt-6 bg-amber-100 border-l-4 border-amber-500 text-amber-800 p-4 max-w-2xl mx-auto text-left">
                    <div className="flex">
                        <div className="py-1"><i className="fa-solid fa-triangle-exclamation mr-3"></i></div>
                        <div>
                            <p className="font-bold">Warning!</p>
                            <p className="text-sm">Loading sample data will <strong className="uppercase">completely replace</strong> any existing data you have entered. This action cannot be undone.</p>
                        </div>
                    </div>
                </div>

                <div className="mt-8 flex items-center justify-center gap-4">
                    <button onClick={handleLoadData} className="px-8 py-3 text-lg font-medium text-white bg-teal-600 border border-transparent rounded-md shadow-sm hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500">
                        <i className="fa-solid fa-cubes-stacked mr-2"></i>
                        Load Sample Data
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

export default SampleData;