import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { AppSettings, FormData, Member, Task, Report } from '../types';
import { EXPENSE_FIELDS } from '../constants';

interface PdfOptions {
    IMPACT_QUESTIONS: { id: string; label: string; instructions?: string; }[];
    IMPACT_OPTIONS: { value: string; label: string; }[];
    PEOPLE_INVOLVED_OPTIONS: { value: string; label: string; }[];
    GRANT_ACTIVITIES_OPTIONS: { value: string; label: string; }[];
}

export const generateReportPdf = async (
    project: FormData, 
    report: Report, 
    members: Member[], 
    tasks: Task[], 
    actuals: Map<string, number>,
    options: PdfOptions,
    settings: AppSettings
) => {
    const { IMPACT_QUESTIONS, IMPACT_OPTIONS, PEOPLE_INVOLVED_OPTIONS, GRANT_ACTIVITIES_OPTIONS } = options;
    const { expenseLabels } = settings.budget;

    const expenseFieldMap = new Map(Object.values(EXPENSE_FIELDS).flat().map(f => [f.key, (expenseLabels[f.key] !== undefined && expenseLabels[f.key] !== '') ? expenseLabels[f.key] : f.label]));

    const doc = new jsPDF('p', 'pt', 'a4');
    const pageHeight = doc.internal.pageSize.getHeight();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 40;
    let y = 0;

    const addPage = () => {
      doc.addPage();
      y = margin;
    }

    const drawText = (text: string, x: number, startY: number, options: any = {}): number => {
        const fontSize = options.fontSize || 10;
        const fontStyle = options.fontStyle || 'normal';
        const color = options.color || '#000000';
        const maxWidth = options.maxWidth || pageWidth - margin * 2;
        const lineSpacingFactor = options.lineSpacing || 1.2;
        const lineSpacing = fontSize * lineSpacingFactor;
        
        doc.setFontSize(fontSize);
        doc.setFont('helvetica', fontStyle);
        doc.setTextColor(color);
        
        const lines = doc.splitTextToSize(text || 'N/A', maxWidth);
        
        if (startY + (lines.length * lineSpacing) > pageHeight - margin) {
          addPage();
          startY = y;
        }

        doc.text(lines, x, startY);
        return startY + (lines.length * lineSpacing);
    };

    const drawSectionTitle = (title: string, subtitle?: string) => {
        if (y + 40 > pageHeight - margin) addPage();
        y += y === margin ? 0 : 20; // Add space before section unless it's the first on page
        y = drawText(title, margin, y, { fontSize: 14, fontStyle: 'bold' });
        if (subtitle) {
            y = drawText(subtitle, margin, y, { fontSize: 9, fontStyle: 'italic', color: '#475569' });
        }
        doc.setDrawColor(100, 100, 100);
        doc.line(margin, y - 5, pageWidth - margin, y - 5);
        y += 10;
    };
    
    const drawField = (label: string, value: string) => {
      const heightNeeded = (doc.splitTextToSize(value || 'N/A', pageWidth - margin * 2 - 20).length * 12) + 25;
      if (y + heightNeeded > pageHeight - margin) addPage();
      y = drawText(label, margin, y, { fontSize: 9, fontStyle: 'bold', color: '#334155' });
      y = drawText(value || 'N/A', margin + 10, y + 2, { fontSize: 10, fontStyle: 'normal' });
      y += 15;
    };

    const drawTable = (head: any[], body: any[], options?: any) => {
        autoTable(doc, {
            head: head,
            body: body,
            startY: y,
            theme: 'striped',
            headStyles: { fillColor: [41, 51, 65], textColor: 255, fontStyle: 'bold' },
            styles: { fontSize: 8, cellPadding: 4 },
            didDrawPage: (data) => {
                y = data.cursor?.y || margin;
            },
            ...options
        });
        y = (doc as any).lastAutoTable.finalY + 10;
    }
    
    const formatCurrency = (value: number) => value.toLocaleString('en-CA', { style: 'currency', currency: 'CAD' });

    // --- PDF Generation Start ---
    y = margin;
    const mainTitle = `Final Report: ${project.projectTitle}`;
    y = drawText(mainTitle, margin, y, { fontSize: 18, fontStyle: 'bold' });
    y += 10;
    y = drawText(`Report Generated: ${new Date().toLocaleDateString()}`, margin, y, { fontSize: 10, color: '#64748b'});
    
    drawSectionTitle('Project Overview');
    drawField('Describe the project and its results:', report.projectResults);
    drawField('Project Start Date:', project.projectStartDate ? new Date(project.projectStartDate).toLocaleDateString() : 'N/A');
    drawField('Project End Date:', project.projectEndDate ? new Date(project.projectEndDate).toLocaleDateString() : 'N/A');
    drawField('Background:', project.background);
    
    addPage();
    drawSectionTitle('Collaborators');
    project.collaboratorDetails.forEach(c => {
        const m = members.find(mem => mem.id === c.memberId);
        if (m) {
            if (y + 50 > pageHeight - margin) addPage();
            y = drawText(`${m.firstName} ${m.lastName} - ${c.role}`, margin, y, { fontSize: 12, fontStyle: 'bold' });
            y = drawText(m.artistBio || 'No full bio provided.', margin + 10, y + 2, { fontSize: 10 });
            y += 15;
        }
    });

    addPage();
    drawSectionTitle('Budget Report');
    drawField('Describe how you spent the grant:', report.grantSpendingDescription);

    const expenseCategories = Object.entries(EXPENSE_FIELDS).map(([key, fields]) => ({
        key: key as keyof FormData['budget']['expenses'],
        title: key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()),
        fields: fields,
        items: project.budget.expenses[key as keyof FormData['budget']['expenses']]
    }));

    expenseCategories.forEach(category => {
        if (category.items.length === 0) return;
        if (y + 60 > pageHeight - margin) addPage();
        y = drawText(`Expenses: ${category.title}`, margin, y + 10, { fontSize: 12, fontStyle: 'bold' });
        
        const tableBody = category.items.map(item => {
            const actualAmount = actuals.get(item.id) || 0;
            return [
                expenseFieldMap.get(item.source) || item.source,
                item.description,
                formatCurrency(item.amount),
                formatCurrency(actualAmount),
                formatCurrency(item.amount - actualAmount)
            ];
        });
        
        drawTable(
            [['Category/Item', 'Description', 'Budgeted', 'Actual', 'Variance']],
            tableBody,
            { columnStyles: { 2: { halign: 'right' }, 3: { halign: 'right' }, 4: { halign: 'right' } } }
        );
    });

    addPage();
    drawSectionTitle('Workplan');
    drawField('Were any adjustments made to the workplan?:', report.workplanAdjustments);
    
    const taskBody = tasks.map(task => {
        const assignee = members.find(m => m.id === task.assignedMemberId);
        return [
            task.title,
            assignee ? `${assignee.firstName} ${assignee.lastName}` : 'Unassigned',
            task.status,
            task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'N/A'
        ];
    });

    drawTable([['Task', 'Assignee', 'Status', 'Due Date']], taskBody);

    addPage();
    drawSectionTitle('Reach & Impact');
    drawField('Actively involved individuals who identify as:', report.involvedPeople.map(key => PEOPLE_INVOLVED_OPTIONS.find(opt => opt.value === key)?.label.replace('... ', '')).join(', ') || 'N/A');
    drawField('Activities supported by this grant involved:', report.involvedActivities.map(key => GRANT_ACTIVITIES_OPTIONS.find(opt => opt.value === key)?.label.replace('... ', '')).join(', ') || 'N/A');
    y += 15;
    IMPACT_QUESTIONS.forEach(q => {
        const answer = report.impactStatements[q.id];
        const answerLabel = IMPACT_OPTIONS.find(opt => opt.value === answer)?.label || 'Not Answered';
        drawField(q.label, answerLabel);
    });

    addPage();
    drawSectionTitle('Additional Information and Assets');
    drawField('Project Highlights:', report.highlights.map(h => `${h.title}: ${h.url}`).join('\n') || 'N/A');


    const reportName = `Report - ${project.projectTitle}.pdf`;
    doc.save(reportName);
};