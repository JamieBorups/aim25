
import { FormData, Tab, DetailedBudget, Member, Task, TaskStatus, WorkType, Activity, Report, TaskType, ProjectStatus, BudgetItemStatus, TaskSortOption, TaskStatusFilter, ActivitySortOption, ActivityStatusFilter, DateRangeFilter } from './types';

export const TABS: Tab[] = [
  { id: 'projectInfo', label: 'Project Information' },
  { id: 'collaborators', label: 'Collaborators' },
  { id: 'budget', label: 'Budget' },
];

export const initialBudget: DetailedBudget = {
    revenues: {
        grants: [],
        tickets: { numVenues: 0, percentCapacity: 0, venueCapacity: 0, avgTicketPrice: 0, description: '' },
        sales: [],
        fundraising: [],
        contributions: [],
    },
    expenses: {
        professionalFees: [],
        travel: [],
        production: [],
        administration: [],
        research: [],
        professionalDevelopment: [],
    }
};

export const initialFormData: FormData = {
  id: '',
  projectTitle: '',
  status: 'Pending',
  artisticDisciplines: [],
  craftGenres: [],
  danceGenres: [],
  literaryGenres: [],
  mediaGenres: [],
  musicGenres: [],
  theatreGenres: [],
  visualArtsGenres: [],
  otherArtisticDisciplineSpecify: '',
  projectStartDate: '',
  projectEndDate: '',
  activityType: 'Select',
  background: '',
  projectDescription: '',
  audience: '',
  paymentAndConditions: '',
  permissionConfirmationFiles: [],
  schedule: '',
  culturalIntegrity: '',
  additionalInfo: '',
  whoWillWork: '',
  howSelectionDetermined: '',
  collaboratorDetails: [],
  budget: initialBudget,
};

export const initialMemberData: Member = {
    id: '',
    memberId: '',
    firstName: '',
    lastName: '',
    email: '',
    province: 'Select',
    city: '',
    postalCode: '',
    imageUrl: '',
    shortBio: '',
    artistBio: '',
    availability: 'Select',
};

export const initialTaskData: Task = {
    id: '',
    taskCode: '',
    projectId: '',
    title: '',
    description: '',
    assignedMemberId: '',
    status: 'To Do',
    startDate: '',
    dueDate: '',
    taskType: 'Time-Based',
    isComplete: false,
    estimatedHours: 0,
    actualHours: 0,
    budgetItemId: '',
    workType: 'Paid',
    hourlyRate: 0,
    updatedAt: '',
};

export const initialActivityData: Activity = {
    id: '',
    taskId: '',
    memberId: '',
    description: '',
    startDate: '',
    endDate: '',
    startTime: '',
    endTime: '',
    hours: 0,
    status: 'Pending',
    createdAt: '',
    updatedAt: '',
};

export const initialReportData: Report = {
    id: '',
    projectId: '',
    projectResults: '',
    grantSpendingDescription: '',
    workplanAdjustments: 'No adjustments were made.',
    involvedPeople: [],
    involvedActivities: [],
    impactStatements: {},
    highlights: [],
    feedback: '',
    additionalFeedback: ''
};


export const TASK_STATUSES: { value: TaskStatus, label: string }[] = [
    { value: 'Backlog', label: 'Backlog' },
    { value: 'To Do', label: 'To Do' },
    { value: 'In Progress', label: 'In Progress' },
    { value: 'Done', label: 'Done' },
];

export const TASK_SORT_OPTIONS: { value: TaskSortOption, label: string }[] = [
    { value: 'updatedAt', label: 'Last Updated' },
    { value: 'dueDate', label: 'Due Date' },
    { value: 'assignee', label: 'Assignee' },
];

export const TASK_STATUS_FILTER_OPTIONS: { value: TaskStatusFilter, label: string }[] = [
    { value: 'all', label: 'All Tasks' },
    { value: 'overdue', label: 'Overdue' },
    { value: 'dueThisWeek', label: 'Due This Week' },
    { value: 'todo', label: 'To Do' },
    { value: 'inProgress', label: 'In Progress' },
    { value: 'done', label: 'Done' },
];

export const ACTIVITY_SORT_OPTIONS: { value: ActivitySortOption, label: string }[] = [
    { value: 'date-desc', label: 'Activity Date (Newest)' },
    { value: 'date-asc', label: 'Activity Date (Oldest)' },
    { value: 'updatedAt', label: 'Last Updated' },
];

export const ACTIVITY_STATUS_FILTER_OPTIONS: { value: ActivityStatusFilter, label: string }[] = [
    { value: 'all', label: 'All Statuses' },
    { value: 'pending', label: 'Pending' },
    { value: 'approved', label: 'Approved' },
];

export const WORK_TYPES: { value: WorkType, label: string }[] = [
    { value: 'Paid', label: 'Paid' },
    { value: 'In-Kind', label: 'In-Kind' },
    { value: 'Volunteer', label: 'Volunteer' },
];

export const TASK_TYPES: { value: TaskType, label: string }[] = [
    { value: 'Time-Based', label: 'Time-Based (Logs hours)' },
    { value: 'Milestone', label: 'Milestone (Checklist item)' },
];


export const PROVINCES = [
    { value: 'Select', label: 'Select a Province/Territory' },
    { value: 'AB', label: 'Alberta' },
    { value: 'BC', label: 'British Columbia' },
    { value: 'MB', label: 'Manitoba' },
    { value: 'NB', label: 'New Brunswick' },
    { value: 'NL', label: 'Newfoundland and Labrador' },
    { value: 'NS', label: 'Nova Scotia' },
    { value: 'ON', label: 'Ontario' },
    { value: 'PE', label: 'Prince Edward Island' },
    { value: 'QC', label: 'Quebec' },
    { value: 'SK', label: 'Saskatchewan' },
    { value: 'NT', label: 'Northwest Territories' },
    { value: 'NU', label: 'Nunavut' },
    { value: 'YT', label: 'Yukon' },
];

export const AVAILABILITY_OPTIONS = [
    { value: 'Select', label: 'Select Availability' },
    { value: 'full-time', label: 'Full Time' },
    { value: 'part-time', label: 'Part Time' },
    { value: 'volunteer', label: 'Volunteer' },
    { value: 'contract', label: 'Contract' },
    { value: 'not-available', label: 'Not Available' },
];


export const REVENUE_FIELDS = {
    grants: [
        { key: 'mac', label: 'Provincial: Manitoba Arts Council (MAC) *This application' },
        { key: 'federalCanada', label: 'Federal: Canada Council for the Arts' },
        { key: 'federalOther', label: 'Federal: Other' },
        { key: 'provincialOther', label: 'Provincial: Other' },
        { key: 'municipalWinnipeg', label: 'Municipal: Winnipeg Arts Council' },
        { key: 'municipalOther', label: 'Municipal: Other' },
    ],
    sales: [
        { key: 'merchandise', label: 'Sales: Merchandise Sales' },
        { key: 'other', label: 'Sales: Other Sales' },
    ],
    fundraising: [
        { key: 'sponsorship', label: 'Sponsorship' },
        { key: 'donations', label: 'Donations' },
        { key: 'events', label: 'Fundraising Events' },
        { key: 'crowdsourcing', label: 'Crowdsourcing' },
        { key: 'other', label: 'Other' },
    ],
    contributions: [
        { key: 'financialApplicant', label: 'Financial - Applicant' },
        { key: 'financialPartners', label: 'Financial - Partners' },
        { key: 'financialOther', label: 'Financial - Other' },
        { key: 'inKindApplicant', label: 'In-Kind - Applicant' },
        { key: 'inKindPartners', label: 'In-Kind - Partners' },
        { key: 'inKindOther', label: 'In-Kind - Other' },
    ],
};

export const EXPENSE_FIELDS = {
    professionalFees: [
        { key: 'artists', label: 'Artists\' fees' },
        { key: 'designers', label: 'Designers\' fees' },
        { key: 'royalties', label: 'Royalties/Copyright' },
        { key: 'indigenous', label: 'Indigenous Knowledge Keeper fees' },
        { key: 'consultant', label: 'Professional/Consultant fees' },
        { key: 'living', label: 'Living Expenses/Subsistence' },
        { key: 'other', label: 'Other' },
    ],
    travel: [
        { key: 'transportation', label: 'Transportation' },
        { key: 'accommodations', label: 'Accommodations' },
        { key: 'perDiem', label: 'Per diem' },
        { key: 'other', label: 'Other' },
    ],
    production: [
        { key: 'materials', label: 'Materials and supplies' },
        { key: 'technical', label: 'Technical personnel' },
        { key: 'equipment', label: 'Equipment purchase' },
        { key: 'rentals', label: 'Rentals' },
        { key: 'other', label: 'Other' },
    ],
    administration: [
        { key: 'personnel', label: 'Administrative Personnel' },
        { key: 'shipping', label: 'Shipping' },
        { key: 'printing', label: 'Printing and photocopying' },
        { key: 'promotion', label: 'Promotion and marketing' },
        { key: 'translation', label: 'Translation' },
        { key: 'workshops', label: 'Workshops' },
        { key: 'other', label: 'Other' },
    ],
    research: [{ key: 'research', label: 'Research' }],
    professionalDevelopment: [{ key: 'professionalDevelopment', label: 'Professional Development' }],
};


export const ARTISTIC_DISCIPLINES = [
  { value: 'craft', label: 'Craft' },
  { value: 'dance', label: 'Dance' },
  { value: 'multi-disciplinary', label: 'Multi disciplinary/Inter-arts' },
  { value: 'literary', label: 'Literary arts' },
  { value: 'media', label: 'Media arts' },
  { value: 'music', label: 'Music' },
  { value: 'theatre', label: 'Theatre' },
  { value: 'visual', label: 'Visual arts' },
  { value: 'other', label: 'Other' },
];

export const CRAFT_GENRES = [
    { value: 'beading', label: 'Beading' },
    { value: 'birchbark', label: 'Birchbark' },
    { value: 'ceramics', label: 'Ceramics' },
    { value: 'clay', label: 'Clay' },
    { value: 'fibre', label: 'Fibre' },
    { value: 'furniture', label: 'Furniture' },
    { value: 'glass', label: 'Glass' },
    { value: 'instrument-making', label: 'Instrument-making' },
    { value: 'jewellery', label: 'Jewellery' },
    { value: 'leather', label: 'Leather' },
    { value: 'metal', label: 'Metal' },
    { value: 'mixed-media', label: 'Mixed media' },
    { value: 'paper', label: 'Paper' },
    { value: 'quillwork', label: 'Quillwork' },
    { value: 'stone', label: 'Stone' },
    { value: 'textile', label: 'Textile' },
    { value: 'wood', label: 'Wood' },
];

export const DANCE_GENRES = [
    { value: 'aerial', label: 'Aerial dance' },
    { value: 'african', label: 'African' },
    { value: 'classical-ballet', label: 'Classical ballet' },
    { value: 'classical-indian', label: 'Classical Indian' },
    { value: 'contemporary', label: 'Contemporary' },
    { value: 'ethno-cultural-folk', label: 'Other Ethno-cultural folk' },
    { value: 'flamenco', label: 'Flamenco' },
    { value: 'hip-hop', label: 'Hip hop' },
    { value: 'indigenous', label: 'Indigenous' },
    { value: 'jazz', label: 'Jazz' },
    { value: 'modern-ballet', label: 'Modern ballet' },
    { value: 'site-specific', label: 'Site-specific dance' },
    { value: 'tap', label: 'Tap' },
];

export const LITERARY_GENRES = [
    { value: 'biography', label: 'Biography' },
    { value: 'childrens-lit', label: "Children's literature" },
    { value: 'essays-on-art', label: 'Essays on art' },
    { value: 'fiction', label: 'Fiction' },
    { value: 'graphic-novel', label: 'Graphic novel' },
    { value: 'memoir', label: 'Memoir' },
    { value: 'creative-non-fiction', label: 'Creative non-fiction' },
    { value: 'novel', label: 'Novel' },
    { value: 'novella', label: 'Novella' },
    { value: 'poetry', label: 'Poetry' },
    { value: 'short-story', label: 'Short story' },
    { value: 'spoken-word', label: 'Spoken word' },
    { value: 'storytelling', label: 'Storytelling' },
    { value: 'young-adult-fiction', label: 'Young adult fiction' },
];

export const MEDIA_GENRES = [
    { value: 'animation', label: 'Animation' },
    { value: 'audio-art', label: 'Audio art' },
    { value: 'documentary', label: 'Documentary' },
    { value: 'electronic', label: 'Electronic' },
    { value: 'experimental', label: 'Experimental' },
    { value: 'installation', label: 'Installation' },
    { value: 'narrative', label: 'Narrative' },
    { value: 'video-art', label: 'Video art' },
    { value: 'virtual-reality', label: 'Virtual reality' },
];

export const MUSIC_GENRES = [
    { value: 'brass', label: 'Brass' },
    { value: 'choral', label: 'Choral' },
    { value: 'classical', label: 'Classical' },
    { value: 'contemporary', label: 'Contemporary' },
    { value: 'contemporary-folk', label: 'Contemporary folk' },
    { value: 'country', label: 'Country' },
    { value: 'electro-acoustic', label: 'Electro-acoustic' },
    { value: 'ethno-cultural-folk', label: 'Ethno-cultural folk music' },
    { value: 'guitar', label: 'Guitar' },
    { value: 'hip-hop', label: 'Hip hop (incl. DJ, rap)' },
    { value: 'instrumental', label: 'Instrumental' },
    { value: 'jazz', label: 'Jazz' },
    { value: 'kids-concerts', label: 'Kids concerts' },
    { value: 'new-music', label: 'New music' },
    { value: 'opera', label: 'Opera' },
    { value: 'percussion', label: 'Percussion' },
    { value: 'piano', label: 'Piano' },
    { value: 'strings', label: 'Strings (incl. fiddle)' },
    { value: 'vocal', label: 'Vocal' },
    { value: 'woodwind', label: 'Woodwind' },
    { value: 'world-music', label: 'World music' },
];

export const THEATRE_GENRES = [
    { value: 'circus-arts', label: 'Circus arts' },
    { value: 'classical-repertoire', label: 'Classical repertoire' },
    { value: 'clown', label: 'Clown' },
    { value: 'comedy', label: 'Comedy' },
    { value: 'devised-theatre', label: 'Devised theatre' },
    { value: 'drama', label: 'Drama' },
    { value: 'improvisation', label: 'Improvisation' },
    { value: 'musical-theatre', label: 'Musical theatre' },
    { value: 'object-puppet-theatre', label: 'Object puppet theatre' },
    { value: 'physical-theatre', label: 'Physical theatre' },
    { value: 'promenade-theatre', label: 'Promenade theatre' },
    { value: 'puppetry', label: 'Puppetry' },
    { value: 'site-specific-theatre', label: 'Site-specific Theatre' },
    { value: 'theatre-for-young-audiences', label: 'Theatre for young audiences' },
    { value: 'playwriting', label: 'Playwriting' },
];

export const VISUAL_ARTS_GENRES = [
    { value: 'drawing', label: 'Drawing' },
    { value: 'installation', label: 'Installation' },
    { value: 'mixed-media', label: 'Mixed media' },
    { value: 'painting', label: 'Painting' },
    { value: 'performance-art', label: 'Performance art' },
    { value: 'photography', label: 'Photography' },
    { value: 'printmaking', label: 'Printmaking' },
    { value: 'sculpture', label: 'Sculpture' },
];


export const ACTIVITY_TYPES = [
    { value: 'Select', label: 'Select' },
    { value: 'public-presentation', label: 'Public presentation' },
    { value: 'publication', label: 'Publication' },
];

export const PROJECT_STATUS_OPTIONS: { value: ProjectStatus, label: string }[] = [
    { value: 'Pending', label: 'Pending' },
    { value: 'Active', label: 'Active' },
    { value: 'On Hold', label: 'On Hold' },
    { value: 'Completed', label: 'Completed' },
    { value: 'Terminated', label: 'Terminated' },
];

export const DATE_RANGE_FILTER_OPTIONS: { value: DateRangeFilter, label: string }[] = [
    { value: 'all', label: 'All Time' },
    { value: 'last7days', label: 'Last 7 Days' },
    { value: 'last30days', label: 'Last 30 Days' },
    { value: 'thisMonth', label: 'This Month' },
];

export const BUDGET_ITEM_STATUS_OPTIONS: { value: BudgetItemStatus, label: string }[] = [
    { value: 'Pending', label: 'Pending' },
    { value: 'Approved', label: 'Approved' },
    { value: 'Denied', label: 'Denied' },
];
