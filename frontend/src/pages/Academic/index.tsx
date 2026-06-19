import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { academicApi } from '../../api/academic.api';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import {
  BookOpen,
  Users,
  Plus,
  CheckSquare,
  Square,
  Award,
  Filter,
  UserPlus
} from 'lucide-react';

export default function Academic() {
  const queryClient = useQueryClient();
  const [selectedCourse, setSelectedCourse] = useState<string>('all');
  const [riskFilter, setRiskFilter] = useState<string>('all');

  // Grade Form State
  const [showGradeModal, setShowGradeModal] = useState(false);
  const [formStudent, setFormStudent] = useState<{ id: string; name: string } | null>(null);
  const [assessmentName, setAssessmentName] = useState('');
  const [gradeValue, setGradeValue] = useState<number>(4.0);
  const [weight, setWeight] = useState<number>(20);
  const [feedback, setFeedback] = useState('');

  // Fetch lists
  const { data: courses, isLoading: loadingCourses } = useQuery({
    queryKey: ['academic-courses'],
    queryFn: () => academicApi.getCourses(),
  });

  const { data: students, isLoading: loadingStudents } = useQuery({
    queryKey: ['academic-students', selectedCourse, riskFilter],
    queryFn: () => academicApi.getStudents({
      risk: riskFilter !== 'all' ? riskFilter : undefined,
    }),
  });

  const { data: milestones, isLoading: loadingMilestones } = useQuery({
    queryKey: ['academic-milestones'],
    queryFn: () => academicApi.getMilestones(),
  });

  const { data: grades, isLoading: loadingGrades } = useQuery({
    queryKey: ['academic-grades'],
    queryFn: () => academicApi.getGrades(),
  });

  // Mutations
  const addGradeMutation = useMutation({
    mutationFn: (data: any) => academicApi.addGrade(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['academic-grades'] });
      queryClient.invalidateQueries({ queryKey: ['academic-students'] });
      queryClient.invalidateQueries({ queryKey: ['students'] });
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
      setShowGradeModal(false);
      // reset form
      setAssessmentName('');
      setGradeValue(4.0);
      setWeight(20);
      setFeedback('');
    },
  });

  const toggleMilestoneMutation = useMutation({
    mutationFn: (id: string) => academicApi.toggleMilestone(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['academic-milestones'] });
      queryClient.invalidateQueries({ queryKey: ['academic-courses'] });
      queryClient.invalidateQueries({ queryKey: ['courses'] });
    },
  });

  const handleOpenGradeModal = (student: { id: string; name: string }) => {
    setFormStudent(student);
    setShowGradeModal(true);
  };

  const handleAddGradeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formStudent || !assessmentName) return;

    addGradeMutation.mutate({
      studentId: formStudent.id,
      studentName: formStudent.name,
      courseId: 'crs-1',
      courseName: 'Cálculo Multivariable',
      value: Number(gradeValue),
      weight: Number(weight),
      assessmentName,
      feedback,
    });
  };

  const filteredStudents = students?.filter((s) => {
    if (selectedCourse === 'all') return true;
    // Map human course queries to list item keys
    if (selectedCourse === 'crs-1') return s.grade.includes('Cálculo');
    if (selectedCourse === 'crs-2') return s.grade.includes('Inteligencia') || s.grade.includes('IA');
    if (selectedCourse === 'crs-3') return s.grade.includes('Física');
    if (selectedCourse === 'crs-4') return s.grade.includes('Estructuras');
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight font-display m-0">
            Gestión Académica
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Gestione notas de alumnos, asigne evaluaciones e inspeccione el avance del currículo académico.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Student roster list card */}
        <Card className="lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <h3 className="text-base font-bold text-slate-100 font-display flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-400" />
              Listado de Alumnos
            </h3>

            {/* Filters */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 text-xs text-slate-400 bg-slate-900/60 px-3 py-1.5 rounded-xl border border-slate-800/80">
                <Filter className="w-3.5 h-3.5" />
                <span>Curso:</span>
                <select
                  value={selectedCourse}
                  onChange={(e) => setSelectedCourse(e.target.value)}
                  className="bg-transparent border-none text-slate-200 focus:outline-none cursor-pointer"
                >
                  <option value="all">Todos</option>
                  {courses?.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-slate-400 bg-slate-900/60 px-3 py-1.5 rounded-xl border border-slate-800/80">
                <span>Riesgo:</span>
                <select
                  value={riskFilter}
                  onChange={(e) => setRiskFilter(e.target.value)}
                  className="bg-transparent border-none text-slate-200 focus:outline-none cursor-pointer"
                >
                  <option value="all">Todos</option>
                  <option value="LOW">Bajo</option>
                  <option value="MODERATE">Moderado</option>
                  <option value="CRITICAL">Crítico</option>
                </select>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            {loadingStudents ? (
              <LoadingSpinner />
            ) : filteredStudents && filteredStudents.length > 0 ? (
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-450 font-semibold">
                    <th className="pb-3 pl-2">Estudiante</th>
                    <th className="pb-3">Curso Regular</th>
                    <th className="pb-3">Asistencia</th>
                    <th className="pb-3">Riesgo</th>
                    <th className="pb-3 pr-2 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850/60">
                  {filteredStudents.map((st) => (
                    <tr key={st.id} className="text-slate-350 hover:bg-slate-900/20">
                      <td className="py-3.5 pl-2">
                        <div>
                          <p className="font-semibold text-slate-200">{st.name}</p>
                          <span className="text-[10px] text-slate-500">{st.email}</span>
                        </div>
                      </td>
                      <td>{st.grade}</td>
                      <td>{st.attendanceRate}%</td>
                      <td>
                        <Badge variant={st.riskStatus.toLowerCase() as any}>
                          {st.riskStatus}
                        </Badge>
                      </td>
                      <td className="pr-2 text-right">
                        <Button
                          variant="secondary"
                          onClick={() => handleOpenGradeModal(st)}
                          className="py-1 px-3 text-xs inline-flex"
                        >
                          <Award className="w-3.5 h-3.5 text-indigo-400" />
                          Calificar
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-xs text-slate-500 text-center py-8">No se encontraron estudiantes para este filtro.</p>
            )}
          </div>
        </Card>

        {/* Curriculum Milestones Checklist & Grades Feed */}
        <div className="space-y-6">
          {/* Milestone list card */}
          <Card className="space-y-4">
            <h3 className="text-base font-bold text-slate-100 font-display flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-400" />
              Currículo e Hitos
            </h3>
            <p className="text-xs text-slate-500">
              Active o desactive los objetivos cumplidos del syllabus.
            </p>

            <div className="space-y-3">
              {loadingMilestones ? (
                <LoadingSpinner />
              ) : milestones && milestones.length > 0 ? (
                milestones.map((mst) => (
                  <div
                    key={mst.id}
                    onClick={() => toggleMilestoneMutation.mutate(mst.id)}
                    className="p-3 bg-slate-900/30 border border-slate-800/40 rounded-xl flex items-start gap-3 cursor-pointer hover:bg-slate-800/20 transition-colors text-xs"
                  >
                    <div className="mt-0.5 text-indigo-400 shrink-0">
                      {mst.isCompleted ? (
                        <CheckSquare className="w-4 h-4 fill-indigo-600/20" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </div>
                    <div className="space-y-1">
                      <h4
                        className={`font-semibold text-slate-200 ${
                          mst.isCompleted ? 'line-through text-slate-500' : ''
                        }`}
                      >
                        {mst.title}
                      </h4>
                      <p className="text-slate-500 text-[11px] leading-relaxed">{mst.description}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500 text-center py-6">No hay hitos del currículo registrados.</p>
              )}
            </div>
          </Card>

          {/* Recent registered grades */}
          <Card className="space-y-4">
            <h3 className="text-base font-bold text-slate-100 font-display">
              Últimas Notas Registradas
            </h3>

            <div className="space-y-3">
              {loadingGrades ? (
                <LoadingSpinner />
              ) : grades && grades.length > 0 ? (
                grades.slice(-3).reverse().map((grd) => (
                  <div
                    key={grd.id}
                    className="p-3 bg-slate-900/30 border border-slate-800/40 rounded-xl flex justify-between gap-3 text-xs"
                  >
                    <div>
                      <p className="font-semibold text-slate-200">{grd.studentName}</p>
                      <span className="text-[10px] text-slate-500">
                        {grd.assessmentName} ({grd.weight}%)
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-indigo-400 font-mono text-sm">{grd.value}</span>
                      <p className="text-[9px] text-slate-500">{grd.date}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500 text-center py-6">No hay calificaciones registradas.</p>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Grade Submission Modal */}
      {showGradeModal && formStudent ? (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md p-6 glass-panel relative" glow="primary">
            <h3 className="text-base font-bold text-white font-display mb-4">
              Registrar Calificación: {formStudent.name}
            </h3>

            <form onSubmit={handleAddGradeSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-2">Nombre de la Evaluación</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Quiz 1, Examen Final"
                  value={assessmentName}
                  onChange={(e) => setAssessmentName(e.target.value)}
                  className="w-full p-2.5 rounded-xl glass-input text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 font-semibold mb-2">Nota (0.0 - 5.0)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.0"
                    max="5.0"
                    required
                    value={gradeValue}
                    onChange={(e) => setGradeValue(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl glass-input text-sm font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-2">Porcentaje (%)</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    required
                    value={weight}
                    onChange={(e) => setWeight(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl glass-input text-sm font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-2">Retroalimentación (Feedback)</label>
                <textarea
                  rows={3}
                  placeholder="Escriba comentarios para el estudiante..."
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  className="w-full p-2.5 rounded-xl glass-input text-sm"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button variant="secondary" type="button" onClick={() => setShowGradeModal(false)}>
                  Cancelar
                </Button>
                <Button variant="primary" type="submit" isLoading={addGradeMutation.isPending}>
                  Guardar Calificación
                </Button>
              </div>
            </form>
          </Card>
        </div>
      ) : null}
    </div>
  );
}
