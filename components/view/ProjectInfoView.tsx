import React from 'react';
import { FormData } from '../../types';
import { 
    ARTISTIC_DISCIPLINES,
    CRAFT_GENRES,
    DANCE_GENRES,
    LITERARY_GENRES,
    MEDIA_GENRES,
    MUSIC_GENRES,
    THEATRE_GENRES,
    VISUAL_ARTS_GENRES,
    ACTIVITY_TYPES
} from '../../constants';

interface ProjectInfoViewProps {
    project: FormData;
    hideTitle?: boolean;
}

const ViewField: React.FC<{ label: string; value?: React.ReactNode; children?: React.ReactNode }> = ({ label, value, children }) => (
    <div className="mb-4">
        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">{label}</h3>
        {value && <div className="mt-1 text-slate-900">{value}</div>}
        {children && <div className="mt-1 text-slate-900">{children}</div>}
    </div>
);

const ProjectInfoView: React.FC<ProjectInfoViewProps> = ({ project, hideTitle = false }) => {

    const genreMap: Record<string, { data: string[], definitions: {value: string, label: string}[]}> = {
        craft: { data: project.craftGenres, definitions: CRAFT_GENRES },
        dance: { data: project.danceGenres, definitions: DANCE_GENRES },
        literary: { data: project.literaryGenres, definitions: LITERARY_GENRES },
        media: { data: project.mediaGenres, definitions: MEDIA_GENRES },
        music: { data: project.musicGenres, definitions: MUSIC_GENRES },
        theatre: { data: project.theatreGenres, definitions: THEATRE_GENRES },
        visual: { data: project.visualArtsGenres, definitions: VISUAL_ARTS_GENRES },
    };

    const renderArtisticDisciplines = () => {
        if (!project.artisticDisciplines || project.artisticDisciplines.length === 0) return 'N/A';

        const disciplineLabels = project.artisticDisciplines.map(disciplineKey => {
            const disciplineLabel = ARTISTIC_DISCIPLINES.find(d => d.value === disciplineKey)?.label || disciplineKey;
            
            const genreInfo = genreMap[disciplineKey];
            if (genreInfo && genreInfo.data && genreInfo.data.length > 0) {
                const genreLabels = genreInfo.data.map(genreKey => 
                    genreInfo.definitions.find(g => g.value === genreKey)?.label || genreKey
                ).join(', ');
                return `${disciplineLabel} (${genreLabels})`;
            }
            
            return disciplineLabel;
        }).join('; ');

        return disciplineLabels;
    };
    
    const activityTypeLabel = ACTIVITY_TYPES.find(t => t.value === project.activityType)?.label || project.activityType;

    return (
        <section>
            {!hideTitle && <h2 className="text-2xl font-bold text-slate-800 border-b-2 border-teal-500 pb-2 mb-6">Project Information</h2>}
            
            <ViewField label="Artistic Disciplines & Genres" value={renderArtisticDisciplines()} />

            <ViewField label="Type of Activity" value={activityTypeLabel} />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
                <ViewField label="Project Start Date" value={project.projectStartDate ? new Date(project.projectStartDate).toLocaleDateString() : 'N/A'} />
                <ViewField label="Project End Date" value={project.projectEndDate ? new Date(project.projectEndDate).toLocaleDateString() : 'N/A'} />
            </div>

            <ViewField label="Background">
                <p className="whitespace-pre-wrap">{project.background || 'N/A'}</p>
            </ViewField>
            
            <ViewField label="Project Description">
                <p className="whitespace-pre-wrap">{project.projectDescription || 'N/A'}</p>
            </ViewField>

            <ViewField label="Audience/Participants">
                <p className="whitespace-pre-wrap">{project.audience || 'N/A'}</p>
            </ViewField>
            
            <ViewField label="Schedule">
                <p className="whitespace-pre-wrap">{project.schedule || 'N/A'}</p>
            </ViewField>

             <ViewField label="Payment & Conditions">
                <p className="whitespace-pre-wrap">{project.paymentAndConditions || 'N/A'}</p>
            </ViewField>
            
            <ViewField label="Cultural Integrity">
                <p className="whitespace-pre-wrap">{project.culturalIntegrity || 'N/A'}</p>
            </ViewField>
            
            {project.additionalInfo && (
                <ViewField label="Additional Information">
                    <p className="whitespace-pre-wrap">{project.additionalInfo}</p>
                </ViewField>
            )}

            {project.permissionConfirmationFiles.length > 0 && (
                 <ViewField label="Permission/Confirmation Files">
                    <ul className="list-disc list-inside">
                        {project.permissionConfirmationFiles.map(file => <li key={file.name}>{file.name}</li>)}
                    </ul>
                </ViewField>
            )}
        </section>
    );
};

export default ProjectInfoView;