
import React, { useState, useEffect } from 'react';
import { produce } from 'immer';
import { FormData as Project } from '../../types';
import { 
    ARTISTIC_DISCIPLINES,
    CRAFT_GENRES,
    DANCE_GENRES,
    LITERARY_GENRES,
    MEDIA_GENRES,
    MUSIC_GENRES,
    THEATRE_GENRES,
    VISUAL_ARTS_GENRES,
} from '../../constants';
import { CheckboxGroup } from '../ui/CheckboxGroup';

interface DisciplineIntegrationPanelProps {
    project: Project;
    suggestions: Partial<Project>;
    onIntegrate: (data: Partial<Project>) => void;
    isLoading: boolean;
}

const genreMap = [
    { key: 'craft', label: 'Craft Genres', constant: CRAFT_GENRES, stateKey: 'craftGenres' as const },
    { key: 'dance', label: 'Dance Genres', constant: DANCE_GENRES, stateKey: 'danceGenres' as const },
    { key: 'literary', label: 'Literary Arts Genres', constant: LITERARY_GENRES, stateKey: 'literaryGenres' as const },
    { key: 'media', label: 'Media Arts Genres', constant: MEDIA_GENRES, stateKey: 'mediaGenres' as const },
    { key: 'music', label: 'Music Genres', constant: MUSIC_GENRES, stateKey: 'musicGenres' as const },
    { key: 'theatre', label: 'Theatre Genres', constant: THEATRE_GENRES, stateKey: 'theatreGenres' as const },
    { key: 'visual', label: 'Visual Arts Genres', constant: VISUAL_ARTS_GENRES, stateKey: 'visualArtsGenres' as const },
];

const DisciplineIntegrationPanel: React.FC<DisciplineIntegrationPanelProps> = ({ project, suggestions, onIntegrate, isLoading }) => {
    
    const getInitialSelections = () => {
        const initial = {
            artisticDisciplines: [...new Set([...(project.artisticDisciplines || []), ...(suggestions.artisticDisciplines || [])])],
            craftGenres: [...new Set([...(project.craftGenres || []), ...(suggestions.craftGenres || [])])],
            danceGenres: [...new Set([...(project.danceGenres || []), ...(suggestions.danceGenres || [])])],
            literaryGenres: [...new Set([...(project.literaryGenres || []), ...(suggestions.literaryGenres || [])])],
            mediaGenres: [...new Set([...(project.mediaGenres || []), ...(suggestions.mediaGenres || [])])],
            musicGenres: [...new Set([...(project.musicGenres || []), ...(suggestions.musicGenres || [])])],
            theatreGenres: [...new Set([...(project.theatreGenres || []), ...(suggestions.theatreGenres || [])])],
            visualArtsGenres: [...new Set([...(project.visualArtsGenres || []), ...(suggestions.visualArtsGenres || [])])],
        };
        return initial;
    };
    
    const [currentSelections, setCurrentSelections] = useState(getInitialSelections());

    useEffect(() => {
        setCurrentSelections(getInitialSelections());
    }, [project, suggestions]);


    const handleSelectionChange = (key: keyof typeof currentSelections, value: string[]) => {
        setCurrentSelections(prev => ({
            ...prev,
            [key]: value
        }));
    };
    
    const handleIntegrateClick = () => {
        const finalSelections = produce(currentSelections, draft => {
            genreMap.forEach(genre => {
                if(!draft.artisticDisciplines.includes(genre.key)){
                    (draft as any)[genre.stateKey] = [];
                }
            });
        });
        onIntegrate(finalSelections);
    };

    return (
        <div className="mt-4 pt-4 border-t border-blue-200 space-y-4">
            <h4 className="font-bold text-slate-800">Review & Integrate Suggestions:</h4>
            
            <div className="p-3 bg-white border border-slate-200 rounded-lg">
                <h5 className="font-semibold text-slate-700 mb-2">Artistic Disciplines</h5>
                <CheckboxGroup
                    name="artisticDisciplines"
                    options={ARTISTIC_DISCIPLINES}
                    selectedValues={currentSelections.artisticDisciplines}
                    onChange={(value) => handleSelectionChange('artisticDisciplines', value)}
                    columns={3}
                />
            </div>
            
            {genreMap.map(genre => {
                if(currentSelections.artisticDisciplines.includes(genre.key)) {
                    return (
                        <div key={genre.key} className="p-3 bg-white border border-slate-200 rounded-lg">
                            <h5 className="font-semibold text-slate-700 mb-2">{genre.label}</h5>
                            <CheckboxGroup
                                name={genre.stateKey}
                                options={genre.constant}
                                selectedValues={(currentSelections as any)[genre.stateKey]}
                                onChange={(value) => handleSelectionChange(genre.stateKey, value)}
                                columns={4}
                            />
                        </div>
                    )
                }
                return null;
            })}

            <button onClick={handleIntegrateClick} disabled={isLoading} className="w-full mt-2 px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-md shadow-sm hover:bg-teal-700 disabled:bg-slate-400">
                <i className="fa-solid fa-check-circle mr-2"></i>Integrate Selections
            </button>
        </div>
    );
};

export default DisciplineIntegrationPanel;
