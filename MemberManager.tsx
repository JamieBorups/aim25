import React, { useState } from 'react';
import MemberList from './components/MemberList';
import MemberEditor from './components/MemberEditor';
import MemberViewer from './components/MemberViewer';
import { initialMemberData } from './constants';
import { Member, FormData } from './types';

type ViewMode = 'list' | 'edit' | 'view';

interface MemberManagerProps {
  members: Member[];
  setMembers: React.Dispatch<React.SetStateAction<Member[]>>;
  projects: FormData[];
}

const MemberManager: React.FC<MemberManagerProps> = ({ members, setMembers, projects }) => {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [currentMember, setCurrentMember] = useState<Member | null>(null);

  const handleAddMember = () => {
    const newMember: Member = {
      ...initialMemberData,
      id: `mem_${Date.now()}`,
    };
    setCurrentMember(newMember);
    setViewMode('edit');
  };
  
  const handleViewMember = (id: string) => {
    const memberToView = members.find(p => p.id === id);
    if (memberToView) {
      setCurrentMember(memberToView);
      setViewMode('view');
    }
  };

  const handleEditMember = (id: string) => {
    const memberToEdit = members.find(p => p.id === id);
    if (memberToEdit) {
      setCurrentMember(memberToEdit);
      setViewMode('edit');
    }
  };

  const handleDeleteMember = (id: string) => {
    if (window.confirm('Are you sure you want to delete this member? This cannot be undone.')) {
      setMembers(members.filter(p => p.id !== id));
      // Optional: Also remove this member from all projects they are assigned to.
      // This is a more complex operation that would require updating the projects state as well.
      // For now, we just delete the member.
      setViewMode('list');
      setCurrentMember(null);
    }
  };

  const handleSaveMember = (memberToSave: Member) => {
    setMembers(prevMembers => {
      const index = prevMembers.findIndex(p => p.id === memberToSave.id);
      if (index > -1) {
        const updatedMembers = [...prevMembers];
        updatedMembers[index] = memberToSave;
        return updatedMembers;
      } else {
        return [...prevMembers, memberToSave];
      }
    });
    setViewMode('list');
    setCurrentMember(null);
  };

  const handleBackToList = () => {
    setViewMode('list');
    setCurrentMember(null);
  };
  
  const renderContent = () => {
      switch(viewMode) {
          case 'edit':
              return currentMember && <MemberEditor
                key={currentMember.id}
                member={currentMember}
                onSave={handleSaveMember}
                onCancel={handleBackToList}
              />;
          case 'view':
              return currentMember && <MemberViewer member={currentMember} onBack={handleBackToList} projects={projects} />;
          case 'list':
          default:
            return <MemberList
                members={members}
                onAddMember={handleAddMember}
                onEditMember={handleEditMember}
                onDeleteMember={handleDeleteMember}
                onViewMember={handleViewMember}
              />;
      }
  }

  return (
    <div className="font-sans text-slate-800">
      <main className="w-full">
        {renderContent()}
      </main>
    </div>
  );
};

export default MemberManager;
