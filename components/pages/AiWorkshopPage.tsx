import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { produce } from 'immer';
import { Content } from '@google/genai';
import { useAppContext } from '../../context/AppContext';
import { getAiResponse } from '../../services/aiService';
import { Page, Task, FormData as Project, AiPersonaName, Member, BudgetItem } from '../../types';
import { Input } from '../ui/Input';
import { TextareaWithCounter } from '../ui/TextareaWithCounter';
import { Select } from '../ui/Select';
import { 
    initialTaskData, 
    PROJECT_ASSESSABLE_FIELDS, 
    ARTISTIC_DISCIPLINES,
    CRAFT_GENRES,
    DANCE_GENRES,
    LITERARY_GENRES,
    MEDIA_GENRES,
    MUSIC_GENRES,
    THEATRE_GENRES,
    VISUAL_ARTS_GENRES
} from '../../constants';
import DisciplineIntegrationPanel from '../ai/DisciplineIntegrationPanel';

interface AiWorkshopPageProps {
  onNavigate: (page: Page) => void;
}

interface Message {
  id: string;
  sender: 'user' | 'ai' | 'system';
  text?: string;
  isCreation?: boolean;
}

interface AssessableItem {
  id: string;
  title?: string;
  description: string;
  [key: string]: any;
}

const formatFieldKey = (key?: string): string => {
  if (!key) return 'Section';
  const result = key.replace(/([A-Z])/g, ' $1');
  return result.charAt(0).toUpperCase() + result.slice(1);
};


const AiWorkshopPage: React.FC<AiWorkshopPageProps> = ({ onNavigate }) => {
  const { state, dispatch, notify } = useAppContext();
  const { activeWorkshopItem, projects, tasks, members } = state;

  const [isLoading, setIsLoading] = useState(false);
  const [conversation, setConversation] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState('');
  const [integrationCandidate, setIntegrationCandidate] = useState<any | null>(null);
  const [creationCandidate, setCreationCandidate] = useState<any[] | null>([]);

  const chatEndRef = useRef<HTMLDivElement>(null);

  // --- Data Preparation ---
  const { 
    itemData, 
    assessableItem, 
    itemType, 
    aiPersona, 
    backPage, 
    isNewItem, 
    displayName,
    previousField,
    nextField
  } = useMemo(() => {
    if (!activeWorkshopItem) {
      return { itemData: null, assessableItem: null, itemType: 'Item', aiPersona: 'main' as AiPersonaName, backPage: 'home' as Page, isNewItem: false, displayName: 'Item', previousField: null, nextField: null };
    }

    let previousField = null;
    let nextField = null;

    if (activeWorkshopItem.type === 'project') {
      const currentIndex = PROJECT_ASSESSABLE_FIELDS.findIndex(f => f.key === activeWorkshopItem.fieldKey);
      if (currentIndex !== -1) {
          previousField = currentIndex > 0 ? PROJECT_ASSESSABLE_FIELDS[currentIndex - 1] : null;
          nextField = currentIndex < PROJECT_ASSESSABLE_FIELDS.length - 1 ? PROJECT_ASSESSABLE_FIELDS[currentIndex + 1] : null;
      }
    }
    
    if (activeWorkshopItem.type === 'task') {
      const isNew = activeWorkshopItem.itemId.startsWith('new_');
      let task: Task;
      let project: Project | undefined;

      if (isNew) {
        const projectId = activeWorkshopItem.itemId.substring(4);
        project = projects.find(p => p.id === projectId);
        task = { ...initialTaskData, id: activeWorkshopItem.itemId, projectId, title: "Suggest initial tasks for project" };
      } else {
        task = tasks.find(t => t.id === activeWorkshopItem.itemId)!;
        project = projects.find(p => p.id === task?.projectId);
      }
      return { itemData: { task, project }, assessableItem: task, itemType: 'Task', aiPersona: 'tasks' as AiPersonaName, backPage: 'taskAssessor' as Page, isNewItem: isNew, displayName: 'Task', previousField, nextField };
    }

    if (activeWorkshopItem.type === 'project') {
      const project = projects.find(p => p.id === activeWorkshopItem.itemId)!;
      const fieldKey = activeWorkshopItem.fieldKey;
      const label = activeWorkshopItem.fieldLabel || formatFieldKey(fieldKey);

      let itemDescription = '';
      if(fieldKey !== 'artisticDisciplinesAndGenres'){
        itemDescription = (project as any)[fieldKey] || ''
      }
      
      return {
        itemData: project,
        assessableItem: { id: fieldKey, description: itemDescription },
        itemType: 'Project Field',
        aiPersona: 'projects' as AiPersonaName,
        backPage: 'projectAssessor' as Page,
        isNewItem: false,
        displayName: label,
        previousField,
        nextField
      };
    }

    return { itemData: null, assessableItem: null, itemType: 'Item', aiPersona: 'main' as AiPersonaName, backPage: 'home' as Page, isNewItem: false, displayName: 'Item', previousField, nextField };
  }, [activeWorkshopItem, projects, tasks]);

  const isDisciplineWorkshop = activeWorkshopItem?.type === 'project' && activeWorkshopItem.fieldKey === 'artisticDisciplinesAndGenres';

  // --- State and Effects ---
  const resetState = useCallback(() => {
    setConversation([{ id: `sys_${Date.now()}`, sender: 'system', text: `Welcome to the ${displayName} Workshop! Use an action button or type your own prompt.` }]);
    setIntegrationCandidate(null);
    setCreationCandidate([]);
    setIsLoading(false);
    setUserInput('');
  }, [displayName]);

  useEffect(() => {
    resetState();
  }, [assessableItem?.id, resetState]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation]);

  // --- Handlers ---
  const handleBack = () => {
    dispatch({ type: 'SET_ACTIVE_WORKSHOP_ITEM', payload: null });
    onNavigate(backPage);
  };
  
  const handleAiRequest = async (prompt: string, userMessageText: string, isCreator: boolean) => {
    if (!assessableItem) return;
    setIsLoading(true);
    setIntegrationCandidate(null);
    setCreationCandidate([]);

    const updatedConversation = produce(conversation, draft => {
      draft.push({ id: `user_${Date.now()}`, sender: 'user', text: userMessageText });
    });
    setConversation(updatedConversation);

    const history = updatedConversation.filter(m => m.sender !== 'system' && m.text).map(m => ({
      role: m.sender === 'user' ? 'user' : 'model',
      parts: [{ text: m.text as string }]
    }));

    const result = await getAiResponse({ context: aiPersona, userPrompt: prompt, settings: state.settings.ai, history });

    let jsonResult: any = null;
    let textResult = result;

    try {
      let jsonString = result.trim().match(/```(\w*)?\s*\n?(.*?)\n?\s*```$/s)?.[2] || result;
      const parsed = JSON.parse(jsonString);
      if (isCreator && Array.isArray(parsed)) {
        jsonResult = parsed.map(p => ({ ...p, checked: true }));
        setCreationCandidate(jsonResult);
        textResult = `Here are the new ${itemType.toLowerCase()}s I've suggested:`;
      } else if (!isCreator && typeof parsed === 'object') {
        jsonResult = { ...parsed, checkedFields: Object.keys(parsed).reduce((acc, key) => ({ ...acc, [key]: true }), {}) };
        setIntegrationCandidate(jsonResult);
        textResult = `Here is the improved version of the ${itemType.toLowerCase()}:`;
      }
    } catch (e) { /* Not JSON */ }

    setConversation(produce(updatedConversation, draft => {
      draft.push({ id: `ai_${Date.now()}`, sender: 'ai', text: textResult, isCreation: isCreator && !!jsonResult });
    }));
    setIsLoading(false);
  };

  const handleActionClick = (action: { prompt: string; userMessage: string; isCreator: boolean }) => {
    handleAiRequest(action.prompt, action.userMessage, action.isCreator);
  };
  
  const handleIntegrate = () => {
    if (!integrationCandidate) return;
    const { checkedFields, ...data } = integrationCandidate;
    const dataToUpdate = Object.keys(data).reduce((acc: any, key) => {
        if(checkedFields[key]) acc[key] = data[key];
        return acc;
    }, {});

    if (Object.keys(dataToUpdate).length === 0) return;

    if (activeWorkshopItem?.type === 'task') {
        dispatch({ type: 'UPDATE_TASK_PARTIAL', payload: { taskId: activeWorkshopItem.itemId, data: dataToUpdate } });
    } else if (activeWorkshopItem?.type === 'project') {
        dispatch({ type: 'UPDATE_PROJECT_PARTIAL', payload: { projectId: activeWorkshopItem.itemId, data: { [activeWorkshopItem.fieldKey!]: dataToUpdate.description } } });
    }

    setIntegrationCandidate(null);
    const confirmationText = activeWorkshopItem?.type === 'task'
        ? `The task was updated.\n\nTitle: ${dataToUpdate.title || '(not changed)'}\nDescription: ${dataToUpdate.description || '(not changed)'}`
        : `The "${displayName}" section was updated to:\n\n"${dataToUpdate.description}"`;

    setConversation(prev => produce(prev, draft => {
        draft.push({ id: `sys_${Date.now()}`, sender: 'system', text: confirmationText });
    }));
    notify(`${displayName} updated!`, 'success');
  };

  const handleCreateItems = () => {
    if (!creationCandidate || creationCandidate.length === 0 || activeWorkshopItem?.type !== 'task') return;
    const project = (itemData as {project?: Project}).project;
    if (!project) return;
    
    const itemsToCreate = creationCandidate.filter(item => item.checked);
    if(itemsToCreate.length === 0) return;

    const prefix = (project.projectTitle.match(/\b(\w)/g) || ['T']).join('').toUpperCase().substring(0, 4);
    const existingProjectTasks = tasks.filter(t => t.projectId === project.id && t.taskCode.startsWith(prefix));
    let maxNum = existingProjectTasks.reduce((max, t) => Math.max(max, parseInt(t.taskCode.split('-')[1] || '0', 10)), 0);

    const fullTasks = itemsToCreate.map((item, index) => {
        maxNum++;
        return { ...initialTaskData, ...item, id: `task_${Date.now()}_${index}`, projectId: project.id, taskCode: `${prefix}-${maxNum}`, updatedAt: new Date().toISOString() };
    });

    dispatch({ type: 'ADD_TASKS', payload: fullTasks });
    setCreationCandidate(null);
    
    const confirmationText = `The following ${fullTasks.length} task(s) were created:\n\n${fullTasks.map(t => `• ${t.title}`).join('\n')}`;
    setConversation(prev => produce(prev, draft => {
        draft.push({ id: `sys_${Date.now()}`, sender: 'system', text: confirmationText });
    }));

    notify(`${fullTasks.length} new tasks created!`, 'success');
  }
  
  const handleDisciplineIntegrate = (data: Partial<Project>) => {
    if (!activeWorkshopItem || activeWorkshopItem.type !== 'project') return;
    dispatch({
        type: 'UPDATE_PROJECT_PARTIAL',
        payload: { projectId: activeWorkshopItem.itemId, data }
    });
    setIntegrationCandidate(null);

    const allGenreConstants = [
        ...CRAFT_GENRES, ...DANCE_GENRES, ...LITERARY_GENRES, ...MEDIA_GENRES,
        ...MUSIC_GENRES, ...THEATRE_GENRES, ...VISUAL_ARTS_GENRES
    ];
    const genreLabelMap = new Map(allGenreConstants.map(g => [g.value, g.label]));
    
    let confirmationLines: string[] = ['The "Artistic Disciplines & Genres" section was updated.'];
    const selectedDisciplines = (data.artisticDisciplines || []).map(d => {
        const disciplineLabel = ARTISTIC_DISCIPLINES.find(ad => ad.value === d)?.label || d;
        let genreText = '';
        
        const genreKey = `${d}Genres` as keyof Project;
        const selectedGenres = (data as any)[genreKey];
        if (selectedGenres && Array.isArray(selectedGenres) && selectedGenres.length > 0) {
            genreText = ` (${selectedGenres.map((g: string) => genreLabelMap.get(g) || g).join(', ')})`;
        }
        
        return `• ${disciplineLabel}${genreText}`;
    });

    if (selectedDisciplines.length > 0) {
        confirmationLines.push('\n\nNew Selections:\n' + selectedDisciplines.join('\n'));
    } else {
        confirmationLines.push('\n\nAll disciplines were deselected.');
    }
    const confirmationText = confirmationLines.join('');

    setConversation(prev => produce(prev, draft => {
        draft.push({ id: `sys_${Date.now()}`, sender: 'system', text: confirmationText });
    }));

    notify(`Artistic Disciplines & Genres updated!`, 'success');
  };
  
  const handleNavigateSection = (field: { key: keyof Project | 'artisticDisciplinesAndGenres', label: string } | null) => {
      if (!field || !activeWorkshopItem || activeWorkshopItem.type !== 'project') return;
      dispatch({
          type: 'SET_ACTIVE_WORKSHOP_ITEM',
          payload: {
              type: 'project',
              itemId: activeWorkshopItem.itemId,
              fieldKey: field.key,
              fieldLabel: field.label
          }
      });
  };


  // --- Dynamic Content Generation ---
  const { renderItemPanel, generateContextPrompt, actionButtons } = useMemo(() => {
    if (activeWorkshopItem?.type === 'task') {
      const { task, project } = itemData as { task: Task, project?: Project };
      return {
        renderItemPanel: () => (
          <div className="space-y-4">
            <h3 className="font-bold text-lg text-slate-700">Current Task</h3>
            <p className="text-sm"><strong className="font-semibold">Project:</strong> {project?.projectTitle}</p>
            <p className="text-sm"><strong className="font-semibold">Code:</strong> {task.taskCode}</p>
            <p className="text-sm"><strong className="font-semibold">Title:</strong> {task.title}</p>
            <p className="text-sm"><strong className="font-semibold">Description:</strong> {task.description}</p>
          </div>
        ),
        generateContextPrompt: (basePrompt: string) => {
            const context = {
                project: project ? { title: project.projectTitle, description: project.projectDescription, schedule: project.schedule } : null,
                parentTask: isNewItem ? null : { title: task.title, description: task.description },
                fullWorkplan: project ? tasks.filter(t => t.projectId === project.id).map(t => ({ taskCode: t.taskCode, title: t.title, status: t.status })) : [],
                availableMembers: members.map(m => ({ id: m.id, name: `${m.firstName} ${m.lastName}`})),
                budgetLineItems: project ? Object.values(project.budget.expenses).flat().map(i => ({id: i.id, description: i.description})) : [],
            };
            return `${basePrompt}\n\n### CONTEXT ###\n${JSON.stringify(context, null, 2)}`;
        },
        actionButtons: isNewItem ? [
             { label: "Suggest Initial Tasks", prompt: `You are a project manager. Based on the provided project context, generate a comprehensive list of initial tasks. Your response MUST be ONLY a single, valid JSON array of objects. Each object in the array must strictly follow this TypeScript interface: { "title": string; "description": string; "assignedMemberId"?: string; "dueDate"?: string; "estimatedHours"?: number; "budgetItemId"?: string; }. Use the context to make intelligent suggestions.`, userMessage: "Suggest initial tasks for this project.", isCreator: true }
        ] : [
            { label: "Improve this task", prompt: `Improve the provided task. Your response MUST be ONLY a single, valid JSON object following this interface: { "title": string; "description": string; }.`, userMessage: "Improve this task for me.", isCreator: false },
            { label: "Break Down Task", prompt: `Break down the provided parent task into smaller, actionable sub-tasks. Your response MUST be ONLY a single, valid JSON array of objects. Each object must strictly follow this TypeScript interface: { "title": string; "description": string; "assignedMemberId"?: string; "dueDate"?: string; "estimatedHours"?: number; "budgetItemId"?: string; }.`, userMessage: "Break this task into smaller sub-tasks.", isCreator: true }
        ]
      }
    }
    if (activeWorkshopItem?.type === 'project') {
        const project = itemData as Project;
        const field = assessableItem as AssessableItem;
        const currentProjectDisciplines = {
            artisticDisciplines: project.artisticDisciplines,
            craftGenres: project.craftGenres,
            danceGenres: project.danceGenres,
            literaryGenres: project.literaryGenres,
            mediaGenres: project.mediaGenres,
            musicGenres: project.musicGenres,
            theatreGenres: project.theatreGenres,
            visualArtsGenres: project.visualArtsGenres,
        };

        return {
            renderItemPanel: () => (
                <div className="space-y-4">
                    <h3 className="font-bold text-lg text-slate-700">Current Section: {displayName}</h3>
                    <p className="text-sm"><strong className="font-semibold">Project:</strong> {project.projectTitle}</p>
                    <p className="text-sm"><strong className="font-semibold">Content:</strong> {field.description || 'This section has no content yet.'}</p>
                </div>
            ),
            generateContextPrompt: (basePrompt: string) => {
                const context = {
                    project: { title: project.projectTitle, description: project.projectDescription, currentDisciplines: currentProjectDisciplines },
                    fieldToAnalyze: { name: displayName, content: field.description }
                };
                return `${basePrompt}\n\n### CONTEXT ###\n${JSON.stringify(context, null, 2)}`;
            },
            actionButtons: isDisciplineWorkshop ? [
                { label: `Suggest Disciplines`, prompt: `Based on the project's title and description, suggest relevant artistic disciplines and genres. Your response MUST be ONLY a single, valid JSON object following this TypeScript interface: { "artisticDisciplines"?: string[]; "craftGenres"?: string[]; "danceGenres"?: string[]; "literaryGenres"?: string[]; "mediaGenres"?: string[]; "musicGenres"?: string[]; "theatreGenres"?: string[]; "visualArtsGenres"?: string[]; }. Be selective. Only include keys for disciplines that are strongly relevant.`, userMessage: `Suggest disciplines & genres for this project.`, isCreator: false },
            ] : [
                { label: `Improve this section`, prompt: `You are an expert grant writer. Rewrite the content for the field "${displayName}". Your response MUST be ONLY a single, valid JSON object following this interface: { "description": string; }.`, userMessage: `Improve the "${displayName}" section.`, isCreator: false },
            ]
        }
    }
    return { renderItemPanel: () => null, generateContextPrompt: (p: string) => p, actionButtons: [] };
  }, [itemData, assessableItem, activeWorkshopItem, isNewItem, tasks, members, displayName, isDisciplineWorkshop]);
  
  if (!activeWorkshopItem || !assessableItem) {
    return (
        <div className="p-8 text-center">
            <h2 className="text-xl font-semibold text-slate-700">No item selected for workshop.</h2>
            <button onClick={handleBack} className="mt-4 px-4 py-2 bg-teal-600 text-white rounded-md">Go Back</button>
        </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
        <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-bold text-slate-900">AI Workshop</h1>
            <div className="flex items-center gap-3">
                {activeWorkshopItem?.type === 'project' && (
                    <div className="flex items-center gap-2">
                        <button onClick={() => handleNavigateSection(previousField)} disabled={!previousField || isLoading} className="px-3 py-1.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed">
                            <i className="fa-solid fa-arrow-left mr-2"></i> Previous
                        </button>
                        <button onClick={() => handleNavigateSection(nextField)} disabled={!nextField || isLoading} className="px-3 py-1.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed">
                            Next <i className="fa-solid fa-arrow-right ml-2"></i>
                        </button>
                    </div>
                )}
                <button onClick={handleBack} className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-100"><i className="fa-solid fa-arrow-left mr-2"></i>Back to List</button>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 bg-slate-50 p-4 rounded-lg border border-slate-200 self-start">{renderItemPanel()}</div>

            <div className="lg:col-span-2 bg-blue-50 p-4 rounded-lg border border-blue-200 flex flex-col">
                <h3 className="font-bold text-lg text-blue-800 mb-4 flex-shrink-0">AI Coach</h3>
                <div ref={chatEndRef} className="flex-grow bg-white rounded-md p-3 text-sm text-slate-700 space-y-4 overflow-y-auto min-h-96 max-h-[65vh]">
                    {conversation.map(msg => (
                        <div key={msg.id}>
                            {msg.sender === 'system' && (
                                <p className="text-xs text-center italic text-slate-500 p-2 bg-slate-100 rounded-md">
                                    <pre className="whitespace-pre-wrap font-sans">{msg.text}</pre>
                                </p>
                            )}
                            {msg.sender === 'user' && <p className="text-right"><span className="bg-slate-200 rounded-lg px-3 py-2 inline-block max-w-xl">{msg.text}</span></p>}
                            {msg.sender === 'ai' && (
                                <div className="bg-blue-100 border border-blue-200 rounded-lg p-3">
                                    <pre className="whitespace-pre-wrap font-sans">{msg.text}</pre>
                                    {isDisciplineWorkshop && integrationCandidate && (
                                        <DisciplineIntegrationPanel 
                                            project={itemData as Project}
                                            suggestions={integrationCandidate}
                                            onIntegrate={handleDisciplineIntegrate}
                                            isLoading={isLoading}
                                        />
                                    )}
                                    {!isDisciplineWorkshop && integrationCandidate && msg.id === conversation.find(m => m.sender === 'ai' && m.text?.includes('improved'))?.id && (
                                        <IntegrationPanel candidate={integrationCandidate} setCandidate={setIntegrationCandidate} onIntegrate={handleIntegrate} isLoading={isLoading} />
                                    )}
                                    {creationCandidate && msg.isCreation && (
                                        <CreationPanel items={creationCandidate} setItems={setCreationCandidate} onCreate={handleCreateItems} isLoading={isLoading} members={members} project={itemData as Project} />
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                    {isLoading && <div className="flex items-center gap-2 text-slate-500 p-2"><i className="fa-solid fa-spinner fa-spin"></i><span>AI is thinking...</span></div>}
                </div>
                <div className="mt-4 pt-4 border-t border-blue-200 flex flex-col gap-2">
                     <div className="flex items-center gap-2 flex-wrap">
                        {actionButtons.map(action => (
                            <button key={action.label} onClick={() => handleActionClick({ ...action, prompt: generateContextPrompt(action.prompt)})} disabled={isLoading} className="px-3 py-1.5 text-xs font-semibold text-white bg-purple-600 rounded-md shadow-sm hover:bg-purple-700 disabled:bg-slate-400">
                                <i className="fa-solid fa-wand-magic-sparkles mr-2"></i>{action.label}
                            </button>
                        ))}
                    </div>
                    <form onSubmit={(e) => { e.preventDefault(); handleAiRequest(generateContextPrompt(userInput), userInput, false); setUserInput(''); }} className="flex gap-2">
                        <Input type="text" value={userInput} onChange={e => setUserInput(e.target.value)} placeholder="Type a follow-up message..." className="flex-grow" disabled={isLoading} />
                        <button type="submit" disabled={isLoading || !userInput.trim()} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md shadow-sm hover:bg-blue-700 disabled:bg-slate-400">Send</button>
                    </form>
                </div>
            </div>
        </div>
    </div>
  );
};

const IntegrationPanel = ({ candidate, setCandidate, onIntegrate, isLoading }: any) => {
    const { checkedFields, ...data } = candidate;
    const handleCheckboxChange = (key: string) => {
        setCandidate(produce((draft: any) => {
            draft.checkedFields[key] = !draft.checkedFields[key];
        }));
    };
    return (
        <div className="mt-4 pt-4 border-t border-blue-200 space-y-3">
            <h4 className="font-bold text-slate-800">Review & Integrate Suggestion:</h4>
            {Object.keys(data).map(key => (
                <div key={key} className="flex items-start gap-2">
                    <input type="checkbox" id={`integrate-${key}`} checked={checkedFields[key]} onChange={() => handleCheckboxChange(key)} className="mt-1"/>
                    <div className="flex-grow">
                        <label htmlFor={`integrate-${key}`} className="text-xs font-semibold text-slate-600 capitalize">{key}</label>
                        {key === 'description' ? (
                            <TextareaWithCounter value={data[key] || ''} onChange={e => setCandidate(produce((d:any) => {d[key] = e.target.value}))} className="text-sm p-1" rows={4} wordLimit={200} />
                        ) : (
                            <Input value={data[key] || ''} onChange={e => setCandidate(produce((d:any) => {d[key] = e.target.value}))} className="text-sm p-1" />
                        )}
                    </div>
                </div>
            ))}
            <button onClick={onIntegrate} disabled={isLoading} className="w-full mt-2 px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-md shadow-sm hover:bg-teal-700 disabled:bg-slate-400">
                <i className="fa-solid fa-check-circle mr-2"></i>Integrate Selected
            </button>
        </div>
    );
};

const CreationPanel = ({ items, setItems, onCreate, isLoading, members, project }: {items: any[], setItems: React.Dispatch<React.SetStateAction<any[] | null>>, onCreate: () => void, isLoading: boolean, members: Member[], project: Project}) => {
    const handleItemChange = (index: number, field: keyof Task, value: any) => {
        setItems(produce((draft: any[] | null) => {
            if (draft) {
                (draft[index] as any)[field] = value;
            }
        }));
    };
    const handleToggleCheck = (index: number) => {
        setItems(produce((draft: any[] | null) => {
            if (draft) {
                draft[index].checked = !draft[index].checked;
            }
        }));
    };

    const memberOptions = [{ value: '', label: 'Unassigned' }, ...members.map(m => ({ value: m.id, label: `${m.firstName} ${m.lastName}` }))];
    const budgetItemOptions = [{ value: '', label: 'None' }, ...Object.values(project.budget.expenses).flat().map(i => ({ value: i.id, label: i.description || i.source }))];

    return (
        <div className="mt-4 pt-4 border-t border-blue-200 space-y-3">
            <h4 className="font-bold text-slate-800">Review & Create New Tasks:</h4>
            {items.map((item, index) => (
                <div key={index} className="flex items-start gap-2 bg-slate-50 border border-slate-200 rounded-md p-3">
                    <input type="checkbox" id={`create-${index}`} checked={item.checked} onChange={() => handleToggleCheck(index)} className="mt-1"/>
                    <div className="flex-grow space-y-2">
                        <Input value={item.title} onChange={e => handleItemChange(index, 'title', e.target.value)} placeholder="Task Title"/>
                        <TextareaWithCounter value={item.description} onChange={e => handleItemChange(index, 'description', e.target.value)} placeholder="Description" rows={2} wordLimit={100} />
                         <div className="grid grid-cols-2 gap-2">
                            <Select options={memberOptions} value={item.assignedMemberId || ''} onChange={e => handleItemChange(index, 'assignedMemberId', e.target.value)} />
                            <Input type="number" value={item.estimatedHours || ''} onChange={e => handleItemChange(index, 'estimatedHours', parseFloat(e.target.value) || 0)} placeholder="Est. Hours" />
                         </div>
                         <Select options={budgetItemOptions} value={item.budgetItemId || ''} onChange={e => handleItemChange(index, 'budgetItemId', e.target.value)} />
                    </div>
                </div>
            ))}
             <button onClick={onCreate} disabled={isLoading} className="w-full mt-2 px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-md shadow-sm hover:bg-teal-700 disabled:bg-slate-400">
                <i className="fa-solid fa-check-circle mr-2"></i>Create Selected Tasks
            </button>
        </div>
    );
};

export default AiWorkshopPage;