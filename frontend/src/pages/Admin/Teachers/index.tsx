import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { teachersApi, Teacher, CreateTeacherPayload } from '../../../api/teachers.api';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import LoadingSpinner from '../../../components/ui/LoadingSpinner';
import { GraduationCap, Plus, Pencil, Power } from 'lucide-react';

interface FormState {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  department: string;
}

const EMPTY_FORM: FormState = { email: '', password: '', firstName: '', lastName: '', department: '' };

export default function AdminTeachers() {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Teacher | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [error, setError] = useState<string | null>(null);

  const { data: teachers, isLoading } = useQuery({
    queryKey: ['admin-teachers'],
    queryFn: () => teachersApi.list(),
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['admin-teachers'] });

  const createMutation = useMutation({
    mutationFn: (payload: CreateTeacherPayload) => teachersApi.create(payload),
    onSuccess: () => { invalidate(); closeModal(); },
    onError: (e: any) => setError(e?.response?.data?.error || 'No se pudo crear el profesor'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) => teachersApi.update(id, payload),
    onSuccess: () => { invalidate(); closeModal(); },
    onError: (e: any) => setError(e?.response?.data?.error || 'No se pudo actualizar'),
  });

  const toggleActiveMutation = useMutation({
    mutationFn: (teacher: Teacher) => teachersApi.update(teacher.id, { isActive: !teacher.user.isActive }),
    onSuccess: invalidate,
    onError: (e: any) => alert(e?.response?.data?.error || 'No se pudo cambiar el estado'),
  });

  const openCreate = () => { setEditing(null); setForm(EMPTY_FORM); setError(null); setShowModal(true); };

  const openEdit = (teacher: Teacher) => {
    setEditing(teacher);
    setForm({
      email: teacher.user.email,
      password: '',
      firstName: teacher.firstName,
      lastName: teacher.lastName,
      department: teacher.department || '',
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
        payload: { firstName: form.firstName, lastName: form.lastName, department: form.department || undefined },
      });
    } else {
      createMutation.mutate({
        email: form.email,
        password: form.password,
        firstName: form.firstName,
        lastName: form.lastName,
        department: form.department || undefined,
      });
    }
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight font-display m-0 flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-indigo-400" />
            Gestión de Profesores
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Administra el cuerpo docente y sus salones asignados.
          </p>
        </div>
        <Button variant="primary" onClick={openCreate} className="py-2 px-4 text-xs font-semibold">
          <Plus className="w-4 h-4" />
          Nuevo Profesor
        </Button>
      </div>

      <Card className="space-y-4">
        <div className="overflow-x-auto">
          {teachers && teachers.length > 0 ? (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-450 font-semibold">
                  <th className="pb-3 pl-2">Profesor</th>
                  <th className="pb-3">Departamento</th>
                  <th className="pb-3">Salones</th>
                  <th className="pb-3">Estado</th>
                  <th className="pb-3 pr-2 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850/60">
                {teachers.map((tc) => (
                  <tr key={tc.id} className="text-slate-350 hover:bg-slate-900/20">
                    <td className="py-3.5 pl-2">
                      <p className="font-semibold text-slate-200">{tc.firstName} {tc.lastName}</p>
                      <span className="text-[10px] text-slate-500">{tc.user.email}</span>
                    </td>
                    <td>{tc.department || '—'}</td>
                    <td>{tc.courses.length}</td>
                    <td>
                      <Badge variant={tc.user.isActive ? 'success' : 'error'}>
                        {tc.user.isActive ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </td>
                    <td className="pr-2 text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="secondary" onClick={() => openEdit(tc)} className="py-1 px-2.5 text-xs inline-flex">
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant={tc.user.isActive ? 'danger' : 'emerald'}
                          onClick={() => toggleActiveMutation.mutate(tc)}
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
            <p className="text-xs text-slate-500 text-center py-8">No hay profesores registrados.</p>
          )}
        </div>
      </Card>

      {showModal ? (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md p-6 glass-panel relative" glow="primary">
            <h3 className="text-base font-bold text-white font-display mb-4">
              {editing ? `Editar: ${editing.firstName} ${editing.lastName}` : 'Nuevo Profesor'}
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
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-400 font-semibold mb-2">Correo</label>
                    <input type="email" required value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="w-full p-2.5 rounded-xl glass-input text-sm" />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-semibold mb-2">Contraseña</label>
                    <input type="password" required minLength={8} value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      className="w-full p-2.5 rounded-xl glass-input text-sm" />
                  </div>
                </div>
              ) : null}

              <div>
                <label className="block text-slate-400 font-semibold mb-2">Departamento</label>
                <input type="text" placeholder="Ej. Matemáticas" value={form.department}
                  onChange={(e) => setForm({ ...form, department: e.target.value })}
                  className="w-full p-2.5 rounded-xl glass-input text-sm" />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button variant="secondary" type="button" onClick={closeModal}>Cancelar</Button>
                <Button variant="primary" type="submit" isLoading={createMutation.isPending || updateMutation.isPending}>
                  {editing ? 'Guardar Cambios' : 'Crear Profesor'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      ) : null}
    </div>
  );
}
