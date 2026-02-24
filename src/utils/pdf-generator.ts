import type { ScreeningSession, ScreeningResult } from '@/types';
import { YES_RISK_ITEMS, NO_RISK_ITEMS } from '@/types';
import { formatDateForDisplay, calculateAgeInMonths } from './date-helpers';
import { getResultMessage, getRiskItemsFromAnswers } from './scoring';
import { getAllQuestions, personalizeQuestion } from '@/data/questions';

export function generateResultsPDF(session: ScreeningSession, result: ScreeningResult): void {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Please allow popups to print the results.');
    return;
  }

  const questions = getAllQuestions();
  const ageInMonths = calculateAgeInMonths(session.childInfo.dateOfBirth);
  const flaggedItems = getRiskItemsFromAnswers(session.initialAnswers);
  
  const questionsHtml = questions.map(q => {
    const answer = session.initialAnswers[q.item_number];
    const isFlagged = flaggedItems.includes(q.item_number);
    const personalizedQuestion = personalizeQuestion(q.question, session.childInfo.name);
    
    return `
      <tr class="${isFlagged ? 'flagged-row' : ''}">
        <td style="padding: 8px; border: 1px solid #e2e8f0; width: 40px; text-align: center; font-weight: 600;">
          ${q.item_number}
        </td>
        <td style="padding: 8px; border: 1px solid #e2e8f0;">
          ${personalizedQuestion}
          ${isFlagged ? '<span style="background: #fee2e2; color: #991b1b; font-size: 11px; padding: 2px 6px; border-radius: 4px; margin-left: 8px;">FLAGGED</span>' : ''}
        </td>
        <td style="padding: 8px; border: 1px solid #e2e8f0; width: 60px; text-align: center;">
          <span style="color: ${isFlagged ? '#dc2626' : '#16a34a'}; font-weight: bold;">
            ${answer ? 'Yes' : 'No'}
          </span>
          ${isFlagged ? '<span style="color: #dc2626; margin-left: 4px;">⚠</span>' : ''}
        </td>
      </tr>
    `;
  }).join('');

  const flaggedItemsHtml = flaggedItems.length > 0 ? `
    <div class="section" style="background: #fef2f2; border: 2px solid #fca5a5; border-radius: 8px; padding: 16px; margin: 16px 0;">
      <h3 style="margin: 0 0 12px 0; color: #991b1b;">Flagged Items Requiring Attention (${flaggedItems.length})</h3>
      <p style="font-size: 14px; color: #7f1d1d; margin-bottom: 12px;">
        The following items indicate at-risk responses:
      </p>
      <ul style="margin: 0; padding-left: 20px;">
        ${flaggedItems.map(num => {
          const q = questions.find(q => q.item_number === num);
          return q ? `<li style="margin: 8px 0; color: #7f1d1d; font-size: 14px;">
            <strong>Q${num}:</strong> ${personalizeQuestion(q.question, session.childInfo.name)}
          </li>` : '';
        }).join('')}
      </ul>
    </div>
  ` : '';

  const followUpDetailsHtml = session.followUpScore !== null ? `
    <div class="section">
      <h2>Follow-Up Interview Results</h2>
      <p><strong>Follow-Up Score:</strong> ${session.followUpScore} (threshold: ≥2 indicates concern)</p>
      <p><strong>Items Assessed:</strong> ${Object.keys(session.followUpAnswers).length}</p>
      <table style="width: 100%; border-collapse: collapse; margin-top: 12px;">
        <thead>
          <tr style="background: #f1f5f9;">
            <th style="padding: 8px; border: 1px solid #e2e8f0; text-align: left;">Question</th>
            <th style="padding: 8px; border: 1px solid #e2e8f0; text-align: center;">Score</th>
          </tr>
        </thead>
        <tbody>
          ${Object.values(session.followUpAnswers).map(fu => `
            <tr>
              <td style="padding: 8px; border: 1px solid #e2e8f0;">Question ${fu.questionNumber}</td>
              <td style="padding: 8px; border: 1px solid #e2e8f0; text-align: center; color: ${fu.finalScore === 1 ? '#dc2626' : '#16a34a'};">
                ${fu.finalScore === 1 ? 'Fail' : 'Pass'}
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  ` : '';

  const clinicalInterpretation = `
    <div class="section" style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px;">
      <h3 style="margin: 0 0 12px 0;">Clinical Interpretation Guide</h3>
      <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
        <thead>
          <tr style="background: #e2e8f0;">
            <th style="padding: 8px; border: 1px solid #cbd5e1; text-align: left;">Initial Score</th>
            <th style="padding: 8px; border: 1px solid #cbd5e1; text-align: left;">Risk Level</th>
            <th style="padding: 8px; border: 1px solid #cbd5e1; text-align: left;">Recommended Action</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="padding: 8px; border: 1px solid #e2e8f0;">0-2</td>
            <td style="padding: 8px; border: 1px solid #e2e8f0; color: #16a34a; font-weight: 600;">Low</td>
            <td style="padding: 8px; border: 1px solid #e2e8f0;">No further action unless surveillance concerns</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #e2e8f0;">3-7</td>
            <td style="padding: 8px; border: 1px solid #e2e8f0; color: #ca8a04; font-weight: 600;">Moderate</td>
            <td style="padding: 8px; border: 1px solid #e2e8f0;">Administer follow-up; refer if score ≥2</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #e2e8f0;">8-20</td>
            <td style="padding: 8px; border: 1px solid #e2e8f0; color: #dc2626; font-weight: 600;">High</td>
            <td style="padding: 8px; border: 1px solid #e2e8f0;">Refer immediately for diagnostic evaluation</td>
          </tr>
        </tbody>
      </table>
      <p style="margin: 12px 0 0 0; font-size: 12px; color: #64748b;">
        <strong>Note:</strong> YES responses indicate risk for items: ${[...YES_RISK_ITEMS].join(', ')}. 
        NO responses indicate risk for items: ${[...NO_RISK_ITEMS].join(', ')}.
      </p>
    </div>
  `;

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>M-CHAT-R/F Screening Results - ${session.childInfo.name}</title>
      <style>
        body {
          font-family: system-ui, -apple-system, sans-serif;
          max-width: 800px;
          margin: 0 auto;
          padding: 2rem;
          line-height: 1.6;
          color: #334155;
        }
        h1 { color: #1e3a8a; border-bottom: 2px solid #1e3a8a; padding-bottom: 0.5rem; margin-bottom: 1.5rem; }
        h2 { color: #334155; margin-top: 2rem; margin-bottom: 1rem; font-size: 18px; }
        h3 { color: #475569; font-size: 16px; }
        .result-box {
          padding: 1.5rem;
          border-radius: 0.5rem;
          margin: 1rem 0;
        }
        .result-low { background: #dcfce7; border: 2px solid #22c55e; }
        .result-moderate_negative { background: #fef9c3; border: 2px solid #eab308; }
        .result-moderate_positive, .result-high { background: #fee2e2; border: 2px solid #ef4444; }
        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin: 1rem 0; }
        .info-item { padding: 0.5rem; background: #f1f5f9; border-radius: 0.25rem; }
        .info-label { font-weight: 600; color: #475569; font-size: 12px; text-transform: uppercase; }
        ul { padding-left: 1.5rem; }
        li { margin: 0.5rem 0; }
        .footer { margin-top: 2rem; padding-top: 1rem; border-top: 1px solid #e2e8f0; font-size: 0.875rem; color: #64748b; }
        .section { margin: 1.5rem 0; }
        .flagged-row { background: #fef2f2; }
        table { width: 100%; border-collapse: collapse; }
        th { background: #f1f5f9; font-weight: 600; }
        @media print {
          body { padding: 1rem; }
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <h1>M-CHAT-R/F Screening Results</h1>
      
      <div class="info-grid">
        <div class="info-item">
          <div class="info-label">Child's Name</div>
          <div style="font-size: 16px; font-weight: 600;">${session.childInfo.name}</div>
        </div>
        <div class="info-item">
          <div class="info-label">Date of Birth</div>
          <div>${formatDateForDisplay(session.childInfo.dateOfBirth)}</div>
        </div>
        <div class="info-item">
          <div class="info-label">Age at Screening</div>
          <div>${ageInMonths ? `${ageInMonths} months` : 'N/A'}</div>
        </div>
        <div class="info-item">
          <div class="info-label">Screening Date</div>
          <div>${formatDateForDisplay(session.createdAt)}</div>
        </div>
        <div class="info-item">
          <div class="info-label">Status</div>
          <div>${session.status === 'completed' ? 'Completed' : 'In Progress'}</div>
        </div>
        <div class="info-item">
          <div class="info-label">Session ID</div>
          <div style="font-size: 12px; font-family: monospace;">${session.id}</div>
        </div>
      </div>
      
      <div class="result-box result-${result.category}">
        <h2 style="margin-top: 0;">${getResultMessage(result.category)}</h2>
        <p style="font-size: 18px; margin: 8px 0;"><strong>Initial Score:</strong> ${result.initialScore} out of 20</p>
        ${result.followUpScore !== null ? `<p style="font-size: 18px; margin: 8px 0;"><strong>Follow-Up Score:</strong> ${result.followUpScore}</p>` : ''}
      </div>
      
      <div class="section">
        <h2>Recommendation</h2>
        <p style="font-size: 16px;">${result.recommendation}</p>
        ${result.rescreenRecommended ? '<p style="background: #eff6ff; border: 1px solid #93c5fd; padding: 12px; border-radius: 6px;"><strong>Rescreen recommended</strong> at future well-child visits.</p>' : ''}
      </div>
      
      ${flaggedItemsHtml}
      
      <div class="section">
        <h2>All Questions and Responses</h2>
        <table>
          <thead>
            <tr>
              <th style="padding: 8px; border: 1px solid #e2e8f0; text-align: center;">#</th>
              <th style="padding: 8px; border: 1px solid #e2e8f0; text-align: left;">Question</th>
              <th style="padding: 8px; border: 1px solid #e2e8f0; text-align: center;">Answer</th>
            </tr>
          </thead>
          <tbody>
            ${questionsHtml}
          </tbody>
        </table>
      </div>
      
      ${followUpDetailsHtml}
      
      ${clinicalInterpretation}
      
      <div class="section">
        <h2>Important Information</h2>
        <ul>
          <li>This screening tool does not provide a diagnosis.</li>
          <li>False positives are common. A positive screen does not mean the child has autism.</li>
          <li>Screening should be part of a comprehensive surveillance process.</li>
          <li>For more information, visit <a href="https://mchatscreen.com">mchatscreen.com</a></li>
        </ul>
      </div>
      
      <div class="footer">
        <p><strong>© 2009 Diana Robins, Deborah Fein, & Marianne Barton</strong></p>
        <p>M-CHAT-R/F - Modified Checklist for Autism in Toddlers, Revised with Follow-Up</p>
        <p style="font-size: 11px; margin-top: 8px;">Generated on ${new Date().toLocaleString()}</p>
      </div>
      
      <button class="no-print" onclick="window.print()" style="margin-top: 2rem; padding: 1rem 2rem; font-size: 1rem; cursor: pointer; background: #1e3a8a; color: white; border: none; border-radius: 8px;">
        Print Results
      </button>
    </body>
    </html>
  `;
  
  printWindow.document.write(html);
  printWindow.document.close();
}
