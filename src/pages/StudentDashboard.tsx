import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Bell, CreditCard, Calendar, ClipboardList, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { doc, onSnapshot, collection, query, where } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import DigitalIDCard from '@/components/idcard/DigitalIDCard';

interface StudentData {
  rollNumber: string;
  placementReadinessScore?: number;
  riskScore?: number;
  riskLevel?: string;
}

interface Application {
  id: string;
  status: string;
  submissionDate: any;
}

export default function StudentDashboard() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [studentData, setStudentData] = useState<StudentData | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (!user?.uid) return;

    // 1. Real-time listener for Student profile
    const studentUnsubscribe = onSnapshot(doc(db, 'students', user.uid), (doc) => {
      if (doc.exists()) {
        setStudentData(doc.data() as StudentData);
      }
      setLoading(false);
    });

    // 2. Real-time listener for Applications
    const q = query(collection(db, 'applications'), where('userId', '==', user.uid));
    const appsUnsubscribe = onSnapshot(q, (snapshot) => {
      const apps = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Application));
      setApplications(apps);
    });

    return () => {
      studentUnsubscribe();
      appsUnsubscribe();
    };
  }, [isAuthenticated, user?.uid, navigate]);

  if (loading) {
    return (
      <div className="page-transition min-h-screen pt-28 flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 bg-primary/20 rounded-full mb-4" />
          <div className="h-4 w-32 bg-muted rounded" />
        </div>
      </div>
    );
  }

  const statusSteps = [
    { label: 'Application Submitted', done: applications.length > 0 },
    { label: 'Document Verification', done: applications.some(a => a.status === 'Approved') },
    { label: 'Merit Evaluation', done: false },
    { label: 'Seat Allotment', done: false },
  ];

  return (
    <div className="page-transition min-h-screen pt-28 pb-20">
      <div className="container mx-auto">
        {/* Welcome */}
        <div className="glass-card rounded-3xl p-8 mb-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-hero" />
          <div className="relative z-10">
            <p className="text-sm text-muted-foreground mb-1">Welcome back 👋</p>
            <h1 className="font-grotesk font-bold text-3xl mb-2">{user?.name || 'Student'}</h1>
            <p className="text-muted-foreground text-sm">
              Roll No: <span className="text-primary font-mono font-semibold">{studentData?.rollNumber || 'N/A'}</span>
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Application Status */}
          <div className="feature-card md:col-span-2">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                <ClipboardList className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-grotesk font-semibold">Application Status</h3>
            </div>
            <div className="relative">
              <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />
              <div className="space-y-4">
                {statusSteps.map((step, i) => (
                  <div key={step.label} className="flex items-center gap-4 pl-10 relative">
                    <div className={`absolute left-2.5 w-3 h-3 rounded-full border-2 ${step.done ? 'bg-primary border-primary' : 'bg-background border-border'} -translate-x-1/2`} />
                    <div className={`flex items-center gap-2 text-sm ${step.done ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {step.done
                        ? <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
                        : i === statusSteps.filter(s => s.done).length
                          ? <Clock className="w-4 h-4 text-amber-500 flex-shrink-0" />
                          : <AlertCircle className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      }
                      {step.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Digital ID Card */}
          <DigitalIDCard />

          {/* Performance & Readiness */}
          <div className="feature-card">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-xl bg-indigo-500/10 flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-indigo-500" />
              </div>
              <h3 className="font-grotesk font-semibold">Placement Readiness</h3>
            </div>
            <div className="text-center py-4">
              <div className="text-4xl font-bold text-primary mb-1">{studentData?.placementReadinessScore || 0}%</div>
              <p className="text-xs text-muted-foreground">Professional Score</p>
              <div className="w-full bg-muted h-2 rounded-full mt-4 overflow-hidden">
                <div
                  className="h-full bg-gradient-primary transition-all duration-1000"
                  style={{ width: `${studentData?.placementReadinessScore || 0}%` }}
                />
              </div>
            </div>
          </div>

          {/* Risk Level */}
          <div className="feature-card">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-xl bg-rose-500/10 flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-rose-500" />
              </div>
              <h3 className="font-grotesk font-semibold">Academic Risk</h3>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">{studentData?.riskLevel || 'Safe'}</p>
                <p className="text-xs text-muted-foreground">Current Standing</p>
              </div>
              <div className={`px-3 py-1 rounded-full text-xs font-bold ${studentData?.riskLevel === 'High Risk' ? 'bg-rose-500/10 text-rose-500' :
                  studentData?.riskLevel === 'Moderate Risk' ? 'bg-amber-500/10 text-amber-500' :
                    'bg-green-500/10 text-green-500'
                }`}>
                {studentData?.riskScore || 0}%
              </div>
            </div>
          </div>

          {/* Payment Status */}
          <div className="feature-card">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-emerald-500" />
              </div>
              <h3 className="font-grotesk font-semibold">Payment</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Application Fee</span>
                <span className="text-emerald-500 font-medium flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" /> Paid
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tuition Fee</span>
                <span className="text-amber-500 font-medium flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> Pending
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function GraduationCap(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
      <path d="M6 12v5c3 3 9 3 12 0v-5" />
    </svg>
  );
}
