import { useState } from 'react';
import { departments, faculty, cseBranches, sdcFaculty } from '@/data/dummyData';
import { Download, ChevronDown, ChevronUp, Users, BookOpen, AlertCircle, GraduationCap, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { departmentPlacementData } from '@/data/extendedData';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const branchColors = ['hsl(var(--primary))', 'hsl(220, 70%, 55%)', 'hsl(160, 60%, 45%)', 'hsl(35, 80%, 55%)', 'hsl(280, 60%, 55%)', 'hsl(0, 65%, 55%)', 'hsl(180, 50%, 45%)'];

export default function DepartmentsPage() {
  const [activeDept, setActiveDept] = useState('cse');
  const [activeBranch, setActiveBranch] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  const dept = departments.find(d => d.id === activeDept);
  const deptFaculty = faculty.filter(f => f.dept === activeDept);

  // Get branch-specific courses
  const selectedBranch = activeDept === 'cse' && activeBranch
    ? cseBranches.find(b => b.id === activeBranch)
    : null;

  // Placement chart data for CSE branches
  const branchPlacementData = activeDept === 'cse'
    ? cseBranches.map(b => ({ name: b.name, placement: b.placementPct }))
    : [];

  // IT courses
  const itDept = departments.find(d => d.id === 'it') as any;

  return (
    <div className="animate-fade-in">
      {/* Department Tabs */}
      <div className="flex flex-wrap justify-center gap-3 mb-10">
        {departments.map(d => (
          <button
            key={d.id}
            onClick={() => { setActiveDept(d.id); setActiveBranch(null); }}
            className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
              activeDept === d.id
                ? 'bg-gradient-primary text-white shadow-glow'
                : 'bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary'
            }`}
          >
            <span className="mr-2">{d.icon}</span>
            {d.shortName}
          </button>
        ))}
      </div>

      {dept && (
        <div className="animate-fade-in">
          {/* Dept Overview */}
          <div className="feature-card mb-8 p-8">
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${dept.color} flex items-center justify-center text-3xl flex-shrink-0`}>
                {dept.icon}
              </div>
              <div className="flex-1">
                <h2 className="font-grotesk font-bold text-2xl mb-2">{dept.name}</h2>
                <p className="text-muted-foreground mb-5">{dept.description}</p>
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="w-4 h-4 text-primary" />
                    <span>{dept.students.toLocaleString()} Students</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <BookOpen className="w-4 h-4 text-primary" />
                    <span>{dept.faculty} Faculty Members</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* CSE Branch Sub-tabs */}
          {activeDept === 'cse' && (
            <div className="mb-8">
              <h3 className="font-grotesk font-semibold text-lg mb-4">🖥 CSE Variants & Branches</h3>
              <div className="flex flex-wrap gap-2 mb-6">
                <button
                  onClick={() => setActiveBranch(null)}
                  className={`px-4 py-2 rounded-xl text-xs font-medium transition-all ${
                    !activeBranch ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-primary/10'
                  }`}
                >
                  All Programs
                </button>
                {cseBranches.map(b => (
                  <button
                    key={b.id}
                    onClick={() => setActiveBranch(b.id)}
                    className={`px-4 py-2 rounded-xl text-xs font-medium transition-all ${
                      activeBranch === b.id ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-primary/10'
                    }`}
                  >
                    {b.name}
                    {b.sdcEligible && <span className="ml-1 text-[10px]">⭐</span>}
                  </button>
                ))}
              </div>

              {/* Branch Placement Chart */}
              <div className="feature-card p-6 mb-6">
                <h4 className="font-grotesk font-semibold text-sm mb-4">📊 Branch-wise Placement Rate (%)</h4>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={branchPlacementData}>
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis domain={[70, 100]} tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="placement" radius={[6, 6, 0, 0]}>
                      {branchPlacementData.map((_, i) => (
                        <Cell key={i} fill={branchColors[i % branchColors.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Dynamic Courses based on branch or general */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-10">
            <div>
              <h3 className="font-grotesk font-semibold text-lg mb-4">
                {selectedBranch ? `📘 ${selectedBranch.fullName} Courses` : activeDept === 'it' ? '📘 IT Courses' : 'Programs Offered'}
              </h3>
              <div className="space-y-3">
                {(selectedBranch
                  ? selectedBranch.courses
                  : activeDept === 'it' && itDept?.itCourses
                  ? itDept.itCourses
                  : dept.courses
                ).map((course: string, i: number) => (
                  <div key={course} className="feature-card">
                    <div
                      className="flex items-center justify-between cursor-pointer"
                      onClick={() => setExpanded(expanded === `${activeDept}-${activeBranch}-${i}` ? null : `${activeDept}-${activeBranch}-${i}`)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                          <span className="text-primary text-sm font-bold">{i + 1}</span>
                        </div>
                        <span className="font-medium text-sm">{course}</span>
                      </div>
                      {expanded === `${activeDept}-${activeBranch}-${i}` ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                    </div>
                    {expanded === `${activeDept}-${activeBranch}-${i}` && (
                      <div className="mt-4 pt-4 border-t border-border animate-fade-in">
                        <p className="text-sm text-muted-foreground mb-3">
                          {selectedBranch
                            ? `Core subject in the ${selectedBranch.fullName} curriculum with practical lab sessions and industry projects.`
                            : '4-year program with strong industry exposure, research opportunities, and 100% placement assistance.'}
                        </p>
                        <button className="btn-outline text-xs px-4 py-2 flex items-center gap-2">
                          <Download className="w-3.5 h-3.5" /> Download Syllabus
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Faculty Spotlight */}
            <div>
              <h3 className="font-grotesk font-semibold text-lg mb-4">Faculty Spotlight</h3>
              {deptFaculty.length > 0 ? (
                <div className="space-y-3">
                  {deptFaculty.map(f => (
                    <Link key={f.id} to={`/faculty/${f.id}`} className="feature-card flex items-center gap-4 group block">
                      <img src={f.image} alt={f.name} className="w-14 h-14 rounded-xl object-cover group-hover:scale-105 transition-transform duration-300" />
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-sm">{f.name}</p>
                          {(f as any).isSDC && <Badge variant="secondary" className="text-[10px]">SDC</Badge>}
                        </div>
                        <p className="text-xs text-muted-foreground">{f.role}</p>
                        <p className="text-xs text-primary mt-0.5">{f.experience} experience</p>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="feature-card text-center py-10">
                  <p className="text-muted-foreground text-sm">Faculty details coming soon</p>
                </div>
              )}
            </div>
          </div>

          {/* Auto-show SDC section for CSDS */}
          {activeDept === 'cse' && activeBranch === 'csds' && (
            <div className="animate-fade-in mb-10">
              <div className="feature-card p-6 mb-6 border-primary/30">
                <div className="flex items-center gap-3 mb-4">
                  <GraduationCap className="w-6 h-6 text-primary" />
                  <h3 className="font-grotesk font-bold text-xl">🎓 SDC – Skill Development Cell</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Industry-ready skill training in Web Development, Data Science, AI/ML, Mobile App Development, and Data Engineering — exclusively for CSDS students.
                </p>
                <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-sm mb-6">
                  <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0" />
                  <span className="text-amber-700 dark:text-amber-400">SDC programs are offered exclusively for CSDS branch students.</span>
                </div>

                <h4 className="font-grotesk font-semibold text-sm mb-3">SDC Faculty</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {sdcFaculty.map(f => (
                    <div key={f.id} className="feature-card p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <img src={f.image} alt={f.name} className="w-12 h-12 rounded-xl object-cover" />
                        <div>
                          <p className="font-medium text-sm">{f.name}</p>
                          <p className="text-xs text-primary">{f.role}</p>
                          <Badge variant="secondary" className="text-[10px] mt-1">SDC Mentor</Badge>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {f.subjects.map(s => (
                          <span key={s} className="px-2 py-0.5 text-xs rounded-full bg-primary/10 text-primary">{s}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
