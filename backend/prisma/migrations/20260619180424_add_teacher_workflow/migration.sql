-- CreateEnum
CREATE TYPE "TopicDifficulty" AS ENUM ('BASICO', 'INTERMEDIO', 'AVANZADO');

-- CreateEnum
CREATE TYPE "TopicStatus" AS ENUM ('SUGERIDO', 'SELECCIONADO', 'DESCARTADO');

-- CreateTable
CREATE TABLE "TeacherWorkflow" (
    "id" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "profesor" TEXT NOT NULL,
    "asignatura" TEXT NOT NULL,
    "curso" TEXT NOT NULL,
    "contexto" TEXT NOT NULL,
    "objetivos" TEXT[],
    "planResumen" TEXT NOT NULL,
    "planDuracionSemanas" INTEGER NOT NULL,
    "planEtapas" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TeacherWorkflow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeacherWorkflowTopic" (
    "id" TEXT NOT NULL,
    "workflowId" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "dificultad" "TopicDifficulty" NOT NULL,
    "estado" "TopicStatus" NOT NULL DEFAULT 'SUGERIDO',

    CONSTRAINT "TeacherWorkflowTopic_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TeacherWorkflow_teacherId_idx" ON "TeacherWorkflow"("teacherId");

-- CreateIndex
CREATE INDEX "TeacherWorkflowTopic_workflowId_idx" ON "TeacherWorkflowTopic"("workflowId");

-- AddForeignKey
ALTER TABLE "TeacherWorkflowTopic" ADD CONSTRAINT "TeacherWorkflowTopic_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "TeacherWorkflow"("id") ON DELETE CASCADE ON UPDATE CASCADE;
