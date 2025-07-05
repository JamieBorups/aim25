
import React, { useState } from 'react';
import { FormData, Member, Task, BudgetItem, Activity, BudgetItemStatus, ActivityStatus } from '../types';
import { useAppContext } from '../context/AppContext';
import ConfirmationModal from './ui/ConfirmationModal';

const newId = (prefix: string) => `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

const getBudgetItemId = (project: FormData, category: keyof FormData['budget']['expenses'], source: string): string => {
    const item = project.budget.expenses[category]?.find(i => i.source === source);
    if (!item) return '';
    return item.id;
};

const dateFor = (year: number, month: number, day: number): string => {
    return new Date(year, month - 1, day).toISOString().split('T')[0];
};

const rawMembers = [
    {
        firstName: 'Samuel', lastName: 'Chen', email: 'samuel.chen@example.com', province: 'MB', city: 'Winnipeg',
        shortBio: 'A gifted composer and sound designer specializing in electro-acoustic music and field recordings.',
        artistBio: 'Samuel Chen is a Winnipeg-based composer whose work is known for its emotional depth and textural complexity. His work often explores the intersection of natural environments and human-made soundscapes. He has scored numerous documentary films and his unique blend of acoustic and electronic soundscapes has garnered critical acclaim.',
        availability: 'full-time'
    },
    {
        firstName: 'Marcus', lastName: 'Thorne', email: 'marcus.thorne@example.com', province: 'MB', city: 'Winnipeg',
        shortBio: 'An accomplished producer and project manager with a focus on interdisciplinary arts and cultural festivals.',
        artistBio: 'With a background in theatre and event production, Marcus Thorne has a proven track record of bringing complex artistic visions to life, ensuring projects are delivered on time and within budget while maintaining artistic integrity.',
        availability: 'contract'
    },
    {
        firstName: 'Dr. Anya', lastName: 'Sharma', email: 'anya.sharma@example.com', province: 'MB', city: 'Winnipeg',
        shortBio: 'A historian and researcher from the University of Manitoba specializing in the history of the Red River valley.',
        artistBio: 'Dr. Anya Sharma is a respected historian whose research focuses on the ecological and social histories of Manitoba\'s waterways. She has published several papers on the topic and is a passionate advocate for public history projects that connect communities with their local heritage.',
        availability: 'contract'
    },
];

const createSampleData = () => {
    const members: Member[] = rawMembers.map(m => ({
        ...m,
        id: newId('mem'),
        memberId: `M-${Math.floor(1000 + Math.random() * 9000)}`,
        postalCode: 'R3B 1B9',
        imageUrl: `https://i.pravatar.cc/256?u=${m.email}`
    }));

    const [samuel, marcus, anya] = members;

    // Project 1: Echoes of the Red River
    let project: FormData = {
        id: newId('proj'),
        projectTitle: 'Echoes of the Red River',
        status: 'Active',
        artisticDisciplines: ['music', 'media'],
        musicGenres: ['electro-acoustic', 'new-music'],
        mediaGenres: ['audio-art', 'documentary'],
        projectStartDate: dateFor(2025, 4, 15),
        projectEndDate: dateFor(2025, 12, 15),
        background: 'This project aims to create a sonic portrait of the Red River, exploring its historical, ecological, and cultural significance through sound. It builds on previous work in field recording and audio art to create an immersive public experience.',
        projectDescription: "We will create a 'sound map' of the Red River from Emerson to Lockport. This involves capturing field recordings (above and below water), archival audio, and oral histories from communities along the river. These sounds will be woven into an electro-acoustic composition by Samuel Chen. The final work will be presented as a multi-channel audio installation at The Forks in Winnipeg and as an interactive online map. The project seeks to connect listeners to the river in a new, profound way, fostering a deeper appreciation for this vital waterway.",
        audience: 'The primary audience includes the general public visiting The Forks, as well as students, new music enthusiasts, and local history buffs. An online version will target a national and international audience interested in sound art and environmental projects.',
        collaboratorDetails: [
            { memberId: samuel.id, role: 'Lead Composer & Sound Artist' },
            { memberId: marcus.id, role: 'Producer & Location Manager' },
            { memberId: anya.id, role: 'Historical Consultant' }
        ],
        budget: {
            revenues: {
                grants: [{ id: newId('b'), source: 'mac', description: 'This funding application', amount: 10000, status: 'Pending' as BudgetItemStatus }],
                fundraising: [{ id: newId('b'), source: 'sponsorship', description: 'Sponsorship from a local business', amount: 2000, actualAmount: 2000, status: 'Approved' as BudgetItemStatus }],
                tickets: { numVenues: 0, percentCapacity: 0, venueCapacity: 0, avgTicketPrice: 0, description: '' },
                sales: [],
                contributions: [],
            },
            expenses: {
                professionalFees: [
                    { id: newId('b'), source: 'artists', description: 'Lead Composer Fee', amount: 6000 },
                    { id: newId('b'), source: 'consultant', description: 'Historical Consultant Honorarium', amount: 1500 },
                ],
                production: [
                    { id: newId('b'), source: 'equipment', description: 'Hydrophones, field recorder', amount: 2000 },
                    { id: newId('b'), source: 'rentals', description: 'Audio post-production suite', amount: 1000 },
                ],
                travel: [ { id: newId('b'), source: 'transportation', description: 'Mileage for travel along river', amount: 500 }],
                administration: [{ id: newId('b'), source: 'promotion', description: 'Online promotion & premiere event', amount: 1000 }],
                research: [],
                professionalDevelopment: []
            },
        }
    } as unknown as FormData;

    // --- Finalize remaining fields ---
    project = {
      ...project,
      craftGenres: [], danceGenres: [], literaryGenres: [], otherArtisticDisciplineSpecify: '', visualArtsGenres: [], theatreGenres: [],
      activityType: 'public-presentation',
      permissionConfirmationFiles: [],
      paymentAndConditions: "All artists and collaborators will be paid professional fees according to CARFAC/RAAV standards. A safe and respectful work environment will be maintained for all location recordings and interviews.",
      schedule: "A detailed schedule is in development. Key phases include: Research (Apr-May), Field Recording (Jun-Aug), Composition (Sep-Oct), and Installation/Premiere (Nov-Dec).",
      culturalIntegrity: "The project will be conducted with deep respect for the histories and communities along the Red River, including Treaty 1 Territory. We will work with a historical consultant to ensure accuracy and sensitivity.",
      whoWillWork: "The core team consists of a composer, producer, and historian. Additional collaborators may be engaged for specific oral history interviews.",
      howSelectionDetermined: "Core team members were selected based on their expertise and shared vision for the project.",
      additionalInfo: 'No additional information.',
    };
    
    const tasks: Task[] = [
        { id: newId('task'), taskCode: 'EOTR-01', projectId: project.id, title: 'Historical Research & Consultation', description: 'Work with Dr. Sharma to identify key historical sites and themes.', assignedMemberId: samuel.id, status: 'Done', startDate: dateFor(2025, 4, 15), dueDate: dateFor(2025, 5, 15), taskType: 'Time-Based', isComplete: true, estimatedHours: 24, actualHours: 0, budgetItemId: getBudgetItemId(project, 'professionalFees', 'consultant'), workType: 'Paid', hourlyRate: 62.50, updatedAt: dateFor(2025, 5, 15) },
        { id: newId('task'), taskCode: 'EOTR-02', projectId: project.id, title: 'Purchase Recording Equipment', description: 'Acquire hydrophones and a multi-track field recorder.', assignedMemberId: marcus.id, status: 'Done', startDate: dateFor(2025, 5, 1), dueDate: dateFor(2025, 5, 10), taskType: 'Milestone', isComplete: true, estimatedHours: 0, actualHours: 0, budgetItemId: '', workType: 'Paid', hourlyRate: 0, updatedAt: dateFor(2025, 5, 10) },
        { id: newId('task'), taskCode: 'EOTR-03', projectId: project.id, title: 'Field Recording - South', description: 'Capture audio from Emerson to Winnipeg.', assignedMemberId: samuel.id, status: 'In Progress', startDate: dateFor(2025, 6, 1), dueDate: dateFor(2025, 7, 15), taskType: 'Time-Based', isComplete: false, estimatedHours: 40, actualHours: 0, budgetItemId: getBudgetItemId(project, 'professionalFees', 'artists'), workType: 'Paid', hourlyRate: 75, updatedAt: dateFor(2025, 6, 15) },
        { id: newId('task'), taskCode: 'EOTR-04', projectId: project.id, title: 'Field Recording - North', description: 'Capture audio from Winnipeg to Lockport.', assignedMemberId: samuel.id, status: 'To Do', startDate: dateFor(2025, 7, 16), dueDate: dateFor(2025, 8, 31), taskType: 'Time-Based', isComplete: false, estimatedHours: 40, actualHours: 0, budgetItemId: getBudgetItemId(project, 'professionalFees', 'artists'), workType: 'Paid', hourlyRate: 75, updatedAt: dateFor(2025, 7, 16) },
        { id: newId('task'), taskCode: 'EOTR-05', projectId: project.id, title: 'Composition & Sound Design', description: 'Begin composing the piece using the collected audio.', assignedMemberId: samuel.id, status: 'To Do', startDate: dateFor(2025, 9, 1), dueDate: dateFor(2025, 11, 15), taskType: 'Time-Based', isComplete: false, estimatedHours: 80, actualHours: 0, budgetItemId: getBudgetItemId(project, 'professionalFees', 'artists'), workType: 'Paid', hourlyRate: 75, updatedAt: dateFor(2025, 9, 1) },
        { id: newId('task'), taskCode: 'EOTR-06', projectId: project.id, title: 'Final Installation & Premiere', description: 'Install the audio exhibit and host the opening event.', assignedMemberId: marcus.id, status: 'Backlog', startDate: dateFor(2025, 11, 20), dueDate: dateFor(2025, 12, 10), taskType: 'Milestone', isComplete: false, estimatedHours: 0, actualHours: 0, budgetItemId: '', workType: 'Paid', hourlyRate: 0, updatedAt: dateFor(2025, 11, 20) }
    ];

    const findTask = (code: string) => tasks.find(t => t.taskCode === code);
    const activities: Activity[] = [
        { id: newId('act'), taskId: findTask('EOTR-01')?.id || '', memberId: anya.id, description: 'Initial consultation meeting and archival review.', hours: 10, status: 'Approved' as ActivityStatus, startDate: dateFor(2025, 4, 20), endDate: dateFor(2025, 4, 20), createdAt: '', updatedAt: ''},
        { id: newId('act'), taskId: findTask('EOTR-03')?.id || '', memberId: samuel.id, description: 'Recorded at the Emerson border crossing.', hours: 8, status: 'Approved' as ActivityStatus, startDate: dateFor(2025, 6, 5), endDate: dateFor(2025, 6, 5), createdAt: '', updatedAt: '' },
        { id: newId('act'), taskId: findTask('EOTR-03')?.id || '', memberId: samuel.id, description: 'Hydrophone recordings near St. Adolphe.', hours: 6, status: 'Pending' as ActivityStatus, startDate: dateFor(2025, 6, 12), endDate: dateFor(2025, 6, 12), createdAt: '', updatedAt: '' },
    ].map(a => ({...a, createdAt: a.startDate, updatedAt: a.startDate }));

    return { projects: [project], members, tasks, activities, directExpenses: [], reports: [] };
};


const SampleData: React.FC = () => {
    const { dispatch, notify } = useAppContext();
    const [isClearModalOpen, setIsClearModalOpen] = useState(false);

    const handleLoadData = () => {
        const data = createSampleData();
        dispatch({ type: 'LOAD_DATA', payload: data });
        notify('Sample data loaded successfully!', 'success');
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
                <i className="fa-solid fa-flask-vial text-6xl text-teal-500"></i>
                <h1 className="mt-4 text-3xl font-bold text-slate-900">Load Project Sample Data</h1>
                <p className="mt-2 text-lg text-slate-600 max-w-2xl mx-auto">This tool will populate the application with a single, well-structured sample project. It's great for getting a quick feel for the application's features.</p>
                
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
                        <i className="fa-solid fa-bolt mr-2"></i>
                        Load Sample Project
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
