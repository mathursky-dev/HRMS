import React, { useState } from 'react';
import { X, MessageSquare, Copy, Check, ExternalLink } from 'lucide-react';
import { useRecruitment } from '../../context/RecruitmentContext';

interface WhatsAppTemplatesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WhatsAppTemplatesModal: React.FC<WhatsAppTemplatesModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const templates = [
    {
      id: 't1',
      title: '1. Initial Greeting & Lead Screening',
      category: 'Initial Contact',
      text: `Hello {Candidate_Name},

Greetings from *Essential Soul Lifestyle Pvt Ltd*!

We received your application for the *{Position}* position. We were impressed by your profile and would love to have a brief telephonic conversation to understand your experience and availability.

Could you please confirm if this is a good time to speak, or let us know when you are available today?

Best regards,
*{HR_Name}*
HR Recruitment Team
Essential Soul Lifestyle Pvt Ltd`,
    },
    {
      id: 't2',
      title: '2. Office Interview Invitation (Sector 62, Noida)',
      category: 'Interview Invite',
      text: `Dear {Candidate_Name},

Following our discussion, your interview has been scheduled with *Essential Soul Lifestyle Pvt Ltd*.

📍 *Date & Time:* {Interview_Date} at {Interview_Time}
🏢 *Location:* Essential Soul Lifestyle Pvt Ltd, Sector 62, Noida (Near Metro Station)
👤 *Interviewer:* {Interviewer_Name}

📄 *Please carry:*
1. Updated Resume (Hard copy)
2. Aadhaar Card / ID Proof
3. Last 2 months salary slips / proof (if applicable)

Please reply to this message to confirm your attendance. Looking forward to meeting you!

Best regards,
*{HR_Name}*
Essential Soul Lifestyle Pvt Ltd`,
    },
    {
      id: 't3',
      title: '3. Interview Day Morning Reminder',
      category: 'Reminder',
      text: `Good morning {Candidate_Name}!

This is a gentle reminder that your interview for the *{Position}* role at *Essential Soul Lifestyle Pvt Ltd* is scheduled today at *{Interview_Time}*.

If you need any guidance regarding location or metro transit, please call us directly on this number.

See you today!

Warm regards,
*{HR_Name}*`,
    },
    {
      id: 't4',
      title: '4. Selection & Offer Confirmation',
      category: 'Selection',
      text: `Dear {Candidate_Name},

Congratulations! 🎉 

We are pleased to inform you that you have been *Selected* for the position of *{Position}* at *Essential Soul Lifestyle Pvt Ltd*.

💼 *Designation:* {Position}
📅 *Joining Date:* {Joining_Date}
⏰ *Reporting Time:* 09:30 AM
🏢 *Location:* Essential Soul Lifestyle Office, Noida

Our HR team will reach out with the documentation checklist shortly. Please acknowledge this message to confirm your acceptance.

Welcome to the Essential Soul family!

Warm regards,
*{HR_Name}*
HR Department`,
    },
    {
      id: 't5',
      title: '5. Polite Follow-Up / No Response',
      category: 'Follow-up',
      text: `Hello {Candidate_Name},

We tried contacting you regarding your job application with *Essential Soul Lifestyle Pvt Ltd*, but could not connect.

Are you still exploring opportunities for the *{Position}* role? Please let us know so we can plan your interview slot accordingly.

Thank you!
*{HR_Name}*`,
    },
  ];

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4 text-teal-400" />
              Standard WhatsApp Template Library
            </h2>
            <p className="text-xs text-slate-400">
              Approved message templates for candidate communications
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {templates.map((tpl) => (
            <div key={tpl.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 text-xs sm:text-sm">{tpl.title}</h4>
                  <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-semibold">
                    {tpl.category}
                  </span>
                </div>

                <button
                  onClick={() => handleCopy(tpl.id, tpl.text)}
                  className="flex items-center gap-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 px-2.5 py-1 rounded-lg text-xs font-bold transition-colors"
                >
                  {copiedId === tpl.id ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Template</span>
                    </>
                  )}
                </button>
              </div>

              <pre className="p-3 bg-white rounded-lg border border-slate-200 font-sans text-xs text-slate-700 whitespace-pre-wrap leading-relaxed">
                {tpl.text}
              </pre>
            </div>
          ))}
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold"
          >
            Close Library
          </button>
        </div>

      </div>
    </div>
  );
};
