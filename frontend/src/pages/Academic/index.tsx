import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { classroomsApi } from '../../api/classrooms.api';
import { gradesApi } from '../../api/grades.api';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { BookOpen, Users, Plus, Award, Trash2, Check } from 'lucide-react';

export default function Academic() {
  const queryClient = useQueryClient();
  const [selectedCourse, setSelectedCourse] = useState<string>('');

  // Quick-add grade form
  const [formStudent, setFormStudent] = useState('');
  const [assessmentName, setAssessmentName] = useState('');
  const [gradeValue, setGradeValue] = useState<number>(4.0);
  const [weight, setWeight] = useState<number>(20);

  // Inline editing
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<number>(0);

  const { data: courses, isLoading: loadingCourses } = useQuery({
    queryKey: ['teacher-classrooms'],
    queryFn: () => classroomsApi.listMine(),
  });

  // Selecciona el primer curso por defecto
  useEffect(() => {
    if (!selectedCourse && courses && courses.length > 0) {
      setSelectedCourse(courses[0].id);
    }
  }, [courses, selectedCourse]);

  const { data: courseDetail } = useQuery({
    queryKey: ['classroom-detail', selectedCourse],
    queryFn: () => classroomsApi.getById(selectedCourse),
    enabled: !!selectedCourse,
  });

  const { data: grades, isLoading: loadingGrades } = useQuery({
    queryKey: ['grades', selectedCourse],
    queryFn: () => gradesApi.list({ courseId: selectedCourse }),
    enabled: !!selectedCourse,
  });

  const invalidateGrades = () => {
    queryClient.invalidateQueries({ queryKey: ['grades', selectedCourse] });
  };

  const addMutation = useMutation({
    mutationFn: () =>
      gradesApi.create({
        studentId: formStudent,
        courseId: selectedCourse,
        assessmentName,
        value: Number(gradeValue),
        weight: Number(weight),
      }),
    onSuccess: () => {
      invalidateGrades();
      setFormStudent('');
      setAssessmentName('');
      setGradeValue(4.0);
      setWeight(20);
    },
    onError: (e: any) => alert(e?.response?.data?.error || 'No se pudo registrar la nota'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, value }: { id: string; value: number }) => gradesApi.update(id, { value }),
    onSuccess: () => { invalidateGrades(); setEditingId(null); },
    onError: (e: any) => alert(e?.response?.data?.error || 'No se pudo actualizar'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => gradesApi.remove(id),
    onSuccess: invalidateGrades,
  });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formStudent || !assessmentName) return;
    addMutation.mutate();
  };

  const startEdit = (id: string, value: number) => { setEditingId(id); setEditValue(value); };
  const commitEdit = (id: string) => updateMutation.mutate({ id, value: Number(editValue) });

  if (loadingCourses) return <LoadingSpinner />;

  const enrollments = courseDetail?.enrollments ?? [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight font-display m-0">
            Gestión Académica
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Planilla de calificaciones en tiempo real. Edición directa sobre la tabla.
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-400 bg-slate-900/60 px-3 py-1.5 rounded-xl border border-slate-800/80">
          <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
          <span>Salón:</span>
          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="bg-transparent border-none text-slate-200 focus:outline-none cursor-pointer"
          >
            {courses?.map((c) => (
              <option key={c.id} value={c.id}>{c.title}</option>
            ))}
          </select>
        </div>
      </div>

      {!courses || courses.length === 0 ? (
        <Card className="text-center py-10">
          <p className="text-xs text-slate-500">No tienes salones asignados todavía.</p>
        </Card>
      ) : (
        <>
          {/* Quick add grade */}
          <Card className="space-y-4">
            <h3 className="text-base font-bold text-slate-100 font-display flex items-center gap-2">
              <Plus className="w-5 h-5 text-indigo-400" />
              Registrar Calificación
            </h3>
            <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-5 gap-3 text-xs items-end">
              <div className="md:col-span-2">
                <label className="block text-slate-400 font-semibold mb-2">Alumno</label>
                <select required value={formStudent}
                  onChange={(e) => setFormStudent(e.target.value)}
                  className="w-full p-2.5 rounded-xl glass-input text-sm">
                  <option value="">Selecciona...</option>
                  {enrollments.map((en) => (
                    <option key={en.student.id} value={en.student.id}>
                      {en.student.firstName} {en.student.lastName}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-slate-400 font-semibold mb-2">Evaluación</label>
                <input type="text" required value={assessmentName}
                  onChange={(e) => setAssessmentName(e.target.value)}
                  placeholder="Parcial 1"
                  className="w-full p-2.5 rounded-xl glass-input text-sm" />
              </div>
              <div>
                <label className="block text-slate-400 font-semibold mb-2">Nota (0-5)</label>
                <input type="number" step="0.1" min="0" max="5" required value={gradeValue}
                  onChange={(e) => setGradeValue(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl glass-input text-sm font-mono" />
              </div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="block text-slate-400 font-semibold mb-2">%</label>
                  <input type="number" min="0" max="100" required value={weight}
                    onChange={(e) => setWeight(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl glass-input text-sm font-mono" />
                </div>
                <Button variant="primary" type="submit" isLoading={addMutation.isPending} className="h-[42px] px-4">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </form>
          </Card>

          {/* Planilla */}
          <Card className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-bold text-slate-100 font-display flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-400" />
                Planilla de Notas
              </h3>
              <span className="text-[11px] text-slate-500">{enrollments.length} alumnos matriculados</span>
            </div>

            <div className="overflow-x-auto">
              {loadingGrades ? <LoadingSpinner /> : grades && grades.length > 0 ? (
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-450 font-semibold">
                      <th className="pb-3 pl-2">Alumno</th>
                      <th className="pb-3">Evaluación</th>
                      <th className="pb-3">Nota</th>
                      <th className="pb-3">%</th>
                      <th className="pb-3 pr-2 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850/60">
                    {grades.map((g) => (
                      <tr key={g.id} className="text-slate-350 hover:bg-slate-900/20">
                        <td className="py-3 pl-2 font-semibold text-slate-200">
                          {g.student.firstName} {g.student.lastName}
                        </td>
                        <td>{g.assessmentName}</td>
                        <td>
                          {editingId === g.id ? (
                            <div className="flex items-center gap-1">
                              <input
                                type="number" step="0.1" min="0" max="5" autoFocus
                                value={editValue}
                                onChange={(e) => setEditValue(Number(e.target.value))}
                                onKeyDown={(e) => { if (e.key === 'Enter') commitEdit(g.id); }}
                                className="w-16 p-1.5 rounded-lg glass-input text-sm font-mono"
                              />
                              <button onClick={() => commitEdit(g.id)} className="text-emerald-400 hover:text-emerald-300">
                                <Check className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => startEdit(g.id, g.value)}
                              className={`font-mono font-bold cursor-pointer hover:underline ${g.value < 3.0 ? 'text-rose-450' : 'text-indigo-400'}`}
                              title="Click para editar"
                            >
                              {g.value.toFixed(1)}
                            </button>
                          )}
                        </td>
                        <td className="font-mono text-slate-400">{g.weight}%</td>
                        <td className="pr-2 text-right">
                          <Button
                            variant="danger"
                            onClick={() => { if (confirm('¿Eliminar esta nota?')) deleteMutation.mutate(g.id); }}
                            className="py-1 px-2.5 text-xs inline-flex"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="text-center py-8">
                  <Award className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                  <p className="text-xs text-slate-500">Aún no hay notas en este salón. Registra la primera arriba.</p>
                </div>
              )}
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
