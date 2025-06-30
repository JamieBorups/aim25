
import React, { useState, useCallback } from 'react';
import { Member } from '../types';
import FormField from './ui/FormField';
import { Input } from './ui/Input';
import { Select } from './ui/Select';
import { TextareaWithCounter } from './ui/TextareaWithCounter';
import { PROVINCES, AVAILABILITY_OPTIONS } from '../constants';

interface MemberEditorProps {
  member: Member;
  onSave: (member: Member) => void;
  onCancel: () => void;
}

const MemberEditor: React.FC<MemberEditorProps> = ({ member, onSave, onCancel }) => {
  const [formData, setFormData] = useState<Member>(member);

  const handleFormChange = useCallback(<K extends keyof Member>(field: K, value: Member[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };
  
  return (
    <form onSubmit={handleSave} className="bg-white shadow-lg rounded-xl p-6 sm:p-8">
        <div className="flex justify-between items-start mb-6 border-b pb-4">
          <h1 className="text-3xl font-bold text-slate-900">{member.id ? "Edit Member" : "Add New Member"}</h1>
        </div>

        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField label="First Name" htmlFor="firstName" required>
                    <Input id="firstName" value={formData.firstName} onChange={e => handleFormChange('firstName', e.target.value)} />
                </FormField>
                <FormField label="Last Name" htmlFor="lastName" required>
                    <Input id="lastName" value={formData.lastName} onChange={e => handleFormChange('lastName', e.target.value)} />
                </FormField>
            </div>

            <FormField label="Member ID / Number" htmlFor="memberId">
                <Input id="memberId" value={formData.memberId} onChange={e => handleFormChange('memberId', e.target.value)} />
            </FormField>
            
            <FormField label="Email" htmlFor="email" required>
                <Input type="email" id="email" value={formData.email} onChange={e => handleFormChange('email', e.target.value)} />
            </FormField>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <FormField label="City" htmlFor="city">
                    <Input id="city" value={formData.city} onChange={e => handleFormChange('city', e.target.value)} />
                </FormField>
                 <FormField label="Province/Territory" htmlFor="province">
                    <Select id="province" options={PROVINCES} value={formData.province} onChange={e => handleFormChange('province', e.target.value)} />
                </FormField>
                 <FormField label="Postal Code" htmlFor="postalCode">
                    <Input id="postalCode" value={formData.postalCode} onChange={e => handleFormChange('postalCode', e.target.value)} />
                </FormField>
            </div>
            
            <FormField label="Image URL" htmlFor="imageUrl" instructions="A direct URL to a profile picture for this member.">
                <Input id="imageUrl" value={formData.imageUrl} onChange={e => handleFormChange('imageUrl', e.target.value)} />
            </FormField>

            <FormField label="Availability" htmlFor="availability">
                <Select id="availability" options={AVAILABILITY_OPTIONS} value={formData.availability} onChange={e => handleFormChange('availability', e.target.value)} />
            </FormField>

            <FormField label="Short Bio" htmlFor="shortBio" instructions="A brief summary for quick reference.">
                 <TextareaWithCounter
                    id="shortBio"
                    rows={4}
                    value={formData.shortBio}
                    onChange={e => handleFormChange('shortBio', e.target.value)}
                    wordLimit={250}
                />
            </FormField>

             <FormField label="Full Artist Bio" htmlFor="artistBio" instructions="A more detailed biography for grant applications or press kits.">
                 <TextareaWithCounter
                    id="artistBio"
                    rows={8}
                    value={formData.artistBio}
                    onChange={e => handleFormChange('artistBio', e.target.value)}
                    wordLimit={500}
                />
            </FormField>
        </div>

        <div className="flex items-center justify-end pt-6 border-t border-slate-200 mt-6 space-x-4">
          <button type="button" onClick={onCancel} className="px-6 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500">
              Cancel
          </button>
          <button type="submit" className="px-6 py-2 text-sm font-medium text-white bg-teal-600 border border-transparent rounded-md shadow-sm hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500">
              Save Member
          </button>
        </div>
    </form>
  );
};

export default MemberEditor;
