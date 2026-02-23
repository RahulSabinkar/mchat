import type { ScreeningSession, ScreeningResult } from '@/types';
import { formatDateForDisplay } from './date-helpers';
import { getResultMessage } from './scoring';

export function generateResultsPDF(session: ScreeningSession, result: ScreeningResult): void {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Please allow popups to print the results.');
    return;
  }
  
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>M-CHAT-R/F Screening Results</title>
      <style>
        body {
          font-family: system-ui, -apple-system, sans-serif;
          max-width: 800px;
          margin: 0 auto;
          padding: 2rem;
          line-height: 1.6;
        }
        h1 { color: #1e3a8a; border-bottom: 2px solid #1e3a8a; padding-bottom: 0.5rem; }
        h2 { color: #334155; margin-top: 2rem; }
        .result-box {
          padding: 1.5rem;
          border-radius: 0.5rem;
          margin: 1rem 0;
        }
        .result-low { background: #dcfce7; border: 2px solid #22c55e; }
        .result-moderate-negative { background: #fef9c3; border: 2px solid #eab308; }
        .result-moderate-positive, .result-high { background: #fee2e2; border: 2px solid #ef4444; }
        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin: 1rem 0; }
        .info-item { padding: 0.5rem; background: #f1f5f9; border-radius: 0.25rem; }
        .info-label { font-weight: 600; color: #475569; }
        ul { padding-left: 1.5rem; }
        li { margin: 0.5rem 0; }
        .footer { margin-top: 2rem; padding-top: 1rem; border-top: 1px solid #e2e8f0; font-size: 0.875rem; color: #64748b; }
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
          <div>${session.childInfo.name}</div>
        </div>
        <div class="info-item">
          <div class="info-label">Date of Birth</div>
          <div>${formatDateForDisplay(session.childInfo.dateOfBirth)}</div>
        </div>
        <div class="info-item">
          <div class="info-label">Screening Date</div>
          <div>${formatDateForDisplay(session.createdAt)}</div>
        </div>
        <div class="info-item">
          <div class="info-label">Status</div>
          <div>${session.status === 'completed' ? 'Completed' : 'In Progress'}</div>
        </div>
      </div>
      
      <div class="result-box result-${result.category}">
        <h2 style="margin-top: 0;">${getResultMessage(result.category)}</h2>
        <p><strong>Initial Score:</strong> ${result.initialScore} out of 20</p>
        ${result.followUpScore !== null ? `<p><strong>Follow-Up Score:</strong> ${result.followUpScore}</p>` : ''}
      </div>
      
      <h2>Recommendation</h2>
      <p>${result.recommendation}</p>
      
      <h2>Important Information</h2>
      <ul>
        <li>This screening tool does not provide a diagnosis.</li>
        <li>False positives are common. A positive screen does not mean your child has autism.</li>
        <li>Please share these results with your child's healthcare provider.</li>
        <li>For more information, visit <a href="https://mchatscreen.com">mchatscreen.com</a></li>
      </ul>
      
      <div class="footer">
        <p>© 2009 Diana Robins, Deborah Fein, & Marianne Barton</p>
        <p>M-CHAT-R/F - Modified Checklist for Autism in Toddlers, Revised with Follow-Up</p>
      </div>
      
      <button class="no-print" onclick="window.print()" style="margin-top: 2rem; padding: 1rem 2rem; font-size: 1rem; cursor: pointer;">
        Print Results
      </button>
    </body>
    </html>
  `;
  
  printWindow.document.write(html);
  printWindow.document.close();
}
