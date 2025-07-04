import React, { useState } from 'react';
import { FormData, Collaborator } from '../../types';
import FormField from '../ui/FormField';
import { TextareaWithCounter } from '../ui/TextareaWithCounter';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { useAppContext } from '../../context/AppContext';

interface Props {
  formData: FormData;
  onChange: <K extends keyof FormData>(field: K, value: FormData[K]) => void;
}

const CollaboratorsTab: React.FC<Props> = ({ formData, onChange }) => {
    const { members } = useAppContext();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedMemberId, setSelectedMemberId] = useState('');
    const [role, setRole] = useState('');
    
    const assignedMemberIds = new Set(formData.collaboratorDetails.map(c => c.memberId));
    const availableMembers = members.filter(m => !assignedMemberIds.has(m.id));

    const handleAddCollaborator = () => {
        if (selectedMemberId && role) {
            const newCollaborator: Collaborator = {
                memberId: selectedMemberId,
                role: role
            };
            onChange('collaboratorDetails', [...formData.collaboratorDetails, newCollaborator]);
            setSelectedMemberId('');
            setRole('');
            setIsModalOpen(false);
        }
    }

    const handleRemoveCollaborator = (memberId: string) => {
        onChange('collaboratorDetails', formData.collaboratorDetails.filter(c => c.memberId !== memberId));
    }

    const getMember = (memberId: string) => {
        return members.find(m => m.id === memberId);
    }

  return (
    <div className="space-y-8">
      <FormField label="Who will be working with you on the project? Explain why you chose to work with them and what they bring to the project" htmlFor="whoWillWork">
          <TextareaWithCounter
            id="whoWillWork"
            rows={8}
            value={formData.whoWillWork}
            onChange={e => onChange('whoWillWork', e.target.value)}
            wordLimit={750}
            />
      </FormField>

      <FormField label="If the artists/participants are still to be confirmed, explain how selection will be determined." htmlFor="howSelectionDetermined">
          <TextareaWithCounter
            id="howSelectionDetermined"
            rows={3}
            value={formData.howSelectionDetermined}
            onChange={e => onChange('howSelectionDetermined', e.target.value)}
            wordLimit={100}
            />
      </FormField>

      <div className="bg-slate-100 p-4 rounded-lg border border-slate-200">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Assign Collaborators</h3>
        
        <FormField label="Click the button below to assign a member from your collective to this project." htmlFor="assignMemberBtn">
            <button type="button" onClick={() => setIsModalOpen(true)} className="px-4 py-2 text-sm font-medium text-white bg-teal-600 border border-transparent rounded-md shadow-sm hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500">
                <i className="fa-solid fa-user-plus mr-2"></i>
                Assign Member
            </button>
        </FormField>
        
        {formData.collaboratorDetails.length > 0 && (
          <div className="mt-6">
            <h4 className="font-medium text-slate-700 mb-2">Assigned Collaborators:</h4>
            <ul className="bg-white border border-slate-200 rounded-md divide-y divide-slate-200">
              {formData.collaboratorDetails.map(c => {
                  const member = getMember(c.memberId);
                  return (
                    <li key={c.memberId} className="p-4 hover:bg-slate-50">
                        <div className="flex justify-between items-center">
                          <div>
                            <span className="font-semibold text-slate-800">{member ? `${member.firstName} ${member.lastName}` : 'Unknown Member'}</span>
                            <span className="text-slate-600 text-sm ml-2">- {c.role}</span>
                          </div>
                          <button onClick={() => handleRemoveCollaborator(c.memberId)} className="text-red-600 hover:text-red-800 text-sm font-medium transition-colors">Remove</button>
                        </div>
                        {member && member.shortBio && (
                            <p className="text-sm text-slate-600 mt-2 pl-3 border-l-2 border-slate-300 whitespace-pre-wrap">{member.shortBio}</p>
                        )}
                    </li>
                  )
              })}
            </ul>
          </div>
        )}
      </div>

      {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex justify-center items-center p-4">
              <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
                  <h3 className="text-lg font-bold text-slate-800 mb-4">Assign Member to Project</h3>
                  <div className="space-y-4">
                      <Select
                          value={selectedMemberId}
                          onChange={e => setSelectedMemberId(e.target.value)}
                          options={[
                              { value: '', label: 'Select a member...' },
                              ...availableMembers.map(m => ({ value: m.id, label: `${m.firstName} ${m.lastName}` }))
                          ]}
                       />
                      <Input 
                        placeholder="Role in this Project" 
                        value={role} 
                        onChange={e => setRole(e.target.value)}
                      />
                  </div>
                  <div className="mt-6 flex justify-end space-x-3">
                      <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 border border-slate-300 rounded-md hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500">Cancel</button>
                      <button type="button" onClick={handleAddCollaborator} className="px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500">Assign to Project</button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default CollaboratorsTab;