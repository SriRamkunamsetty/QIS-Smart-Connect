import { sdcFaculty } from '@/data/dummyData';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, BookOpen, GraduationCap, Mail } from 'lucide-react';

export default function SDCPage() {
  // In a real app, this would come from auth context / student record
  const studentBranch = 'csds'; // simulate logged-in student branch

  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <div className="feature-card p-8 mb-8">
        <div className="flex flex-col md:flex-row gap-6 items-start">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-3xl flex-shrink-0">
            🎓
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h2 className="font-grotesk font-bold text-2xl">Skill Development Cell (SDC)</h2>
              <Badge variant="default">Exclusive</Badge>
            </div>
            <p className="text-muted-foreground mb-4">
              The Skill Development Cell focuses on industry-ready skill training including modern technologies such as
              Web Development, Data Science, AI/ML, Mobile App Development, and Data Engineering. These programs are
              conducted exclusively for CSDS students to enhance employability and placement readiness.
            </p>
            <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-sm">
              <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0" />
              <span className="text-amber-700 dark:text-amber-400">SDC programs are offered exclusively for CSDS branch students.</span>
            </div>
          </div>
        </div>
      </div>

      {/* SDC Enrollment */}
      <div className="feature-card p-6 mb-8">
        {studentBranch === 'csds' ? (
          <div className="text-center">
            <GraduationCap className="w-10 h-10 text-primary mx-auto mb-3" />
            <h3 className="font-grotesk font-semibold text-lg mb-2">You're Eligible for SDC!</h3>
            <p className="text-sm text-muted-foreground mb-4">As a CSDS student, you can enroll in SDC programs.</p>
            <button className="btn-primary px-6 py-2.5 text-sm">Enroll in SDC Program</button>
          </div>
        ) : (
          <div className="text-center py-4">
            <AlertCircle className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <h3 className="font-grotesk font-semibold text-lg mb-2">Available Only for CSDS Students</h3>
            <p className="text-sm text-muted-foreground">SDC enrollment is restricted to the CSDS (CSE – Data Science) branch.</p>
          </div>
        )}
      </div>

      {/* SDC Faculty */}
      <h3 className="font-grotesk font-semibold text-lg mb-4 flex items-center gap-2">
        <BookOpen className="w-5 h-5 text-primary" /> SDC Faculty & Courses
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {sdcFaculty.map(f => (
          <Card key={f.id} className="group hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-4">
                <img src={f.image} alt={f.name} className="w-14 h-14 rounded-xl object-cover group-hover:scale-105 transition-transform" />
                <div>
                  <CardTitle className="text-base">{f.name}</CardTitle>
                  <p className="text-xs text-primary mt-0.5">{f.role}</p>
                  <Badge variant="secondary" className="mt-1 text-[10px]">SDC Mentor</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground mb-2">Subjects:</p>
              <div className="flex flex-wrap gap-1.5">
                {f.subjects.map(s => (
                  <span key={s} className="px-2.5 py-1 text-xs rounded-full bg-primary/10 text-primary">{s}</span>
                ))}
              </div>
              <div className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
                <Mail className="w-3 h-3" /> {f.name.toLowerCase().replace(' ', '')}@qiscet.edu.in
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
