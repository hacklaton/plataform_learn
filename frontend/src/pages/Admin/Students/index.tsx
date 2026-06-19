import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { studentsApi, Student, CreateStudentPayload } from '../../../api/students.api';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import LoadingSpinner from '../../../components/ui/LoadingSpinner';
import { Users, Plus, Pencil, Power } from 'lucide-react';

interface FormState {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  enrollmentCode: string;
  grade: string;
}

const EMPTY_FORM: FormState = {
  email: '',
  password: '',
  firstName: '',
  lastName: '',
  enrollmentCode: '',
  grade: '',
};

export default function AdminStudents() {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Student | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [error, setError] = useState<string | null>(null);

  const { data: students, isLoading } = useQuery({
    queryKey: ['admin-students'],
    queryFn: () => studentsApi.list(),
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['admin-students'] });

  const createMutation = useMutation({
    mutationFn: (payload: CreateStudentPayload) => studentsApi.create(payload),
    onSuccess: () => { invalidate(); closeModal(); },
    onError: (e: any) => setError(e?.response?.data?.error || 'No se pudo crear el alumno'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) => studentsApi.update(id, payload),
    onSuccess: () => { invalidate(); closeModal(); },
    onError: (e: any) => setError(e?.response?.data?.error || 'No se pudo actualizar'),
  });

  const toggleActiveMutation = useMutation({
    mutationFn: (student: Student) =>
      studentsApi.update(student.id, { isActive: !student.user.isActive }),
    onSuccess: invalidate,
  });

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setError(null);
    setShowModal(true);
  };

  const openEdit = (student: Student) => {
    setEditing(student);
    setForm({
      email: student.user.email,
      password: '',
      firstName: student.firstName,
      lastName: student.lastName,
      enrollmentCode: student.enrollmentCode,
      grade: student.grade || '',
    });
    setError(null);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditing(null);
    setForm(EMPTY_FORM);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (editing) {
      updateMutation.mutate({
        id: editing.id,
        payload: { firstName: form.firstName, lastName: form.lastName, grade: form.grade || undefined },
      });
    } else {
      createMutation.mutate({
        email: form.email,
        password: form.password,
        firstName: form.firstName,
        lastName: form.lastName,
        enrollmentCode: form.enrollmentCode,
        grade: form.grade || undefined,
      });
    }
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight font-display m-0 flex items-center gap-2">
            <Users className="w-6 h-6 text-indigo-400" />
            Gestión de Alumnos
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Administra los alumnos del sistema. Datos sincronizados en tiempo real con PostgreSQL.
          </p>
        </div>
        <Button variant="primary" onClick={openCreate} className="py-2 px-4 text-xs font-semibold">
          <Plus className="w-4 h-4" />
          Nuevo Alumno
        </Button>
      </div>

      <Card className="space-y-4">
        <div className="overflow-x-auto">
          {students && students.length > 0 ? (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-450 font-semibold">
                  <th className="pb-3 pl-2">Alumno</th>
                  <th className="pb-3">Matrícula</th>
                  <th className="pb-3">Grado</th>
                  <th className="pb-3">Salones</th>
                  <th className="pb-3">Estado</th>
                  <th className="pb-3 pr-2 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850/60">
                {students.map((st) => (
                  <tr key={st.id} className="text-slate-350 hover:bg-slate-900/20">
                    <td className="py-3.5 pl-2">
                      <p className="font-semibold text-slate-200">{st.firstName} {st.lastName}</p>
                      <span className="text-[10px] text-slate-500">{st.user.email}</span>
                    </td>
                    <td className="font-mono text-slate-300">{st.enrollmentCode}</td>
                    <td>{st.grade || '—'}</td>
                    <td>{st.enrollments.length}</td>
                    <td>
                      <Badge variant={st.user.isActive ? 'success' : 'error'}>
                        {st.user.isActive ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </td>
                    <td className="pr-2 text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="secondary" onClick={() => openEdit(st)} className="py-1 px-2.5 text-xs inline-flex">
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant={st.user.isActive ? 'danger' : 'emerald'}
                          onClick={() => toggleActiveMutation.mutate(st)}
                          className="py-1 px-2.5 text-xs inline-flex"
                        >
                          <Power className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-xs text-slate-500 text-center py-8">No hay alumnos registrados.</p>
          )}
        </div>
      </Card>

      {showModal ? (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md p-6 glass-panel relative" glow="primary">
            <h3 className="text-base font-bold text-white font-display mb-4">
              {editing ? `Editar: ${editing.firstName} ${editing.lastName}` : 'Nuevo Alumno'}
            </h3>

            {error ? (
              <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs">
                {error}
              </div>
            ) : null}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 font-semibold mb-2">Nombre</label>
                  <input type="text" required value={form.firstName}
                    onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                    className="w-full p-2.5 rounded-xl glass-input text-sm" />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-2">Apellido</label>
                  <input type="text" required value={form.lastName}
                    onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                    className="w-full p-2.5 rounded-xl glass-input text-sm" />
                </div>
              </div>

              {!editing ? (
                <>
                  <div>
                    <label className="block text-slate-400 font-semibold mb-2">Correo</label>
                    <input type="email" required value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="w-full p-2.5 rounded-xl glass-input text-sm" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-400 font-semibold mb-2">Contraseña</label>
                      <input type="password" required minLength={8} value={form.password}
                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                        className="w-full p-2.5 rounded-xl glass-input text-sm" />
                    </div>
                    <div>
                      <label className="block text-slate-400 font-semibold mb-2">Matrícula</label>
                      <input type="text" required value={form.enrollmentCode}
                        onChange={(e) => setForm({ ...form, enrollmentCode: e.target.value })}
                        className="w-full p-2.5 rounded-xl glass-input text-sm font-mono" />
                    </div>
                  </div>
                </>
              ) : null}

              <div>
                <label className="block text-slate-400 font-semibold mb-2">Grado</label>
                <input type="text" placeholder="Ej. 10A" value={form.grade}
                  onChange={(e) => setForm({ ...form, grade: e.target.value })}
                  className="w-full p-2.5 rounded-xl glass-input text-sm" />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button variant="secondary" type="button" onClick={closeModal}>Cancelar</Button>
                <Button variant="primary" type="submit" isLoading={createMutation.isPending || updateMutation.isPending}>
                  {editing ? 'Guardar Cambios' : 'Crear Alumno'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      ) : null}
    </div>
  );
}
