'use client';

import s from './home.page.module.css';
import AppShell from '@/layout/AppShell/AppShell';

export default function HomePage() {
  return (
    <AppShell>
      <div className={s.page}>
        <section className={s.card}>
          <div className={s.top}>
            <div className={s.brand}>
              <div className={s.kicker}>Plataforma administrativa</div>
              <h1 className={s.title}>Sistema de Control Escolar</h1>
              <p className={s.subtitle}>
                Gestión de alumnos, pagos, proyección y emisión de comprobantes.
                Interfaz institucional, clara y ordenada para operación diaria.
              </p>
            </div>

            <div className={s.statusBox} aria-label="Estatus del sistema">
              <div className={s.statusTitle}>Estatus</div>

              <div className={s.statusRow}>
                <span className={s.dot} />
                <span className={s.statusText}>Operando con normalidad</span>
              </div>

              <div className={s.meta}>
                <div className={s.metaItem}>
                  <span className={s.metaLabel}>Versión</span>
                  <span className={s.metaValue}>v0.1</span>
                </div>
                <div className={s.metaItem}>
                  <span className={s.metaLabel}>Ambiente</span>
                  <span className={s.metaValue}>Operación</span>
                </div>
              </div>
            </div>
          </div>

          <div className={s.divider} />

          <div className={s.actions}>
            <a className={s.primaryBtn} href="/alumnos">
              Ir a Alumnos
            </a>
            <a className={s.secondaryBtn} href="/configuraciones">
              Ver catálogos
            </a>
          </div>

          <div className={s.note}>
            Nota: La emisión de comprobantes se genera en el front; el QR se obtiene
            desde API.
          </div>
        </section>

        {/* ✅ Opcional: si quieres “módulos” sin que parezca dashboard */}
        <section className={s.modules} aria-label="Módulos principales">
          <a className={s.module} href="/alumnos">
            <div className={s.moduleTitle}>Alumnos</div>
            <div className={s.moduleDesc}>Registro, búsqueda y expediente.</div>
          </a>

          <a className={s.module} href="/alumnos?tab=proyeccion">
            <div className={s.moduleTitle}>Proyección</div>
            <div className={s.moduleDesc}>Calendario y reporte PDF.</div>
          </a>

          <a className={s.module} href="/alumnos?tab=pagos">
            <div className={s.moduleTitle}>Pagos</div>
            <div className={s.moduleDesc}>Historial y comprobantes.</div>
          </a>

          <a className={s.module} href="/configuraciones">
            <div className={s.moduleTitle}>Catálogos</div>
            <div className={s.moduleDesc}>Escolaridad, carrera, plantel.</div>
          </a>
        </section>
      </div>
    </AppShell>
  );
}
