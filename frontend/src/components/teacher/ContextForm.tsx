import { useState } from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { TeacherContextInput } from '../../types/teacherWorkflow.types';
import { Sparkles } from 'lucide-react';

interface ContextFormProps {
  onSubmit: (input: TeacherContextInput) => void;
  isSubmitting: boolean;
}

export default function ContextForm({ onSubmit, isSubmitting }: ContextFormProps) {
  const [profesor, setProfesor] = useState('');
  const [asignatura, setAsignatura] = useState('');
  const [curso, setCurso] = useState('');
  const [contexto, setContexto] = useState('');
  const [objetivosText, setObjetivosText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const objetivos = objetivosText
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);

    onSubmit({ profesor, asignatura, curso, contexto, objetivos });
  };

  const presets = [
    {
      label: '📐 Cálculo Multivariable',
      profesor: 'Prof. Carlos Ortega',
      asignatura: 'Cálculo Multivariable',
      curso: 'MAT-201',
      contexto: 'Los estudiantes tienen dificultades visualizando superficies 3D y comprendiendo teoremas de integración compleja. El ritmo de aprendizaje actual es moderado.',
      objetivos: 'Reforzar coordenadas cilíndricas y esféricas\nComprender el teorema de Green en el plano'
    },
    {
      label: '🧠 Inteligencia Artificial',
      profesor: 'Prof. Elena Rostova',
      asignatura: 'Inteligencia Artificial',
      curso: 'INF-305',
      contexto: 'El grupo domina los fundamentos algebraicos pero requiere refuerzo práctico en ajuste de hiperparámetros en redes neuronales densas y optimización de descenso de gradiente.',
      objetivos: 'Implementar regularización Dropout y L2\nVisualizar fronteras de decisión multicapa'
    }
  ];

  const handleApplyPreset = (preset: typeof presets[0]) => {
    setProfesor(preset.profesor);
    setAsignatura(preset.asignatura);
    setCurso(preset.curso);
    setContexto(preset.contexto);
    setObjetivosText(preset.objetivos);
  };

  return (
    <Card className="space-y-4" glow="primary">
      <h3 className="text-base font-bold text-slate-100 font-display flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-indigo-400" />
        Entrada de Contexto para el Agente
      </h3>
      <p className="text-xs text-slate-500">
        Describa el contexto del curso para que el agente genere el plan de trabajo y el abanico de temas.
      </p>

      {/* Presets */}
      <div className="flex flex-wrap items-center gap-2 pt-1 pb-2">
        <span className="text-[11px] text-slate-500 font-semibold">Cargar ejemplo:</span>
        {presets.map((preset, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleApplyPreset(preset)}
            className="text-[11px] px-3 py-1.5 rounded-lg bg-indigo-600/10 border border-indigo-500/20 text-indigo-300 hover:bg-indigo-600/20 transition-all duration-200 cursor-pointer"
          >
            {preset.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-slate-400 font-semibold mb-2">Profesor</label>
            <input
              type="text"
              required
              value={profesor}
              onChange={(e) => setProfesor(e.target.value)}
              placeholder="Ej. Prof. Elena Rostova"
              className="w-full p-2.5 rounded-xl glass-input text-sm"
            />
          </div>
          <div>
            <label className="block text-slate-400 font-semibold mb-2">Asignatura</label>
            <input
              type="text"
              required
              value={asignatura}
              onChange={(e) => setAsignatura(e.target.value)}
              placeholder="Ej. Inteligencia Artificial"
              className="w-full p-2.5 rounded-xl glass-input text-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-slate-400 font-semibold mb-2">Curso</label>
          <input
            type="text"
            required
            value={curso}
            onChange={(e) => setCurso(e.target.value)}
            placeholder="Ej. INF-305, Grupo 2"
            className="w-full p-2.5 rounded-xl glass-input text-sm"
          />
        </div>

        <div>
          <label className="block text-slate-400 font-semibold mb-2">Contexto / Retroalimentación</label>
          <textarea
            rows={4}
            required
            value={contexto}
            onChange={(e) => setContexto(e.target.value)}
            placeholder="Describa el estado actual del curso, dificultades observadas, ritmo de avance, etc."
            className="w-full p-2.5 rounded-xl glass-input text-sm"
          />
        </div>

        <div>
          <label className="block text-slate-400 font-semibold mb-2">Objetivos (uno por línea)</label>
          <textarea
            rows={3}
            required
            value={objetivosText}
            onChange={(e) => setObjetivosText(e.target.value)}
            placeholder={'Reforzar conceptos de regresión\nMejorar participación en clase'}
            className="w-full p-2.5 rounded-xl glass-input text-sm"
          />
        </div>

        <div className="flex justify-end pt-2">
          <Button variant="primary" type="submit" isLoading={isSubmitting}>
            Generar Plan con el Agente
          </Button>
        </div>
      </form>
    </Card>
  );
}
