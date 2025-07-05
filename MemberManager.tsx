
import React, { useState } from 'react';
import MemberList from './components/MemberList';
import MemberEditor from './components/MemberEditor';
import MemberViewer from './components/MemberViewer';
import ConfirmationModal from './components/ui/ConfirmationModal';
import { initialMemberData } from './constants';
import { Member } from './types';
import { useAppContext } from './context/AppContext';

type ViewMode = 'list' | 'edit' | 'view';

const MemberManager: React.FC = () => {
  const { state, dispatch, notify } = useAppContext();
  const { members } = state;
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [currentMember, setCurrentMember] = useState<Member | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<string | null>(null);

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
    setMemberToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteMember = () => {
    if (!memberToDelete) return;

    dispatch({ type: 'DELETE_MEMBER', payload: memberToDelete });
    notify('Member deleted and unassigned from all projects and tasks.', 'success');

    // Reset state
    setViewMode('list');
    setCurrentMember(null);
    setIsDeleteModalOpen(false);
    setMemberToDelete(null);
  };

  const handleSaveMember = (memberToSave: Member) => {
    const isNew = !members.some(m => m.id === memberToSave.id);

    const updatedMembers = isNew
        ? [...members, memberToSave]
        : members.map(m => m.id === memberToSave.id ? memberToSave : m);

    dispatch({ type: 'SET_MEMBERS', payload: updatedMembers });

    notify(isNew ? 'Member added successfully!' : 'Member updated successfully!', 'success');
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
              return currentMember && <MemberViewer member={currentMember} onBack={handleBackToList} />;
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
        {isDeleteModalOpen && (
            <ConfirmationModal
            isOpen={isDeleteModalOpen}
            onClose={() => setIsDeleteModalOpen(false)}
            onConfirm={confirmDeleteMember}
            title="Delete Member"
            message={
                <>
                Are you sure you want to delete this member?
                <br />
                They will be removed from all projects and unassigned from all tasks. 
                <strong className="font-bold text-red-700"> This action cannot be undone.</strong>
                </>
            }
            confirmButtonText="Delete Member"
            />
        )}
      </main>
    </div>
  );
};

export default MemberManager;
