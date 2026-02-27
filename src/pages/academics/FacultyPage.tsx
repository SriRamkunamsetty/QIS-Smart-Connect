import { faculty, departments, sdcFaculty } from '@/data/dummyData';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Award } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const allFaculty = [...faculty, ...sdcFaculty.map(f => ({ ...f, dept: f.dept }))];

export default function FacultyPage() {
  const [filterDept, setFilterDept] = useState('all');
  const [filterSDC, setFilterSDC] = useState(false);

  const filtered = allFaculty.filter(f => {
    const matchDept = filterDept === 'all' || f.dept === filterDept;
    const matchSDC = !filterSDC || (f as any).isSDC;
    return matchDept && matchSDC;
  });

  return (
    <div className="animate-fade-in">
      {/* Filter */}
      <div className="flex flex-wrap justify-center gap-2 mb-4">
        <button
          onClick={() => setFilterDept('all')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${filterDept === 'all' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-primary/10'}`}
        >
          All Departments
        </button>
        {departments.map(d => (
          <button
            key={d.id}
            onClick={() => setFilterDept(d.id)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${filterDept === d.id ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-primary/10'}`}
          >
            {d.shortName}
          </button>
        ))}
      </div>
      <div className="flex justify-center gap-2 mb-8">
        <button
          onClick={() => setFilterSDC(!filterSDC)}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${filterSDC ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-primary/10'}`}
        >
          🎓 SDC Faculty Only
        </button>
      </div>

      {/* Faculty Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map(f => {
          const dept = departments.find(d => d.id === f.dept);
          return (
            <Link key={f.id} to={`/faculty/${f.id}`} className="feature-card group block">
              <div className="flex items-center gap-4 mb-3">
                <img src={f.image} alt={f.name} className="w-16 h-16 rounded-xl object-cover group-hover:scale-105 transition-transform" />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-sm group-hover:text-primary transition-colors">{f.name}</h3>
                    {(f as any).isSDC && <Badge variant="secondary" className="text-[10px]">SDC Mentor</Badge>}
                  </div>
                  <p className="text-xs text-muted-foreground">{f.role}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <div className="flex items-center gap-1"><Award className="w-3 h-3 text-primary" />{f.experience}</div>
                {dept && <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary">{dept.shortName}</span>}
              </div>
              {(f as any).subjects && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {(f as any).subjects.slice(0, 3).map((s: string) => (
                    <span key={s} className="px-2 py-0.5 text-[10px] rounded-full bg-muted text-muted-foreground">{s}</span>
                  ))}
                </div>
              )}
            </Link>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16">
          <p className="text-muted-foreground">No faculty found for this filter.</p>
        </div>
      )}
    </div>
  );
}
