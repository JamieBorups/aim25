
import React from 'react';
import { FormData } from '../../types';
import FormField from '../ui/FormField';
import { Input } from '../ui/Input';
import { TextareaWithCounter } from '../ui/TextareaWithCounter';
import { Select } from '../ui/Select';
import { CheckboxGroup } from '../ui/CheckboxGroup';
import { FileUpload } from '../ui/FileUpload';
import { 
    ARTISTIC_DISCIPLINES,
    CRAFT_GENRES,
    DANCE_GENRES,
    LITERARY_GENRES,
    MEDIA_GENRES,
    MUSIC_GENRES,
    THEATRE_GENRES,
    VISUAL_ARTS_GENRES,
    ACTIVITY_TYPES,
} from '../../constants';

interface Props {
  formData: FormData;
  onChange: <K extends keyof FormData>(field: K, value: FormData[K]) => void;
}

const ProjectInformationTab: React.FC<Props> = ({ formData, onChange }) => {

  const renderGenreField = (
      discipline: string,
      genres: { value: string; label: string; }[],
      fieldKey: keyof FormData,
      label: string
    ) => {
    if (formData.artisticDisciplines.includes(discipline)) {
      return (
        <FormField label={label} htmlFor={fieldKey} required={false}>
          <CheckboxGroup
            name={fieldKey}
            options={genres}
            selectedValues={formData[fieldKey] as string[]}
            onChange={(value) => onChange(fieldKey, value as any)}
            columns={4}
          />
        </FormField>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8">
      <FormField label="Project title" htmlFor="projectTitle" required instructions="This should be a brief description of your project and proposed activity. MAC staff and assessors can use this field to identify your application.">
          <TextareaWithCounter
            id="projectTitle"
            rows={1}
            value={formData.projectTitle}
            onChange={e => onChange('projectTitle', e.target.value)}
            wordLimit={15}
            />
      </FormField>

      <FormField label="Artistic discipline(s) most relevant to this application" htmlFor="artisticDisciplines" required instructions={<span>See glossary for <a href="#" className="text-teal-600 hover:underline">the definition of inter-arts (interdisciplinary arts)</a>.</span>}>
          <CheckboxGroup
            name="artisticDisciplines"
            options={ARTISTIC_DISCIPLINES}
            selectedValues={formData.artisticDisciplines}
            onChange={(value) => onChange('artisticDisciplines', value)}
            columns={3}
          />
      </FormField>

      {renderGenreField('craft', CRAFT_GENRES, 'craftGenres', 'Craft genres')}
      {renderGenreField('dance', DANCE_GENRES, 'danceGenres', 'Dance genres')}
      {renderGenreField('literary', LITERARY_GENRES, 'literaryGenres', 'Literary arts genres')}
      {renderGenreField('media', MEDIA_GENRES, 'mediaGenres', 'Media genres')}
      {renderGenreField('music', MUSIC_GENRES, 'musicGenres', 'Music genres')}
      {renderGenreField('theatre', THEATRE_GENRES, 'theatreGenres', 'Theatre genres')}
      {renderGenreField('visual', VISUAL_ARTS_GENRES, 'visualArtsGenres', 'Visual arts genres')}
      
      {formData.artisticDisciplines.includes('other') && (
        <FormField label="Specify" htmlFor="otherArtisticDisciplineSpecify" required>
            <Input
                id="otherArtisticDisciplineSpecify"
                value={formData.otherArtisticDisciplineSpecify}
                onChange={e => onChange('otherArtisticDisciplineSpecify', e.target.value)}
            />
        </FormField>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <FormField label="Project start date" htmlFor="projectStartDate" required instructions={<span><strong>Note:</strong> Payments on awarded grants will be released one month before this date at the earliest.<br/>The activity for which you are applying for funding should not start before the deadline, September 10, 2025.</span>}>
          <Input type="date" id="projectStartDate" value={formData.projectStartDate} onChange={e => onChange('projectStartDate', e.target.value)} />
        </FormField>
        <FormField label="Project end date" htmlFor="projectEndDate" required>
          <Input type="date" id="projectEndDate" value={formData.projectEndDate} onChange={e => onChange('projectEndDate', e.target.value)} />
        </FormField>
      </div>

       <FormField label="Type of activity within your project" htmlFor="activityType" required>
          <Select id="activityType" options={ACTIVITY_TYPES} value={formData.activityType} onChange={e => onChange('activityType', e.target.value)} />
      </FormField>

       <FormField label="Background" htmlFor="background" required instructions="Provide an overview of your history and experience in your field of practice. Assessors may not be familiar with your work, specific practice(s), community(ies), or culture(s). Provide the information they need to understand who you are and your work. Include your recent activity. Note: The CV/resume that you uploaded to your profile is shared with the assessors automatically. Make sure this document is up-to-date, as it will be used in the assessment of your application.">
          <TextareaWithCounter
            id="background"
            rows={5}
            value={formData.background}
            onChange={e => onChange('background', e.target.value)}
            wordLimit={350}
            />
      </FormField>

      <FormField label="Project description" htmlFor="projectDescription" required instructions={
          <ul className="list-disc list-inside space-y-2">
              <li>What are you planning to do?</li>
              <li>What do you hope to achieve?</li>
              <li>Why is this project important?</li>
              <li>What is the rationale behind your artistic choices?</li>
              <li>How is this relevant to your goals?</li>
              <li>How are you exploring a traditional and/or contemporary artistic practice?</li>
          </ul>
      }>
          <TextareaWithCounter
            id="projectDescription"
            rows={8}
            value={formData.projectDescription}
            onChange={e => onChange('projectDescription', e.target.value)}
            wordLimit={500}
            />
      </FormField>

      <FormField label="Who is your audience and/or participants, and how will you reach them?" htmlFor="audience" required>
          <TextareaWithCounter
            id="audience"
            rows={3}
            value={formData.audience}
            onChange={e => onChange('audience', e.target.value)}
            wordLimit={100}
            />
      </FormField>

      <FormField label="Payment and working conditions" htmlFor="paymentAndConditions" required instructions={
           <ul className="list-disc list-inside space-y-2">
              <li>Paying professional fees and/or honorariums is required and should be reflected in your budget. Explain how fees are being determined.</li>
              <li>If there are participants involved in this project, how will you ensure safe working conditions?</li>
          </ul>
      }>
          <TextareaWithCounter
            id="paymentAndConditions"
            rows={5}
            value={formData.paymentAndConditions}
            onChange={e => onChange('paymentAndConditions', e.target.value)}
            wordLimit={250}
            />
      </FormField>

      <FormField label="Permission and confirmation" htmlFor="permissionConfirmationFiles" instructions={
           <ul className="list-disc list-inside space-y-2">
              <li>confirmation letters from any collaborators or mentors working with you on the project.</li>
              <li>an agreement or a copy of a letter/email that indicates what the partner is providing to support your project.</li>
              <li>letters of permission to adapt or use copyrighted material.</li>
          </ul>
      }>
          <FileUpload id="permissionConfirmationFiles" files={formData.permissionConfirmationFiles} onFileChange={files => onChange('permissionConfirmationFiles', files)} />
      </FormField>

      <FormField label="Provide a schedule of presentations, publications, and/or events." htmlFor="schedule" required instructions={
          <ul className="list-disc list-inside space-y-2">
              <li>key steps</li>
              <li>dates</li>
              <li>venues (if applicable)</li>
              <li>marketing and outreach plans</li>
          </ul>
      }>
          <TextareaWithCounter
            id="schedule"
            rows={8}
            value={formData.schedule}
            onChange={e => onChange('schedule', e.target.value)}
            wordLimit={750}
            />
      </FormField>

      <FormField label="Cultural Integrity" htmlFor="culturalIntegrity" required instructions="Cultural integrity is the practice of respecting and honouring the ownership of materials, traditions, and knowledges that originate from a particular culture or community. Describe your relationship to the cultures or communities represented in your project and how you are approaching your work with cultural integrity.">
          <TextareaWithCounter
            id="culturalIntegrity"
            rows={5}
            value={formData.culturalIntegrity}
            onChange={e => onChange('culturalIntegrity', e.target.value)}
            wordLimit={300}
            />
      </FormField>
      
       <FormField label="Additional information" htmlFor="additionalInfo" instructions="If there is anything that has not been asked that is essential to understanding your application, provide it here.">
          <TextareaWithCounter
            id="additionalInfo"
            rows={5}
            value={formData.additionalInfo}
            onChange={e => onChange('additionalInfo', e.target.value)}
            wordLimit={250}
            />
      </FormField>

    </div>
  );
};

export default ProjectInformationTab;
