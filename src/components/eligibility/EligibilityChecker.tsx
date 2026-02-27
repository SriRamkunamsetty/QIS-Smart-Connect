import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Lightbulb, Loader2 } from 'lucide-react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebaseConfig';

interface BranchRule {
  id: string;
  branchName: string;
  eligibilityRules: {
    minCGPA: number;
    entranceCutoff: number;
    requiredSubjects: string[];
  };
}

interface EligibilityResult {
  eligible: boolean;
  department: string;
  required: number;
  score: number;
  suggestions: string[];
}

export default function EligibilityChecker() {
  const [marks, setMarks] = useState('');
  const [branch, setBranch] = useState('cse');
  const [rules, setRules] = useState<BranchRule[]>([]);
  const [result, setResult] = useState<EligibilityResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch rules from Firestore admissions collection
    const fetchRules = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'admissions'));
        const fetchedRules = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as BranchRule));
        setRules(fetchedRules);
      } catch (error) {
        console.error("Error fetching branch rules:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchRules();
  }, []);

  const handleCheck = () => {
    const m = parseFloat(marks);
    if (isNaN(m) || m < 0 || m > 100) return;

    const selectedRule = rules.find(r => r.id === branch);
    if (!selectedRule) return;

    const required = selectedRule.eligibilityRules.minCGPA * 10; // Assuming minCGPA is on 10 pt scale
    const isEligible = m >= required;

    const suggestions = rules
      .filter(r => m >= (r.eligibilityRules.minCGPA * 10) && r.id !== branch)
      .map(r => r.branchName);

    setResult({
      eligible: isEligible,
      department: selectedRule.branchName,
      required: required,
      score: m,
      suggestions: suggestions
    });
  };

  if (loading) return <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="w-4 h-4 animate-spin" /> Loading rules...</div>;

  return (
    <div className="feature-card p-8 mt-12">
      <h3 className="font-grotesk font-bold text-2xl mb-2">
        Eligibility <span className="gradient-text">Checker</span>
      </h3>
      <p className="text-sm text-muted-foreground mb-6">
        Check your eligibility based on your inter marks (%) and desired branch
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium mb-2">Inter Marks (%)</label>
          <input
            type="number"
            min={0}
            max={100}
            value={marks}
            onChange={e => setMarks(e.target.value)}
            placeholder="e.g., 85"
            className="w-full px-4 py-3 rounded-xl bg-muted border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none text-sm transition-all"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Desired Branch</label>
          <select
            value={branch}
            onChange={e => setBranch(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-muted border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none text-sm"
          >
            {rules.map(r => (
              <option key={r.id} value={r.id}>{r.branchName}</option>
            ))}
          </select>
        </div>
      </div>

      <button onClick={handleCheck} className="btn-primary mb-6">
        Check Eligibility
      </button>

      {result && (
        <div
          className={`rounded-2xl p-6 border-2 transition-all duration-500 animate-fade-in ${result.eligible
              ? 'border-green-500/30 bg-green-500/5'
              : 'border-destructive/30 bg-destructive/5'
            }`}
        >
          <div className="flex items-center gap-3 mb-3">
            {result.eligible ? (
              <CheckCircle className="w-8 h-8 text-green-500" />
            ) : (
              <XCircle className="w-8 h-8 text-destructive" />
            )}
            <div>
              <p className={`font-grotesk font-bold text-xl ${result.eligible ? 'text-green-500' : 'text-destructive'}`}>
                {result.eligible ? 'You are Eligible!' : 'Not Eligible'}
              </p>
              <p className="text-sm text-muted-foreground">
                {result.department} — Required: {result.required}% | Your Score: {result.score}%
              </p>
            </div>
          </div>
          {!result.eligible && result.suggestions.length > 0 && (
            <div className="mt-4 pt-4 border-t border-border">
              <div className="flex items-center gap-2 mb-2">
                <Lightbulb className="w-4 h-4 text-amber-500" />
                <span className="text-sm font-medium">You may be eligible for:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {result.suggestions.map(s => (
                  <span key={s} className="px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
