import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  classroomsApi,
  Classroom,
  CourseLevel,
  CreateClassroomPayload,
} from '../../../api/classrooms.api';
import { teachersApi } from '../../../api/teachers.api';
import { studentsApi } from '../../../api/students.api';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import LoadingSpinner from '../../../components/ui/LoadingSpinner';
import { DoorOpen, Plus, Pencil, Trash2, Users, UserPlus, X } from 'lucide-react';

const LEVELS: CourseLevel[] = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'];

interface FormState {
  title: string;
  subject: string;
  durationMonths: number;
  targetLevel: CourseLevel;
  description: string;
  teacherId: string;
}

const EMPTY_FORM: FormState = {
  title: '',
  subject: '',
  durationMonths: 6,
  targetLevel: 'BEGINNER',
  description: '',
  teacherId: '',
};

export default function AdminClassrooms() {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Classroom | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [error, setError] = useState<string | null>(null);
  const [enrollFor, setEnrollFor] = useState<Classroom | null>(null);

  const { data: classrooms, isLoading } = useQuery({
    queryKey: ['admin-classrooms'],
    queryFn: () => classroomsApi.listAll(),
  });

  const { data: teachers } = useQuery({
    queryKey: ['admin-teachers'],
    queryFn: () => teachersApi.list(),
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['admin-classrooms'] });

  const createMutation = useMutation({
    mutationFn: (payload: CreateClassroomPayload) => classroomsApi.create(payload),
    onSuccess: () => { invalidate(); closeModal(); },
    onError: (e: any) => setError(e?.response?.data?.message || e?.response?.data?.error || 'No se pudo crear el salón'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) => classroomsApi.update(id, payload),
    onSuccess: () => { invalidate(); closeModal(); },
    onError: (e: any) => setError(e?.response?.data?.message || 'No se pudo actualizar'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => classroomsApi.remove(id),
    onSuccess: invalidate,
    onError: (e: any) => alert(e?.response?.data?.message || 'No se pudo eliminar'),
  });

  const openCreate = () => { setEditing(null); setForm(EMPTY_FORM); setError(null); setShowModal(true); };

  const openEdit = (c: Classroom) => {
    setEditing(c);
    setForm({
      title: c.title,
      subject: c.subject,
      durationMonths: c.durationMonths,
      targetLevel: c.targetLevel,
      description: c.description || '',
      teacherId: c.teacherId,
    });
    setError(null);
    setShowModal(true);
  };

  const closeModal = () => { setShowModal(false); setEditing(null); setForm(EMPTY_FORM); };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (editing) {
      updateMutation.mutate({
        id: editing.id,
        payload: {
          title: form.title,
          subject: form.subject,
          description: form.description,
          durationMonths: Number(form.durationMonths),
          targetLevel: form.targetLevel,
        },
      });
    } else {
      if (!form.teacherId) { setError('Selecciona un profesor responsable'); return; }
      createMutation.mutate({
        title: form.title,
        subject: form.subject,
        durationMonths: Number(form.durationMonths),
        targetLevel: form.targetLevel,
        description: form.description || undefined,
        teacherId: form.teacherId,
      });
    }
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight font-display m-0 flex items-center gap-2">
            <DoorOpen className="w-6 h-6 text-indigo-400" />
            Gestión de Salones
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Administra los salones, su profesor responsable y los alumnos matriculados.
          </p>
        </div>
        <Button variant="primary" onClick={openCreate} className="py-2 px-4 text-xs font-semibold">
          <Plus className="w-4 h-4" />
          Nuevo Salón
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {classrooms && classrooms.length > 0 ? (
          classrooms.map((c) => (
            <Card key={c.id} className="space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-sm font-bold text-slate-100">{c.title}</h3>
                  <span className="text-[11px] text-slate-500">{c.subject}</span>
                </div>
                <Badge variant="info">{c.targetLevel}</Badge>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed min-h-[32px]">
                {c.description || 'Sin descripción'}
              </p>
              <div className="flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800/60 pt-3">
                <span>Prof. {c.teacher?.firstName} {c.teacher?.lastName}</span>
                <span className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-indigo-400" />
                  {c._count?.enrollments ?? 0}
                </span>
              </div>
              <div className="flex gap-2 pt-1">
                <Button variant="secondary" onClick={() => setEnrollFor(c)} className="py-1.5 px-2.5 text-xs inline-flex flex-1">
                  <UserPlus className="w-3.5 h-3.5" /> Matrículas
                </Button>
                <Button variant="secondary" onClick={() => openEdit(c)} className="py-1.5 px-2.5 text-xs inline-flex">
                  <Pencil className="w-3.5 h-3.5" />
                </Button>
                <Button
                  variant="danger"
                  onClick={() => { if (confirm(`¿Eliminar "${c.title}"?`)) deleteMutation.mutate(c.id); }}
                  className="py-1.5 px-2.5 text-xs inline-flex"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </Card>
          ))
        ) : (
          <Card className="md:col-span-2 lg:col-span-3 text-center py-10">
            <p className="text-xs text-slate-500">No hay salones registrados.</p>
          </Card>
        )}
      </div>

      {/* Modal Crear/Editar */}
      {showModal ? (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md p-6 glass-panel relative" glow="primary">
            <h3 className="text-base font-bold text-white font-display mb-4">
              {editing ? `Editar: ${editing.title}` : 'Nuevo Salón'}
            </h3>

            {error ? (
              <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs">
                {error}
              </div>
            ) : null}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-2">Nombre del salón</label>
                <input type="text" required value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full p-2.5 rounded-xl glass-input text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 font-semibold mb-2">Materia</label>
                  <input type="text" required value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    className="w-full p-2.5 rounded-xl glass-input text-sm" />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-2">Duración (meses)</label>
                  <input type="number" min={1} max={24} required value={form.durationMonths}
                    onChange={(e) => setForm({ ...form, durationMonths: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl glass-input text-sm font-mono" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 font-semibold mb-2">Nivel</label>
                  <select value={form.targetLevel}
                    onChange={(e) => setForm({ ...form, targetLevel: e.target.value as CourseLevel })}
                    className="w-full p-2.5 rounded-xl glass-input text-sm">
                    {LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
                {!editing ? (
                  <div>
                    <label className="block text-slate-400 font-semibold mb-2">Profesor</label>
                    <select required value={form.teacherId}
                      onChange={(e) => setForm({ ...form, teacherId: e.target.value })}
                      className="w-full p-2.5 rounded-xl glass-input text-sm">
                      <option value="">Selecciona...</option>
                      {teachers?.map((t) => (
                        <option key={t.id} value={t.id}>{t.firstName} {t.lastName}</option>
                      ))}
                    </select>
                  </div>
                ) : null}
              </div>
              <div>
                <label className="block text-slate-400 font-semibold mb-2">Descripción</label>
                <textarea rows={2} value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full p-2.5 rounded-xl glass-input text-sm" />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button variant="secondary" type="button" onClick={closeModal}>Cancelar</Button>
                <Button variant="primary" type="submit" isLoading={createMutation.isPending || updateMutation.isPending}>
                  {editing ? 'Guardar Cambios' : 'Crear Salón'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      ) : null}

      {/* Modal Matrículas */}
      {enrollFor ? (
        <EnrollmentModal classroom={enrollFor} onClose={() => { setEnrollFor(null); invalidate(); }} />
      ) : null}
    </div>
  );
}

// ── Modal de gestión de matrículas ────────────────────────────────────────────
function EnrollmentModal({ classroom, onClose }: { classroom: Classroom; onClose: () => void }) {
  const queryClient = useQueryClient();

  const { data: detail, isLoading: loadingDetail } = useQuery({
    queryKey: ['classroom-detail', classroom.id],
    queryFn: () => classroomsApi.getById(classroom.id),
  });

  const { data: allStudents } = useQuery({
    queryKey: ['admin-students'],
    queryFn: () => studentsApi.list(),
  });

  const refresh = () => queryClient.invalidateQueries({ queryKey: ['classroom-detail', classroom.id] });

  const enrollMutation = useMutation({
    mutationFn: (studentId: string) => classroomsApi.enroll(classroom.id, studentId),
    onSuccess: refresh,
  });

  const unenrollMutation = useMutation({
    mutationFn: (studentId: string) => classroomsApi.unenroll(classroom.id, studentId),
    onSuccess: refresh,
  });

  const enrolledIds = new Set((detail?.enrollments ?? []).map((e) => e.student.id));
  const available = (allStudents ?? []).filter((s) => !enrolledIds.has(s.id));

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg p-6 glass-panel relative" glow="primary">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-base font-bold text-white font-display">Matrículas · {classroom.title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        {loadingDetail ? <LoadingSpinner /> : (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Matriculados</h4>
              <div className="space-y-2 max-h-72 overflow-y-auto">
                {detail && detail.enrollments.length > 0 ? detail.enrollments.map((e) => (
                  <div key={e.student.id} className="p-2.5 bg-slate-900/30 border border-slate-800/40 rounded-lg flex items-center justify-between text-xs">
                    <span className="text-slate-200">{e.student.firstName} {e.student.lastName}</span>
                    <button onClick={() => unenrollMutation.mutate(e.student.id)} className="text-rose-400 hover:text-rose-300">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )) : <p className="text-[11px] text-slate-500">Sin alumnos.</p>}
              </div>
            </div>
            <div>
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Disponibles</h4>
              <div className="space-y-2 max-h-72 overflow-y-auto">
                {available.length > 0 ? available.map((s) => (
                  <div key={s.id} className="p-2.5 bg-slate-900/30 border border-slate-800/40 rounded-lg flex items-center justify-between text-xs">
                    <span className="text-slate-300">{s.firstName} {s.lastName}</span>
                    <button onClick={() => enrollMutation.mutate(s.id)} className="text-emerald-400 hover:text-emerald-300">
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                )) : <p className="text-[11px] text-slate-500">No hay más alumnos.</p>}
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end pt-4">
          <Button variant="secondary" onClick={onClose}>Cerrar</Button>
        </div>
      </Card>
    </div>
  );
}
