import React from 'react';
import { Member } from '../types';

interface MemberListProps {
  members: Member[];
  onAddMember: () => void;
  onEditMember: (id: string) => void;
  onDeleteMember: (id: string) => void;
  onViewMember: (id: string) => void;
}

const MemberList: React.FC<MemberListProps> = ({ members, onAddMember, onEditMember, onDeleteMember, onViewMember }) => {
  return (
    <div className="bg-white shadow-lg rounded-lg p-6">
      <div className="flex justify-between items-center mb-6 border-b border-slate-200 pb-4">
        <h1 className="text-2xl font-bold text-slate-900">Collective Members</h1>
        <button
          onClick={onAddMember}
          className="px-4 py-2 text-sm font-medium text-white bg-teal-600 border border-transparent rounded-md shadow-sm hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
        >
          <i className="fa fa-plus mr-2"></i>
          Add New Member
        </button>
      </div>

      {members.length === 0 ? (
        <div className="text-center py-16">
          <i className="fa-solid fa-users text-6xl text-slate-300"></i>
          <h3 className="mt-4 text-lg font-medium text-slate-800">No members have been added.</h3>
          <p className="text-slate-500 mt-1">Click "Add New Member" to build your collective!</p>
        </div>
      ) : (
        <ul className="divide-y divide-slate-200">
          {members.map(member => (
            <li key={member.id} className="py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between">
              <div className="flex items-center mb-3 sm:mb-0">
                  <img className="h-10 w-10 rounded-full object-cover" src={member.imageUrl || `https://ui-avatars.com/api/?name=${member.firstName}+${member.lastName}&background=random`} alt="" />
                  <div className="ml-4">
                     <p className="text-lg font-semibold text-teal-700 hover:underline cursor-pointer" onClick={() => onViewMember(member.id)}>
                        {member.firstName} {member.lastName}
                     </p>
                    <p className="text-sm text-slate-500">
                        {member.email}
                    </p>
                  </div>
              </div>
              <div className="flex items-center space-x-3 flex-shrink-0">
                 <button
                  onClick={() => onViewMember(member.id)}
                  className="px-3 py-1 text-sm text-slate-600 bg-white hover:bg-slate-50 rounded-md border border-slate-300"
                  aria-label={`View ${member.firstName}`}
                >
                  <i className="fa fa-eye mr-1"></i>
                  View
                </button>
                 <button
                  onClick={() => onEditMember(member.id)}
                  className="px-3 py-1 text-sm text-slate-600 bg-white hover:bg-slate-50 rounded-md border border-slate-300"
                  aria-label={`Edit ${member.firstName}`}
                >
                  <i className="fa fa-pencil mr-1"></i>
                  Edit
                </button>
                <button
                  onClick={() => onDeleteMember(member.id)}
                  className="px-3 py-1 text-sm text-red-600 bg-red-50 hover:bg-red-100 rounded-md border border-red-200"
                  aria-label={`Delete ${member.firstName}`}
                >
                  <i className="fa fa-trash-alt mr-1"></i>
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default MemberList;