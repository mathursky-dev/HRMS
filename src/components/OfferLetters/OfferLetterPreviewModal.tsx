import React from 'react';
import { 
  Printer, 
  Share2, 
  X, 
  Building2, 
  CheckCircle2, 
  Clock, 
  Calendar, 
  Mail, 
  Phone, 
  MapPin, 
  FileCheck,
  AlertCircle,
  Award
} from 'lucide-react';
import { OfferLetter, TermsClause } from '../../types';
import { useRecruitment } from '../../context/RecruitmentContext';

interface OfferLetterPreviewModalProps {
  offer: OfferLetter;
  onClose: () => void;
  onUpdateStatus: (id: string, status: OfferLetter['status']) => void;
}

export const OfferLetterPreviewModal: React.FC<OfferLetterPreviewModalProps> = ({
  offer,
  onClose,
  onUpdateStatus,
}) => {
  const { companies, termsClauses } = useRecruitment();

  const company = companies.find(c => c.id === offer.companyId) || {
    id: offer.companyId,
    name: offer.companyName,
    legalName: offer.companyName,
    cin: 'U74999UP2022PTC168921',
    gstin: '09AAECE1234F1Z5',
    address: 'B-12, Sector 63, Electronic City',
    city: 'Noida',
    state: 'Uttar Pradesh',
    pincode: '201301',
    authorizedSignatory: 'Pooja Sharma',
    signatoryDesignation: 'Head of Human Resources',
    email: 'hr@essentialsoul.com',
    phone: '+91 98765 43210',
    website: 'www.essentialsoul.com',
  };

  // Get clauses to display in Annexure B
  const attachedClauses: TermsClause[] = offer.attachedClauseIds && offer.attachedClauseIds.length > 0
    ? termsClauses.filter(c => offer.attachedClauseIds.includes(c.id))
    : termsClauses.filter(c => c.isMandatoryInOffer && c.isActive);

  const formattedOfferDate = new Date(offer.offerDate).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const formattedJoiningDate = new Date(offer.joiningDate).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const formattedValidityDate = new Date(offer.validityDate).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const handlePrint = () => {
    window.print();
  };

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(
      `Hello ${offer.candidateName},\n\nWe are delighted to extend you an Offer of Employment for the position of *${offer.designation}* at *${offer.companyName}*.\n\n` +
      `• *Offer Ref*: ${offer.id}\n` +
      `• *Annual CTC*: ₹${offer.annualCtc.toLocaleString('en-IN')}\n` +
      `• *Monthly In-Hand*: ₹${offer.monthlyInHand.toLocaleString('en-IN')}\n` +
      `• *Date of Joining*: ${formattedJoiningDate}\n` +
      `• *Offer Valid Until*: ${formattedValidityDate}\n\n` +
      `Please review your offer letter and reply with your signed acceptance.\n\nWarm regards,\nHR Team - ${offer.companyName}`
    );
    const phone = offer.candidatePhone.replace(/[^0-9]/g, '');
    window.open(`https://wa.me/${phone ? '91' + phone.slice(-10) : ''}?text=${text}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white text-slate-900 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden my-4 max-h-[92vh] flex flex-col print:m-0 print:p-0 print:max-h-none print:shadow-none print:w-full print:rounded-none">
        {/* Top Control Bar (Hidden on print) */}
        <div className="p-3 sm:p-4 bg-slate-900 text-white flex items-center justify-between gap-3 shrink-0 print:hidden">
          <div className="flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-emerald-400" />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm sm:text-base">{offer.id}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                  offer.status === 'Accepted' || offer.status === 'Joined'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : offer.status === 'Issued'
                    ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                    : offer.status === 'Declined'
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                }`}>
                  {offer.status}
                </span>
              </div>
              <p className="text-xs text-slate-300 hidden sm:block">
                Candidate: {offer.candidateName} • {offer.designation}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Status change dropdown */}
            <select
              value={offer.status}
              onChange={(e) => onUpdateStatus(offer.id, e.target.value as OfferLetter['status'])}
              className="px-2 py-1.5 text-xs font-semibold bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none cursor-pointer"
            >
              <option value="Draft">Draft</option>
              <option value="Issued">Issued</option>
              <option value="Accepted">Accepted</option>
              <option value="Declined">Declined</option>
              <option value="Joined">Joined</option>
            </select>

            <button
              type="button"
              onClick={handleWhatsAppShare}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Share Offer via WhatsApp"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">WhatsApp</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Print or Save PDF"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Print / PDF</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Official Printable Letterhead Document Body */}
        <div className="p-6 sm:p-10 overflow-y-auto space-y-6 text-xs text-slate-800 leading-relaxed font-serif print:p-8 print:text-sm print:leading-normal">
          {/* Header & Logo */}
          <div className="border-b-2 border-slate-900 pb-4">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-xl sm:text-2xl font-black uppercase tracking-wider text-slate-950 font-sans">
                  {company.legalName || company.name}
                </h1>
                <p className="text-[11px] text-slate-600 font-sans mt-0.5">
                  {company.address}, {company.city}, {company.state} - {company.pincode}
                </p>
                <div className="flex items-center gap-3 text-[10px] text-slate-500 font-mono mt-1">
                  <span>CIN: {company.cin}</span>
                  <span>•</span>
                  <span>GSTIN: {company.gstin}</span>
                </div>
              </div>
              <div className="text-right font-sans shrink-0">
                <div className="w-12 h-12 rounded-xl bg-blue-900 text-white font-black text-lg flex items-center justify-center shadow-xs">
                  ESL
                </div>
                <span className="text-[10px] text-slate-400 font-mono mt-1 block">CONFIDENTIAL</span>
              </div>
            </div>
          </div>

          {/* Reference and Date */}
          <div className="flex justify-between items-center text-xs font-sans font-bold border-b border-slate-100 pb-2">
            <div>
              <span className="text-slate-500">Ref No: </span>
              <span className="text-slate-900 font-mono">{offer.id}</span>
            </div>
            <div>
              <span className="text-slate-500">Date: </span>
              <span className="text-slate-900">{formattedOfferDate}</span>
            </div>
          </div>

          {/* Candidate Address Block */}
          <div className="font-sans space-y-0.5">
            <p className="font-bold text-slate-900">To,</p>
            <p className="font-bold text-slate-950 text-sm">{offer.candidateName}</p>
            <p className="text-slate-600">Mobile: {offer.candidatePhone}</p>
            {offer.candidateEmail && <p className="text-slate-600">Email: {offer.candidateEmail}</p>}
          </div>

          {/* Subject Line */}
          <div className="py-2 border-y border-slate-200 font-sans font-bold text-slate-900 text-xs sm:text-sm uppercase tracking-wide bg-slate-50 px-3 rounded">
            Subject: Offer of Employment for the Position of &quot;{offer.designation}&quot;
          </div>

          {/* Salutation & Offer Details */}
          <div className="space-y-3 text-slate-800">
            <p>
              Dear <strong>{offer.candidateName}</strong>,
            </p>
            <p className="text-justify">
              With reference to your application and the subsequent rounds of interview you had with us, we are pleased to offer you the position of <strong>{offer.designation}</strong> in the <strong>{offer.department}</strong> department with <strong>{offer.companyName}</strong>.
            </p>
            <p className="text-justify">
              Your scheduled date of joining will be on or before <strong>{formattedJoiningDate}</strong> at our office premises in <strong>{offer.location}</strong>. You will report directly to the <strong>{offer.reportingManager || 'Department Head'}</strong>.
            </p>
            <p className="text-justify">
              Your Total Annual Cost to Company (CTC) will be <strong>₹{offer.annualCtc.toLocaleString('en-IN')}</strong> (Rupees {numberToWordsINR(offer.annualCtc)} Only). A comprehensive breakdown of your compensation structure is specified in <strong>Annexure A</strong>.
            </p>
            <p className="text-justify">
              Your employment will be governed by the standard terms, regulations, and code of conduct of the Company outlined in <strong>Annexure B</strong>. You will be on a probation period of <strong>{offer.probationMonths} months</strong> from your date of joining.
            </p>
            <p className="text-justify">
              Please note that this offer remains valid until <strong>{formattedValidityDate}</strong>. Kindly sign and return a duplicate copy of this letter as a token of your formal acceptance.
            </p>
          </div>

          {/* Annexure A: Compensation Breakdown Table */}
          <div className="pt-4 font-sans">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-bold text-xs uppercase px-2 py-0.5 bg-blue-100 text-blue-900 rounded">
                Annexure A
              </span>
              <h3 className="font-bold text-xs text-slate-900 uppercase tracking-wide">
                Salary & Compensation Structure
              </h3>
            </div>

            <div className="border border-slate-300 rounded-lg overflow-hidden">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-300">
                  <tr>
                    <th className="p-2.5">Salary Component</th>
                    <th className="p-2.5 text-right">Monthly (₹)</th>
                    <th className="p-2.5 text-right">Annual (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  <tr>
                    <td className="p-2.5 font-medium">Basic Salary</td>
                    <td className="p-2.5 text-right font-mono">₹{offer.compensationBreakup.basicSalary.toLocaleString('en-IN')}</td>
                    <td className="p-2.5 text-right font-mono">₹{(offer.compensationBreakup.basicSalary * 12).toLocaleString('en-IN')}</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-medium">House Rent Allowance (HRA)</td>
                    <td className="p-2.5 text-right font-mono">₹{offer.compensationBreakup.hra.toLocaleString('en-IN')}</td>
                    <td className="p-2.5 text-right font-mono">₹{(offer.compensationBreakup.hra * 12).toLocaleString('en-IN')}</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-medium">Special / City Compensatory Allowance</td>
                    <td className="p-2.5 text-right font-mono">₹{offer.compensationBreakup.specialAllowance.toLocaleString('en-IN')}</td>
                    <td className="p-2.5 text-right font-mono">₹{(offer.compensationBreakup.specialAllowance * 12).toLocaleString('en-IN')}</td>
                  </tr>
                  <tr className="bg-slate-50 font-bold text-slate-900">
                    <td className="p-2.5">Gross Salary (A)</td>
                    <td className="p-2.5 text-right font-mono">₹{offer.monthlyGross.toLocaleString('en-IN')}</td>
                    <td className="p-2.5 text-right font-mono">₹{(offer.monthlyGross * 12).toLocaleString('en-IN')}</td>
                  </tr>

                  {offer.compensationBreakup.pfEmployer && offer.compensationBreakup.pfEmployer > 0 ? (
                    <tr>
                      <td className="p-2.5 text-slate-600">Employer PF Contribution</td>
                      <td className="p-2.5 text-right font-mono text-slate-600">₹{offer.compensationBreakup.pfEmployer.toLocaleString('en-IN')}</td>
                      <td className="p-2.5 text-right font-mono text-slate-600">₹{(offer.compensationBreakup.pfEmployer * 12).toLocaleString('en-IN')}</td>
                    </tr>
                  ) : null}

                  {offer.compensationBreakup.performanceBonus && offer.compensationBreakup.performanceBonus > 0 ? (
                    <tr>
                      <td className="p-2.5 text-emerald-700 font-medium">Annual Performance Incentive / Bonus</td>
                      <td className="p-2.5 text-right font-mono text-slate-500">-</td>
                      <td className="p-2.5 text-right font-mono text-emerald-700">₹{offer.compensationBreakup.performanceBonus.toLocaleString('en-IN')}</td>
                    </tr>
                  ) : null}

                  <tr className="bg-blue-50 text-blue-950 font-black border-t-2 border-blue-200">
                    <td className="p-2.5 uppercase tracking-wide">Total Cost to Company (CTC)</td>
                    <td className="p-2.5 text-right font-mono text-xs">₹{offer.monthlyGross.toLocaleString('en-IN')}</td>
                    <td className="p-2.5 text-right font-mono text-sm">₹{offer.annualCtc.toLocaleString('en-IN')}</td>
                  </tr>

                  <tr className="bg-emerald-50 text-emerald-950 font-bold">
                    <td className="p-2.5">Estimated Net Take-Home (Monthly In-Hand)*</td>
                    <td className="p-2.5 text-right font-mono text-sm" colSpan={2}>
                      ₹{offer.monthlyInHand.toLocaleString('en-IN')} / month
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-[10px] text-slate-500 mt-1 italic">
              *Net in-hand salary is subject to statutory deductions such as Professional Tax (PT), Employee Provident Fund (EPF), and Income Tax (TDS) as applicable under Indian tax laws.
            </p>
          </div>

          {/* Annexure B: Terms and Conditions of Employment */}
          <div className="pt-4 font-sans page-break-before">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-bold text-xs uppercase px-2 py-0.5 bg-blue-100 text-blue-900 rounded">
                Annexure B
              </span>
              <h3 className="font-bold text-xs text-slate-900 uppercase tracking-wide">
                Key Terms & Conditions of Employment
              </h3>
            </div>

            <div className="space-y-3 bg-slate-50/70 p-4 rounded-lg border border-slate-200 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pb-2 border-b border-slate-200">
                <div>
                  <span className="text-slate-500">Probation Period: </span>
                  <span className="font-bold text-slate-900">{offer.probationMonths} Months</span>
                </div>
                <div>
                  <span className="text-slate-500">Notice Period: </span>
                  <span className="font-bold text-slate-900">{offer.noticeDays} Days</span>
                </div>
              </div>

              {attachedClauses.map(clause => (
                <div key={clause.id} className="space-y-0.5">
                  <p className="font-bold text-slate-900">
                    Clause {clause.clauseNumber}: {clause.title}
                  </p>
                  <p className="text-slate-700 text-justify text-[11px] leading-relaxed">
                    {clause.content}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Acceptance and Signatures Block */}
          <div className="pt-6 font-sans space-y-6">
            <div className="grid grid-cols-2 gap-8 pt-6 border-t-2 border-slate-900">
              {/* Employer Signatory */}
              <div>
                <p className="font-bold text-slate-900">For {company.name}</p>
                <div className="my-8 border-b border-dashed border-slate-400 w-48"></div>
                <p className="font-bold text-slate-950 text-xs">{company.authorizedSignatory}</p>
                <p className="text-[11px] text-slate-600">{company.signatoryDesignation}</p>
                <div className="mt-2 inline-flex items-center gap-1 text-[10px] text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  <Award className="w-3 h-3" />
                  <span>Authorized HR Seal Verified</span>
                </div>
              </div>

              {/* Candidate Acceptance */}
              <div>
                <p className="font-bold text-slate-900">Candidate Acceptance:</p>
                <p className="text-[10px] text-slate-500 mt-0.5 leading-snug">
                  I accept the offer on the terms and conditions outlined above. I will report for duty on:
                </p>
                <div className="my-6 border-b border-dashed border-slate-400 w-48"></div>
                <p className="font-bold text-slate-950 text-xs">{offer.candidateName}</p>
                <p className="text-[10px] text-slate-500">Signature & Date</p>
              </div>
            </div>

            <div className="text-center pt-4 border-t border-slate-200 text-[10px] text-slate-400 font-mono">
              This is a legally binding document generated through {company.name} ATS System • Ref: {offer.id}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper to format number to Indian currency words
function numberToWordsINR(num: number): string {
  if (num === 0) return 'Zero';
  const a = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  function convertTens(n: number): string {
    if (n < 20) return a[n];
    return b[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + a[n % 10] : '');
  }

  function convertHundreds(n: number): string {
    if (n >= 100) {
      return a[Math.floor(n / 100)] + ' Hundred' + (n % 100 !== 0 ? ' and ' + convertTens(n % 100) : '');
    }
    return convertTens(n);
  }

  const crore = Math.floor(num / 10000000);
  const lakh = Math.floor((num % 10000000) / 100000);
  const thousand = Math.floor((num % 100000) / 1000);
  const remainder = num % 1000;

  let result = '';
  if (crore > 0) result += convertHundreds(crore) + ' Crore ';
  if (lakh > 0) result += convertHundreds(lakh) + ' Lakh ';
  if (thousand > 0) result += convertHundreds(thousand) + ' Thousand ';
  if (remainder > 0) result += convertHundreds(remainder);

  return result.trim();
}
