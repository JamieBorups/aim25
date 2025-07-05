
import React, { useState } from 'react';
import { FormData, Member, Task, BudgetItem, Activity, DirectExpense, BudgetItemStatus, Report, ReportHighlight, ActivityStatus } from '../types';
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

const dateFor = (year: number, month: number, day: number): string => {
    return new Date(year, month - 1, day).toISOString().split('T')[0];
};

const rawMembers = [
    {
        firstName: 'Samuel', lastName: 'Chen', email: 'samuel.chen@example.com', province: 'MB', city: 'Winnipeg',
        shortBio: 'A gifted composer and sound designer specializing in electro-acoustic music and field recordings.',
        artistBio: 'Samuel Chen is a Winnipeg-based composer whose work is known for its emotional depth and textural complexity. His work often explores the intersection of natural environments and human-made soundscapes. He has scored numerous documentary films and his unique blend of acoustic and electronic soundscapes has garnered critical acclaim. Samuel is a graduate of the University of Manitoba\'s music program and is also a dedicated music educator, offering workshops on composition and music technology.',
        availability: 'full-time'
    },
    {
        firstName: 'Marcus', lastName: 'Thorne', email: 'marcus.thorne@example.com', province: 'MB', city: 'Winnipeg',
        shortBio: 'An accomplished producer and project manager with a focus on interdisciplinary arts and cultural festivals.',
        artistBio: "With a background in theatre and event production, Marcus Thorne has a proven track record of bringing complex artistic visions to life. He excels at strategic planning, financial management, and stakeholder engagement, ensuring projects are delivered on time and within budget while maintaining artistic integrity. He has managed projects for major cultural institutions across Manitoba and is known for his calm demeanor and meticulous attention to detail. Marcus is passionate about creating sustainable systems that support artists.",
        availability: 'contract'
    },
    {
        firstName: 'Chantal', lastName: 'Dubois', email: 'chantal.dubois@example.com', province: 'MB', city: 'St. Boniface',
        shortBio: 'A veteran circus artist, choreographer, and director with a focus on narrative-driven physical theatre.',
        artistBio: "Chantal Dubois is a celebrated figure in Canada's circus arts scene. With over 20 years of experience as a performer and creator, her work seamlessly blends high-level acrobatics with poignant storytelling. She is the founder of Cirque d'Hiver and is dedicated to mentoring the next generation of physical performers. Her creations often explore themes of resilience and transformation, inspired by the stark beauty of the Canadian landscape. Chantal is a graduate of the National Circus School in Montreal.",
        availability: 'full-time'
    },
    {
        firstName: 'Kaelen', lastName: 'Thomas', email: 'kaelen.thomas@example.com', province: 'MB', city: 'Winnipeg',
        shortBio: 'A talented illustrator and graphic novelist from Peguis First Nation with a unique, contemporary style.',
        artistBio: "Kaelen Thomas is an Anishinaabe artist whose work bridges traditional storytelling with contemporary comic art. Their illustrations are known for their dynamic line work and vibrant color palettes, bringing new life to ancient stories. Kaelen is a self-taught artist who has gained a significant online following for their character designs and short comics. They are passionate about creating stories that resonate with Indigenous youth and provide a modern lens on cultural narratives. 'Digital Quill' is their first major long-form project.",
        availability: 'full-time'
    },
     {
        firstName: 'Dr. Anya', lastName: 'Sharma', email: 'anya.sharma@example.com', province: 'MB', city: 'Winnipeg',
        shortBio: 'A historian and researcher from the University of Manitoba specializing in the history of the Red River valley.',
        artistBio: "Dr. Anya Sharma is a respected historian whose research focuses on the ecological and social histories of Manitoba's waterways. She has published several papers on the topic and is a passionate advocate for public history projects that connect communities with their local heritage. Her involvement ensures historical accuracy and adds a rich educational layer to artistic projects.",
        availability: 'contract'
    },
];

const createSampleProjects = (members: Member[]) => {
    const [samuel, marcus, chantal, kaelen, anya] = members;
    // --- Project 1: Echoes of the Red River ---
    let p1: FormData = {
        id: newId('proj'),
        projectTitle: 'Echoes of the Red River',
        status: 'Active',
        artisticDisciplines: ['music', 'media'],
        musicGenres: ['electro-acoustic', 'new-music', 'world-music'],
        mediaGenres: ['audio-art', 'documentary'],
        projectStartDate: dateFor(2025, 4, 15),
        projectEndDate: dateFor(2025, 12, 15),
        background: "This project aims to create a sonic portrait of the Red River, exploring its historical, ecological, and cultural significance through sound. Our collective has a history of creating site-specific audio works, but this is our most ambitious project to date. We have spent the past year conducting preliminary research and building relationships with communities along the river, funded by a small exploratory grant from the Winnipeg Arts Council. This has confirmed the viability and community interest in a large-scale project that tells the river's story through its own sounds.",
        projectDescription: "We will create a 'sound map' of the Red River, from its southern entry into Manitoba to its northern delta. This involves capturing field recordings (above and below water using hydrophones), sourcing archival audio, and recording oral histories from elders, scientists, and residents in communities along the river. These diverse audio elements will be woven into a cohesive, hour-long electro-acoustic composition by lead artist Samuel Chen. The final work will be presented in two formats: a multi-channel audio installation at a public venue in Winnipeg (e.g., The Forks, Millennium Library Park) and as an interactive online map where users can explore the river's sounds geographically. The project's goal is to connect listeners to the river in a new, profound way, fostering a deeper appreciation for this vital waterway and the stories it holds.",
        audience: "The primary audience includes the general public who will encounter the installation, as well as students (from elementary to post-secondary), new music enthusiasts, environmental groups, and local history buffs. We will reach them through partnerships with cultural institutions, targeted social media campaigns, and local media outreach. The interactive online map is designed to reach a national and international audience interested in sound art, environmental data sonification, and Canadian history. We will also engage with academic communities in music, history, and environmental studies.",
        collaboratorDetails: [
            { memberId: samuel.id, role: 'Lead Composer & Sound Artist' },
            { memberId: marcus.id, role: 'Producer & Location Manager' },
            { memberId: anya.id, role: 'Historical Consultant' }
        ],
        budget: {
            revenues: {
                grants: [
                    { id: newId('b'), source: 'mac', description: 'This funding application', amount: 15000, status: 'Pending' },
                    { id: newId('b'), source: 'federalCanada', description: 'Digital Now Grant', amount: 10000, actualAmount: 10000, status: 'Approved' },
                ],
                fundraising: [{ id: newId('b'), source: 'sponsorship', description: 'Sponsorship from Cabela\'s for equipment', amount: 3000, actualAmount: 3000, status: 'Approved' }],
                contributions: [],
                tickets: { numVenues: 0, percentCapacity: 0, venueCapacity: 0, avgTicketPrice: 0, description: '' }, sales: []
            },
            expenses: {
                professionalFees: [
                    { id: newId('b'), source: 'artists', description: 'Lead Composer Fee (Samuel)', amount: 10000 },
                    { id: newId('b'), source: 'consultant', description: 'Historical Consultant Honorarium (Dr. Sharma)', amount: 3000 },
                    { id: newId('b'), source: 'indigenous', description: 'Honoraria for Oral History Participants', amount: 1500 },
                ],
                production: [
                    { id: newId('b'), source: 'equipment', description: 'Hydrophones, multi-track field recorder, cables', amount: 4000 },
                    { id: newId('b'), source: 'rentals', description: 'Audio post-production suite', amount: 2000 },
                ],
                travel: [ 
                    { id: newId('b'), source: 'transportation', description: 'Mileage for travel along river', amount: 1000 }, 
                    { id: newId('b'), source: 'accommodations', description: 'Overnight stays for northern recording trips', amount: 500 }
                ],
                administration: [
                    { id: newId('b'), source: 'promotion', description: 'Online promotion & premiere event costs', amount: 2000 },
                    { id: newId('b'), source: 'personnel', description: 'Project Management & Reporting', amount: 800 }
                ],
                research: [{id: newId('b'), source: 'research', description: 'Archival audio licensing fees', amount: 500 }],
                professionalDevelopment: [{ id: newId('b'), source: 'professionalDevelopment', description: 'Advanced Sound-mixing Masterclass', amount: 3500 }]
            },
        }
    } as unknown as FormData;

    // --- Project 2: Northern Light ---
    let p2: FormData = {
        id: newId('proj'),
        projectTitle: 'Northern Light: A Winter Circus',
        status: 'Active',
        artisticDisciplines: ['theatre', 'dance', 'multi-disciplinary'],
        theatreGenres: ['circus-arts', 'physical-theatre', 'site-specific-theatre'],
        danceGenres: ['contemporary', 'aerial'],
        projectStartDate: dateFor(2025, 5, 1),
        projectEndDate: dateFor(2025, 11, 30),
        background: "Cirque d'Hiver was founded to create circus art that embraces, rather than avoids, the realities of the Canadian winter. Our past productions have experimented with outdoor elements and themes of hibernation and resilience. This project represents our most ambitious undertaking, moving from smaller showcases to a full-length feature production designed specifically for a winter festival setting. We have secured a partnership with Festival du Voyageur to present the work-in-progress, providing a perfect test ground for the show's core concepts and technical requirements.",
        projectDescription: "A contemporary circus performance for an all-ages audience, designed for a winter setting. The show uses acrobatics, aerial arts, and physical comedy to tell a mythic story inspired by the aurora borealis and northern folklore. The narrative follows a group of villagers who must work together to bring back the light during a long, dark winter. The aesthetic will be a blend of rustic and magical, with costumes and props that evoke a winter landscape. The performance is designed to be adaptable, capable of being staged in a large heated tent or a converted indoor space like a warehouse, making it ideal for winter festivals and touring. This phase focuses on the creation, rehearsal, and work-in-progress showing of the full 60-minute piece.",
        audience: 'The primary audience will be attendees of winter festivals, including families, young adults, and tourists. The show is designed to be visually spectacular and non-language-dependent, making it accessible to a wide range of cultural backgrounds. We will reach this audience through the marketing channels of our partner festivals. A secondary audience includes the national circus arts community and presenters, whom we will engage through industry showcases, a high-quality promo video, and direct outreach. We aim to secure a national tour for the following winter season.',
        collaboratorDetails: [
            { memberId: chantal.id, role: 'Artistic Director & Choreographer' },
            { memberId: marcus.id, role: 'Producer & Technical Director' },
            { memberId: samuel.id, role: 'Composer' },
        ],
        budget: {
            revenues: {
                grants: [
                    { id: newId('b'), source: 'mac', description: 'This funding application', amount: 15000, status: 'Pending' },
                    { id: newId('b'), source: 'federalCanada', description: 'Festival Contribution', amount: 10000, actualAmount: 10000, status: 'Approved' }
                ],
                contributions: [{ id: newId('b'), source: 'inKindPartners', description: 'Rehearsal space from WCD', amount: 5000, actualAmount: 5000, status: 'Approved' }],
                tickets: { numVenues: 0, percentCapacity: 0, venueCapacity: 0, avgTicketPrice: 0, description: '' },
                sales: [], fundraising: []
            },
            expenses: {
                professionalFees: [
                    { id: newId('b'), source: 'artists', description: 'Performers Fees (4 artists x 8 weeks)', amount: 15000 },
                    { id: newId('b'), source: 'designers', description: 'Set & Costume Designer', amount: 3000 },
                ],
                production: [
                    { id: newId('b'), source: 'materials', description: 'Costume and prop fabrication materials', amount: 3000 },
                    { id: newId('b'), source: 'rentals', description: 'Specialized rigging and aerial equipment', amount: 3000 },
                    { id: newId('b'), source: 'technical', description: 'Lighting technician for WIP showing', amount: 1000 },
                ],
                administration: [
                    { id: newId('b'), source: 'personnel', description: 'Producer Fee (Marcus)', amount: 4000 },
                    { id: newId('b'), source: 'promotion', description: 'Promo video and photos', amount: 1000 },
                ],
                travel: [], research: [], professionalDevelopment: [],
            }
        }
    } as unknown as FormData;

    // --- Project 3: Digital Quill ---
    let p3: FormData = {
        id: newId('proj'),
        projectTitle: 'Digital Quill: An Indigenous Graphic Novel',
        status: 'Completed',
        artisticDisciplines: ['literary', 'visual', 'craft'],
        literaryGenres: ['graphic-novel', 'young-adult-fiction', 'storytelling'],
        visualArtsGenres: ['drawing', 'printmaking'],
        projectStartDate: dateFor(2025, 4, 1),
        projectEndDate: dateFor(2025, 10, 31),
        background: "This project emerged from a series of mentorship workshops with emerging Indigenous artists, where a strong desire for a collaborative, long-form storytelling project was identified. Lead artist Kaelen Thomas has developed a compelling story concept and a unique visual style that is ready for development into a full-length work. The goal is to create a professional, published graphic novel that can serve as a powerful resource and a career-launching achievement for the artist. We have secured interest from a local publisher, pending the completion of a full manuscript and sample chapters.",
        projectDescription: "This project will fully fund the creation, from script to final art, of a 120-page graphic novel written and illustrated by Anishinaabe artist Kaelen Thomas. The story, tentatively titled 'The Seventh Fire,' is a contemporary fantasy for young adults that draws on Anishinaabe oral traditions and prophecies. The project will cover the artist's living expenses for the 6-month creation period, as well as costs for materials, mentorship, and the initial print run. The process will be documented online to share the journey of creating a graphic novel with an emerging audience. The final product will be a professionally printed and bound book, launched at a local bookstore and promoted to schools, libraries, and comic conventions across the country.",
        audience: "The primary audience is Indigenous and non-Indigenous youth (ages 14-24) who are fans of graphic novels and fantasy stories. The book aims to provide a powerful piece of representation for Indigenous youth and an engaging entry point into Anishinaabe culture for others. A secondary audience includes educators, librarians, and collectors of comic art. We will reach our audience through social media (leveraging the artist's existing following), partnerships with Indigenous organizations, and by attending comic conventions like C4 in Winnipeg. A teacher's guide will be developed to encourage classroom adoption.",
        collaboratorDetails: [
            { memberId: kaelen.id, role: 'Lead Artist & Writer' },
            { memberId: marcus.id, role: 'Project Manager' },
        ],
        budget: {
            revenues: {
                grants: [
                    { id: newId('b'), source: 'mac', description: 'Indigenous 360 Grant', amount: 15000, actualAmount: 15000, status: 'Approved' },
                    { id: newId('b'), source: 'federalCanada', description: 'Creating, Knowing, and Sharing Grant', amount: 10000, actualAmount: 10000, status: 'Approved' },
                ],
                fundraising: [{id: newId('b'), source: 'crowdsourcing', description: 'Pre-order Kickstarter Campaign', amount: 3000, actualAmount: 3000, status: 'Approved' }],
                contributions: [], sales: [], tickets: { numVenues: 0, percentCapacity: 0, venueCapacity: 0, avgTicketPrice: 0, description: '' },
            },
            expenses: {
                professionalFees: [
                    { id: newId('b'), source: 'artists', description: 'Lead Artist Living Expenses/Stipend', amount: 18000 },
                    { id: newId('b'), source: 'consultant', description: 'Editor/Mentor Honorarium', amount: 2000 },
                    { id: newId('b'), source: 'indigenous', description: 'Elder consultation for story protocol', amount: 1000 },
                ],
                production: [
                    { id: newId('b'), source: 'materials', description: 'Art supplies (paper, ink, digital software)', amount: 1500 },
                    { id: newId('b'), source: 'other', description: 'Initial print run (500 copies)', amount: 4000 },
                ],
                administration: [
                    { id: newId('b'), source: 'promotion', description: 'Book launch event & convention fees', amount: 1500 },
                ],
                travel: [], research: [], professionalDevelopment: [],
            }
        },
    } as unknown as FormData;

    // --- Finalize remaining fields (no auto-balancing needed) ---
    [p1, p2, p3].forEach(p => {
        Object.assign(p, {
            craftGenres: p.craftGenres || [], danceGenres: p.danceGenres || [], literaryGenres: p.literaryGenres || [], musicGenres: p.musicGenres || [], theatreGenres: p.theatreGenres || [], visualArtsGenres: p.visualArtsGenres || [], otherArtisticDisciplineSpecify: '',
            activityType: 'public-presentation',
            permissionConfirmationFiles: [],
            paymentAndConditions: "All artists and collaborators will be paid professional fees according to CARFAC/RAAV standards. A safe and respectful work environment will be maintained.",
            schedule: "A detailed schedule with milestones and deadlines is available in the workplan. Key phases include: Research/Creation, Production/Rehearsal, and Presentation/Exhibition.",
            culturalIntegrity: "The project will be conducted with deep respect for the cultures and communities represented. We will work with consultants and follow established protocols to ensure authenticity and prevent appropriation.",
            whoWillWork: "The core team consists of dedicated professionals selected for their expertise. Community collaborators will be engaged as needed.",
            howSelectionDetermined: "Core team members were selected based on their proven track record. Other participants are selected via an open, accessible process relevant to the project's needs.",
            additionalInfo: 'No additional information provided at this time.',
        });
    });

    return [p1, p2, p3];
};

const createSampleTasks = (projects: FormData[], members: Member[]): Task[] => {
    const [p1, p2, p3] = projects;
    const [samuel, marcus, chantal, kaelen, anya] = members;
    const tasks: Task[] = [];
    const taskGen = (p: FormData, code: string, title: string, desc: string, member: Member, status: Task['status'], start: string, due: string, type: Task['taskType'], estHrs: number, budgetCat: keyof FormData['budget']['expenses'], budgetSrc: string, work: Task['workType'], rate: number, complete: boolean = false) => ({
        id: newId('task'), taskCode: code, projectId: p.id, title, description: desc, assignedMemberId: member.id, status, startDate: start, dueDate: due, taskType: type, isComplete: status === 'Done' || complete, estimatedHours: estHrs, actualHours: 0, budgetItemId: getBudgetItemId(p, budgetCat, budgetSrc), workType: work, hourlyRate: rate, updatedAt: due
    });

    // Project 1 Tasks (20) - Echoes of the Red River
    tasks.push(
        taskGen(p1, 'EOTR-01', 'Historical Research & Site Planning', 'Work with Dr. Sharma to identify key historical sites and themes for recording.', anya, 'Done', dateFor(2025, 4, 15), dateFor(2025, 5, 15), 'Time-Based', 30, 'professionalFees', 'consultant', 'Paid', 100),
        taskGen(p1, 'EOTR-02', 'Purchase Recording Equipment', 'Acquire hydrophones and a multi-track field recorder.', marcus, 'Done', dateFor(2025, 5, 1), dateFor(2025, 5, 10), 'Milestone', 0, 'production', 'equipment', 'Paid', 0),
        taskGen(p1, 'EOTR-03', 'Attend Sound-mixing Masterclass', 'Attend professional development workshop.', samuel, 'Done', dateFor(2025, 5, 20), dateFor(2025, 5, 22), 'Time-Based', 16, 'professionalDevelopment', 'professionalDevelopment', 'Paid', 75),
        taskGen(p1, 'EOTR-04', 'Field Recording - Phase 1 (South)', 'Capture audio from Emerson to Winnipeg.', samuel, 'In Progress', dateFor(2025, 6, 1), dateFor(2025, 7, 15), 'Time-Based', 40, 'professionalFees', 'artists', 'Paid', 75),
        taskGen(p1, 'EOTR-05', 'Oral History Interviews - Set 1', 'Record interviews with community members in the south basin.', marcus, 'In Progress', dateFor(2025, 6, 10), dateFor(2025, 7, 20), 'Time-Based', 20, 'professionalFees', 'indigenous', 'Paid', 75),
        taskGen(p1, 'EOTR-06', 'Field Recording - Phase 2 (North)', 'Capture audio from Winnipeg to Lockport.', samuel, 'To Do', dateFor(2025, 7, 16), dateFor(2025, 8, 31), 'Time-Based', 40, 'professionalFees', 'artists', 'Paid', 75),
        taskGen(p1, 'EOTR-07', 'Transcribe Oral Histories', 'Create text transcripts for all recorded interviews.', marcus, 'To Do', dateFor(2025, 7, 21), dateFor(2025, 8, 21), 'Time-Based', 30, 'professionalFees', 'artists', 'Volunteer', 25),
        taskGen(p1, 'EOTR-08', 'Catalog and Organize Audio Library', 'Log, tag, and organize all captured audio files.', samuel, 'To Do', dateFor(2025, 9, 1), dateFor(2025, 9, 15), 'Time-Based', 20, 'professionalFees', 'artists', 'Paid', 75),
        taskGen(p1, 'EOTR-09', 'Develop Online Map Prototype', 'Create a working prototype of the interactive online map.', marcus, 'To Do', dateFor(2025, 9, 1), dateFor(2025, 9, 30), 'Time-Based', 20, 'administration', 'promotion', 'Paid', 80),
        taskGen(p1, 'EOTR-10', 'Begin Composition - Movement 1', 'Start composing the first movement using southern recordings.', samuel, 'To Do', dateFor(2025, 9, 16), dateFor(2025, 10, 15), 'Time-Based', 40, 'professionalFees', 'artists', 'Paid', 75),
        taskGen(p1, 'EOTR-11', 'License Archival Audio', 'Secure rights for historical audio clips.', marcus, 'Backlog', dateFor(2025, 9, 20), dateFor(2025, 10, 5), 'Milestone', 0, 'research', 'research', 'Paid', 0),
        taskGen(p1, 'EOTR-12', 'Begin Composition - Movement 2', 'Compose second movement using northern recordings.', samuel, 'To Do', dateFor(2025, 10, 16), dateFor(2025, 11, 15), 'Time-Based', 40, 'professionalFees', 'artists', 'Paid', 75),
        taskGen(p1, 'EOTR-13', 'Website and Social Media Launch', 'Launch promotional website and begin outreach campaign.', marcus, 'Backlog', dateFor(2025, 10, 20), dateFor(2025, 10, 20), 'Milestone', 0, 'administration', 'promotion', 'Paid', 0),
        taskGen(p1, 'EOTR-14', 'Mix & Master Full Composition', 'Final mix and master of all audio movements.', samuel, 'Backlog', dateFor(2025, 11, 16), dateFor(2025, 11, 30), 'Time-Based', 25, 'production', 'rentals', 'Paid', 80),
        taskGen(p1, 'EOTR-15', 'Prepare Installation Speakers & Playback System', 'Set up and test the physical audio installation hardware.', marcus, 'Backlog', dateFor(2025, 12, 1), dateFor(2025, 12, 5), 'Time-Based', 15, 'production', 'equipment', 'Paid', 50),
        taskGen(p1, 'EOTR-16', 'Finalize Online Map Interface', 'Integrate final audio and launch the public website.', marcus, 'Backlog', dateFor(2025, 12, 1), dateFor(2025, 12, 10), 'Time-Based', 15, 'administration', 'promotion', 'Paid', 80),
        taskGen(p1, 'EOTR-17', 'Venue Installation', 'Install the audio exhibit at the final location.', marcus, 'Backlog', dateFor(2025, 12, 8), dateFor(2025, 12, 12), 'Time-Based', 20, 'production', 'equipment', 'Paid', 50),
        taskGen(p1, 'EOTR-18', 'Host Premiere / Opening Event', 'Host the public launch event for the installation.', marcus, 'Backlog', dateFor(2025, 12, 13), dateFor(2025, 12, 13), 'Milestone', 0, 'administration', 'promotion', 'Paid', 0),
        taskGen(p1, 'EOTR-19', 'Project Teardown', 'Dismantle and return all equipment.', marcus, 'Backlog', dateFor(2025, 12, 20), dateFor(2025, 12, 20), 'Time-Based', 8, 'production', 'equipment', 'Volunteer', 25),
        taskGen(p1, 'EOTR-20', 'Final Reporting', 'Complete all final reports for funders.', marcus, 'Backlog', dateFor(2025, 12, 30), dateFor(2025, 12, 30), 'Milestone', 0, 'administration', 'personnel', 'Paid', 0)
    );

    // Project 2 Tasks (20) - Northern Light
    tasks.push(
        taskGen(p2, 'NL-01', 'Finalize Show Concept & Narrative', 'Solidify the storyline and characters.', chantal, 'Done', dateFor(2025, 5, 1), dateFor(2025, 5, 15), 'Milestone', 0, 'professionalFees', 'artists', 'Paid', 0),
        taskGen(p2, 'NL-02', 'Performer Casting & Contracts', 'Audition, cast, and contract 4 circus performers.', marcus, 'Done', dateFor(2025, 5, 15), dateFor(2025, 5, 30), 'Milestone', 0, 'administration', 'personnel', 'Paid', 0),
        taskGen(p2, 'NL-03', 'Initial Music Composition', 'Samuel to compose main themes and musical palette.', samuel, 'Done', dateFor(2025, 5, 20), dateFor(2025, 6, 20), 'Time-Based', 40, 'professionalFees', 'artists', 'Paid', 75),
        taskGen(p2, 'NL-04', 'Set & Costume Design', 'Work with designer to create concepts and technical drawings.', chantal, 'Done', dateFor(2025, 6, 1), dateFor(2025, 6, 30), 'Time-Based', 50, 'professionalFees', 'designers', 'Paid', 60),
        taskGen(p2, 'NL-05', 'Purchase Fabrication Materials', 'Source and buy all materials for costumes and props.', marcus, 'Done', dateFor(2025, 7, 1), dateFor(2025, 7, 7), 'Milestone', 0, 'production', 'materials', 'Paid', 0),
        taskGen(p2, 'NL-06', 'Creation/Rehearsal Block 1', 'Weeks 1-4 of rehearsal. Focus on choreography and act creation.', chantal, 'In Progress', dateFor(2025, 7, 8), dateFor(2025, 8, 2), 'Time-Based', 120, 'professionalFees', 'artists', 'Paid', 50),
        taskGen(p2, 'NL-07', 'Rigging & Equipment Rental', 'Secure all necessary aerial rigging and safety equipment.', marcus, 'In Progress', dateFor(2025, 7, 10), dateFor(2025, 7, 15), 'Milestone', 0, 'production', 'rentals', 'Paid', 0),
        taskGen(p2, 'NL-08', 'Costume & Prop Fabrication', 'Build all costumes and props.', marcus, 'In Progress', dateFor(2025, 7, 8), dateFor(2025, 8, 30), 'Time-Based', 80, 'production', 'materials', 'In-Kind', 30),
        taskGen(p2, 'NL-09', 'Creation/Rehearsal Block 2', 'Weeks 5-8 of rehearsal. Focus on show flow and transitions.', chantal, 'To Do', dateFor(2025, 8, 5), dateFor(2025, 8, 30), 'Time-Based', 120, 'professionalFees', 'artists', 'Paid', 50),
        taskGen(p2, 'NL-10', 'Refine Musical Score', 'Integrate rehearsal feedback and finalize the full score.', samuel, 'To Do', dateFor(2025, 9, 1), dateFor(2025, 9, 30), 'Time-Based', 40, 'professionalFees', 'artists', 'Paid', 75),
        taskGen(p2, 'NL-11', 'Lighting Design', 'Consult with lighting tech for WIP showing.', marcus, 'To Do', dateFor(2025, 9, 15), dateFor(2025, 9, 25), 'Time-Based', 10, 'production', 'technical', 'Paid', 100),
        taskGen(p2, 'NL-12', 'Book Promo Photographer/Videographer', 'Contract a professional to document the show.', marcus, 'To Do', dateFor(2025, 9, 20), dateFor(2025, 9, 30), 'Milestone', 0, 'administration', 'promotion', 'Paid', 0),
        taskGen(p2, 'NL-13', 'Full Run-Throughs', 'Week of full show run-throughs.', chantal, 'To Do', dateFor(2025, 10, 1), dateFor(2025, 10, 7), 'Time-Based', 30, 'professionalFees', 'artists', 'Paid', 50),
        taskGen(p2, 'NL-14', 'Technical Rehearsals in Venue', 'Integrate lighting, sound, and set in the performance space.', marcus, 'To Do', dateFor(2025, 10, 8), dateFor(2025, 10, 12), 'Time-Based', 20, 'professionalFees', 'artists', 'Paid', 50),
        taskGen(p2, 'NL-15', 'Promo Photo & Video Shoot', 'Dedicated session to capture high-quality marketing materials.', marcus, 'To Do', dateFor(2025, 10, 13), dateFor(2025, 10, 13), 'Milestone', 0, 'administration', 'promotion', 'Paid', 0),
        taskGen(p2, 'NL-16', 'Work-in-Progress Public Showing', 'Perform the show for Festival du Voyageur audience.', chantal, 'To Do', dateFor(2025, 10, 15), dateFor(2025, 10, 15), 'Milestone', 0, 'professionalFees', 'artists', 'Paid', 0),
        taskGen(p2, 'NL-17', 'Post-Show Feedback Session', 'Gather feedback from audience and partners.', marcus, 'Backlog', dateFor(2025, 10, 16), dateFor(2025, 10, 16), 'Milestone', 0, 'administration', 'personnel', 'Paid', 0),
        taskGen(p2, 'NL-18', 'Edit Promotional Video', 'Create a 2-minute promo video for touring applications.', marcus, 'Backlog', dateFor(2025, 10, 20), dateFor(2025, 11, 10), 'Time-Based', 10, 'administration', 'promotion', 'In-Kind', 40),
        taskGen(p2, 'NL-19', 'Strike Show & Return Rentals', 'Clean venue and return all rented equipment.', marcus, 'Backlog', dateFor(2025, 10, 17), dateFor(2025, 10, 18), 'Time-Based', 16, 'administration', 'personnel', 'Volunteer', 25),
        taskGen(p2, 'NL-20', 'Final Reporting & Tour Planning', 'Prepare final reports and begin outreach to presenters.', marcus, 'Backlog', dateFor(2025, 11, 1), dateFor(2025, 11, 30), 'Milestone', 0, 'administration', 'personnel', 'Paid', 0)
    );

    // Project 3 Tasks (20) - Digital Quill
    tasks.push(
        taskGen(p3, 'DQ-01', 'Story Protocol Consultation', 'Consult with Elder on story elements and cultural protocols.', kaelen, 'Done', dateFor(2025, 4, 5), dateFor(2025, 4, 10), 'Time-Based', 10, 'professionalFees', 'indigenous', 'Paid', 100),
        taskGen(p3, 'DQ-02', 'Finalize Script & Storyboards', 'Complete the full 120-page script and thumbnail storyboards.', kaelen, 'Done', dateFor(2025, 4, 15), dateFor(2025, 5, 15), 'Time-Based', 80, 'professionalFees', 'artists', 'Paid', 75),
        taskGen(p3, 'DQ-03', 'Editorial Review of Script', 'Work with mentor/editor to refine script.', kaelen, 'Done', dateFor(2025, 5, 16), dateFor(2025, 5, 25), 'Time-Based', 20, 'professionalFees', 'consultant', 'Paid', 100),
        taskGen(p3, 'DQ-04', 'Purchase Art Supplies & Software', 'Get all necessary paper, inks, and software subscriptions.', marcus, 'Done', dateFor(2025, 5, 20), dateFor(2025, 5, 22), 'Milestone', 0, 'production', 'materials', 'Paid', 0),
        taskGen(p3, 'DQ-05', 'Penciling - Chapter 1', 'Complete rough pencil drawings for Chapter 1.', kaelen, 'Done', dateFor(2025, 5, 26), dateFor(2025, 6, 15), 'Time-Based', 40, 'professionalFees', 'artists', 'Paid', 75),
        taskGen(p3, 'DQ-06', 'Inking - Chapter 1', 'Complete final ink drawings for Chapter 1.', kaelen, 'Done', dateFor(2025, 6, 16), dateFor(2025, 6, 26), 'Time-Based', 30, 'professionalFees', 'artists', 'Paid', 75),
        taskGen(p3, 'DQ-07', 'Coloring & Lettering - Chapter 1', 'Complete digital coloring and lettering.', kaelen, 'Done', dateFor(2025, 6, 27), dateFor(2025, 7, 7), 'Time-Based', 30, 'professionalFees', 'artists', 'Paid', 75),
        taskGen(p3, 'DQ-08', 'Submit Sample Chapter to Publisher', 'Send completed Chapter 1 to interested publisher.', marcus, 'Done', dateFor(2025, 7, 8), dateFor(2025, 7, 8), 'Milestone', 0, 'administration', 'promotion', 'Paid', 0),
        taskGen(p3, 'DQ-09', 'Penciling - Chapters 2-3', 'Complete rough pencil drawings for Chapters 2 and 3.', kaelen, 'Done', dateFor(2025, 7, 9), dateFor(2025, 8, 9), 'Time-Based', 80, 'professionalFees', 'artists', 'Paid', 75),
        taskGen(p3, 'DQ-10', 'Inking - Chapters 2-3', 'Complete final ink drawings for Chapters 2 and 3.', kaelen, 'Done', dateFor(2025, 8, 10), dateFor(2025, 8, 30), 'Time-Based', 60, 'professionalFees', 'artists', 'Paid', 75),
        taskGen(p3, 'DQ-11', 'Coloring & Lettering - Chapters 2-3', 'Complete digital coloring and lettering.', kaelen, 'Done', dateFor(2025, 8, 31), dateFor(2025, 9, 15), 'Time-Based', 60, 'professionalFees', 'artists', 'Paid', 75),
        taskGen(p3, 'DQ-12', 'Plan Kickstarter Campaign', 'Develop rewards and campaign for pre-orders.', marcus, 'Done', dateFor(2025, 9, 1), dateFor(2025, 9, 15), 'Milestone', 0, 'administration', 'promotion', 'Paid', 0),
        taskGen(p3, 'DQ-13', 'Penciling - Chapters 4-5', 'Complete rough pencil drawings for final chapters.', kaelen, 'Done', dateFor(2025, 9, 16), dateFor(2025, 10, 1), 'Time-Based', 80, 'professionalFees', 'artists', 'Paid', 75),
        taskGen(p3, 'DQ-14', 'Inking - Chapters 4-5', 'Complete final ink drawings for final chapters.', kaelen, 'Done', dateFor(2025, 10, 2), dateFor(2025, 10, 10), 'Time-Based', 60, 'professionalFees', 'artists', 'Paid', 75),
        taskGen(p3, 'DQ-15', 'Launch Kickstarter Campaign', 'Run the 30-day pre-order campaign.', marcus, 'Done', dateFor(2025, 9, 15), dateFor(2025, 10, 15), 'Milestone', 0, 'administration', 'promotion', 'Paid', 0),
        taskGen(p3, 'DQ-16', 'Coloring & Lettering - Chapters 4-5', 'Complete final digital work.', kaelen, 'Done', dateFor(2025, 10, 11), dateFor(2025, 10, 20), 'Time-Based', 60, 'professionalFees', 'artists', 'Paid', 75),
        taskGen(p3, 'DQ-17', 'Final Manuscript Assembly & Formatting', 'Combine all chapters and format for printing.', kaelen, 'Done', dateFor(2025, 10, 21), dateFor(2025, 10, 25), 'Time-Based', 20, 'professionalFees', 'artists', 'Paid', 75),
        taskGen(p3, 'DQ-18', 'Send to Printer', 'Submit final files for initial print run.', marcus, 'Done', dateFor(2025, 10, 26), dateFor(2025, 10, 26), 'Milestone', 0, 'production', 'other', 'Paid', 0),
        taskGen(p3, 'DQ-19', 'Plan Book Launch Event', 'Coordinate with bookstore for launch party.', marcus, 'Done', dateFor(2025, 10, 15), dateFor(2025, 10, 30), 'Milestone', 0, 'administration', 'promotion', 'Paid', 0),
        taskGen(p3, 'DQ-20', 'Fulfill Kickstarter Rewards', 'Package and ship pre-orders.', marcus, 'Done', dateFor(2025, 11, 15), dateFor(2025, 11, 30), 'Time-Based', 20, 'administration', 'promotion', 'Volunteer', 25)
    );

    return tasks;
};

const createSampleActivities = (tasks: Task[], members: Member[]): Activity[] => {
    const activities: Activity[] = [];
    const actGen = (taskCode: string, member: Member, desc: string, hrs: number, date: string, status: ActivityStatus = 'Approved') => {
        const task = tasks.find(t => t.taskCode === taskCode);
        if (!task) return;
        activities.push({
            id: newId('act'), taskId: task.id, memberId: member.id, description: desc, hours: hrs, status,
            startDate: date, endDate: date, createdAt: date, updatedAt: date
        });
    };
    const [samuel, marcus, chantal, kaelen, anya] = members;

    // P1 Activities
    actGen('EOTR-01', anya, 'Initial consultation meeting.', 8, dateFor(2025, 4, 20));
    actGen('EOTR-01', anya, 'Archival research and site identification.', 22, dateFor(2025, 5, 10));
    actGen('EOTR-03', samuel, 'Day 1 of workshop.', 8, dateFor(2025, 5, 20));
    actGen('EOTR-03', samuel, 'Day 2 of workshop.', 8, dateFor(2025, 5, 21));
    actGen('EOTR-04', samuel, 'Recording at Emerson border crossing.', 8, dateFor(2025, 6, 5));
    actGen('EOTR-04', samuel, 'Hydrophone recordings near St. Adolphe.', 6, dateFor(2025, 6, 12));
    actGen('EOTR-04', samuel, 'Ambient sound capture at The Forks.', 4, dateFor(2025, 6, 20), 'Pending');
    actGen('EOTR-05', marcus, 'Interview with local fisherman.', 4, dateFor(2025, 6, 15));

    // P2 Activities
    actGen('NL-03', samuel, 'Composing main themes.', 40, dateFor(2025, 6, 15));
    actGen('NL-04', chantal, 'Design meetings and sketching.', 50, dateFor(2025, 6, 25));
    actGen('NL-06', chantal, 'Rehearsal supervision and choreography.', 100, dateFor(2025, 7, 30));
    actGen('NL-08', marcus, 'Sourcing materials and overseeing prop construction.', 60, dateFor(2025, 8, 15));

    // P3 Activities - All Done
    actGen('DQ-01', kaelen, 'Meeting with Elder for story protocol.', 10, dateFor(2025, 4, 8));
    actGen('DQ-02', kaelen, 'Script writing and refinement.', 40, dateFor(2025, 4, 30));
    actGen('DQ-02', kaelen, 'Full storyboard creation.', 40, dateFor(2025, 5, 14));
    actGen('DQ-03', kaelen, 'Reviewing editorial feedback and making revisions.', 20, dateFor(2025, 5, 20));
    actGen('DQ-05', kaelen, 'Penciling pages 1-20.', 40, dateFor(2025, 6, 10));
    actGen('DQ-06', kaelen, 'Inking pages 1-20.', 30, dateFor(2025, 6, 20));
    actGen('DQ-07', kaelen, 'Coloring and lettering pages 1-20.', 30, dateFor(2025, 7, 5));
    actGen('DQ-09', kaelen, 'Penciling pages 21-60.', 80, dateFor(2025, 8, 1));
    actGen('DQ-10', kaelen, 'Inking pages 21-60.', 60, dateFor(2025, 8, 20));
    actGen('DQ-11', kaelen, 'Coloring and lettering pages 21-60.', 60, dateFor(2025, 9, 10));
    actGen('DQ-13', kaelen, 'Penciling pages 61-120.', 80, dateFor(2025, 9, 28));
    actGen('DQ-14', kaelen, 'Inking pages 61-120.', 60, dateFor(2025, 10, 8));
    actGen('DQ-16', kaelen, 'Coloring and lettering pages 61-120.', 60, dateFor(2025, 10, 18));
    actGen('DQ-17', kaelen, 'Final formatting and file preparation for printer.', 20, dateFor(2025, 10, 24));
    
    return activities;
}

const createSampleDirectExpenses = (projects: FormData[]): DirectExpense[] => {
    const [p1, p2, p3] = projects;
    return [
        { id: newId('dexp'), projectId: p1.id, budgetItemId: getBudgetItemId(p1, 'travel', 'transportation'), description: 'Gas for trip to Selkirk', amount: 45.50, date: dateFor(2025, 7, 2) },
        { id: newId('dexp'), projectId: p3.id, budgetItemId: getBudgetItemId(p3, 'production', 'materials'), description: 'Specialty bristol board and inks', amount: 350.00, date: dateFor(2025, 5, 21) },
        { id: newId('dexp'), projectId: p3.id, budgetItemId: getBudgetItemId(p3, 'production', 'other'), description: 'Deposit for initial print run', amount: 2000.00, date: dateFor(2025, 10, 28) }
    ];
};

const createSampleReports = (projects: FormData[]): Report[] => {
    const [p1, p2, p3] = projects;
    return [
        {
            id: `rep_${p3.id}`,
            projectId: p3.id,
            projectResults: "The 'Digital Quill' project successfully produced a 120-page, professionally finished graphic novel titled 'The Seventh Fire'. The project met all its key objectives, from creation to initial printing, and fostered the lead artist's development significantly. The story, which blends Anishinaabe prophecy with a contemporary young adult narrative, was completed on schedule. The final artwork and script were delivered to our publishing partner, and a successful Kickstarter campaign ensured funding for a larger print run and provided market validation. The project culminated in a well-attended book launch, establishing a strong foundation for the book's distribution and the artist's career.",
            grantSpendingDescription: "The grant funding was instrumental and was spent exactly as budgeted. The majority of funds provided a living stipend for the lead artist, allowing them to dedicate themselves fully to the project for a six-month period. This was critical for maintaining the high quality and consistent output required. Funds were also used for honorariums for an editor and an Elder, whose guidance was invaluable. The remaining funds covered the costs of professional art materials and the initial deposit for the print run, which were essential for creating a market-ready product.",
            workplanAdjustments: "The workplan was followed very closely with only minor adjustments. We allocated slightly more time to the inking phase after realizing the detail required for the specific visual style. This was accommodated by shortening the final formatting phase, which went faster than anticipated. No changes impacted the budget or the final deadline.",
            involvedPeople: ['indigenous', 'underserved'],
            involvedActivities: ['collaborators', 'audience', 'elders', 'participants'],
            impactStatements: {
                q1: '5', q2: '5', q3: '5', q4: '5', q5: '5', q6: '4', q7: 'na', q8: '4', q9: '5', q10: 'na', q11: '4'
            },
            highlights: [
                { id: newId('hl'), title: 'Book Launch Event Photos', url: 'https://example.com/launch_gallery' },
                { id: newId('hl'), title: 'CBC Radio Interview with Kaelen Thomas', url: 'https://example.com/cbc_interview' }
            ],
            feedback: "The process was smooth. The reporting tools in this app were helpful for tracking our progress against the budget.",
            additionalFeedback: "N/A"
        }
    ];
};

const createSampleData = () => {
    const members: Member[] = rawMembers.map(m => ({
        ...m,
        id: newId('mem'),
        memberId: `M-${Math.floor(1000 + Math.random() * 9000)}`,
        postalCode: 'R3B 1B9',
        imageUrl: `https://i.pravatar.cc/256?u=${m.email}`
    }));

    const projects = createSampleProjects(members);
    const tasks = createSampleTasks(projects, members);
    const activities = createSampleActivities(tasks, members);
    const directExpenses = createSampleDirectExpenses(projects);
    const reports = createSampleReports(projects);

    return { projects, members, tasks, activities, directExpenses, reports };
};

const DetailedSampleData: React.FC = () => {
    const { dispatch, notify } = useAppContext();
    const [isClearModalOpen, setIsClearModalOpen] = useState(false);

    const handleLoadData = () => {
        const data = createSampleData();
        dispatch({ type: 'LOAD_DATA', payload: data });
        notify('Detailed sample data loaded successfully!', 'success');
    };

    const confirmClearData = () => {
        dispatch({ type: 'CLEAR_ALL_DATA' });
        notify('All application data has been cleared.', 'success');
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
                <i className="fa-solid fa-database text-6xl text-teal-500"></i>
                <h1 className="mt-4 text-3xl font-bold text-slate-900">Load Detailed Sample Data</h1>
                <p className="mt-2 text-lg text-slate-600 max-w-2xl mx-auto">This tool will populate the application with a rich, comprehensive dataset, including multiple projects, tasks, and activities. This is ideal for testing all features thoroughly.</p>
                
                <div className="mt-6 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-800 p-4 max-w-2xl mx-auto text-left">
                    <div className="flex">
                        <div className="py-1"><i className="fa-solid fa-triangle-exclamation mr-3"></i></div>
                        <div>
                            <p className="font-bold">Warning!</p>
                            <p className="text-sm">Loading sample data will <strong className="uppercase">replace</strong> any existing data you have entered. This action cannot be undone.</p>
                        </div>
                    </div>
                </div>

                <div className="mt-8 flex items-center justify-center gap-4">
                    <button onClick={handleLoadData} className="px-8 py-3 text-lg font-medium text-white bg-teal-600 border border-transparent rounded-md shadow-sm hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500">
                        <i className="fa-solid fa-gears mr-2"></i>
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
