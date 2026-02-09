import ProjectForm from "../ProjectForm";

export default function NewProjectPage() {
  return (
    <div className="container mx-auto max-w-5xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Crear Nuevo Proyecto</h1>
        <p className="text-muted-foreground">Completa los detalles para añadir un nuevo trabajo a tu portafolio.</p>
      </div>
      
      {/* Renderizamos el formulario en modo CREAR (sin datos iniciales) */}
      <ProjectForm />
    </div>
  );
}