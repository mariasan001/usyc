import FormularioInicioSesion from '@/modulos/autenticacion/ui/FormularioInicioSesion/FormularioInicioSesion';
import s from './IniciarSesionPage.module.css';

export default function IniciarSesionPage() {
  return (
    <main className={s.page}>
      <FormularioInicioSesion />
      
    </main>
  );
}
