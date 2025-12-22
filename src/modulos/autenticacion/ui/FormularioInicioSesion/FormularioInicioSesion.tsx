'use client';

import { useMemo, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';

import { AlertTriangle, Lock, Eye, EyeOff, User, LogIn, Loader2 } from 'lucide-react';

import s from './FormularioInicioSesion.module.css';

import { AutenticacionServicio } from '../../servicios/autenticacion.servicio';
import type { CredencialesInicioSesion } from '../../tipos/autenticacion.tipos';
import { guardarSesion } from '../../utils/sesion.utils';

// ✅ Helper seguro: convierte unknown -> string sin usar any
function obtenerMensajeError(err: unknown): string {
  if (err instanceof Error) return err.message;

  // Por si algún servicio lanza { message: "..." }
  if (typeof err === 'object' && err !== null) {
    const maybe = err as { message?: unknown };
    if (typeof maybe.message === 'string') return maybe.message;
  }

  if (typeof err === 'string') return err;

  return 'Ocurrió un error al iniciar sesión';
}

export default function FormularioInicioSesion() {
  const router = useRouter();

  const [form, setForm] = useState<CredencialesInicioSesion>({
    usuario: '',
    contrasena: '',
  });

  const [verContrasena, setVerContrasena] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deshabilitado = useMemo(() => {
    return cargando || !form.usuario.trim() || !form.contrasena.trim();
  }, [cargando, form.usuario, form.contrasena]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setCargando(true);

    try {
      const res = await AutenticacionServicio.iniciarSesion(form);

      // ✅ CLAVE: guarda sesión para que el sidebar lea rol y filtre menú
      guardarSesion(res);

      // ✅ redirect por rol (el servicio ya te regresa destino)
      router.push(res.destino);
    } catch (err: unknown) {
      setError(obtenerMensajeError(err));
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className={s.wrap}>
      <div className={s.shell}>
        <div className={s.card}>
          <header className={s.header}>
            <div className={s.brand}>
              <div className={s.logo} aria-hidden />
              <div className={s.brandText}>
                <h1 className={s.title}>Iniciar sesión</h1>
                <p className={s.subtitle}>Control escolar</p>
              </div>
            </div>

            <div className={s.badges}>
              <span className={s.badge}>USYC</span>
              <span className={s.badgeSoft}>Acceso interno</span>
            </div>
          </header>

          {error ? (
            <div className={s.alerta} role="alert">
              <AlertTriangle size={16} />
              <div>
                <div className={s.alertaTitle}>No se pudo iniciar sesión</div>
                <div className={s.alertaText}>{error}</div>
              </div>
            </div>
          ) : null}

          <form className={s.form} onSubmit={onSubmit}>
            <label className={s.label}>
              Usuario
              <div className={s.field}>
                <span className={s.iconLeft} aria-hidden>
                  <User size={18} />
                </span>

                <input
                  className={s.input}
                  value={form.usuario}
                  onChange={(e) => setForm((p) => ({ ...p, usuario: e.target.value }))}
                  placeholder="Ej: admin o caja"
                  autoComplete="username"
                />
              </div>
            </label>

            <label className={s.label}>
              Contraseña
              <div className={s.field}>
                <span className={s.iconLeft} aria-hidden>
                  <Lock size={18} />
                </span>

                <input
                  className={s.input}
                  type={verContrasena ? 'text' : 'password'}
                  value={form.contrasena}
                  onChange={(e) => setForm((p) => ({ ...p, contrasena: e.target.value }))}
                  placeholder="••••••••"
                  autoComplete="current-password"
                />

                <button
                  type="button"
                  className={s.iconBtn}
                  onClick={() => setVerContrasena((v) => !v)}
                  aria-label={verContrasena ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  title={verContrasena ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {verContrasena ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </label>

            <button className={s.boton} disabled={deshabilitado}>
              {cargando ? (
                <>
                  <Loader2 className={s.spin} size={18} />
                  Validando acceso…
                </>
              ) : (
                <>
                  <LogIn size={18} />
                  Entrar
                </>
              )}
            </button>

            <div className={s.hint}>
              <span className={s.dot} />
           
            </div>
          </form>
        </div>

        <footer className={s.footer}>
          <div className={s.footerLine}>
            © {new Date().getFullYear()} USYC · Todos los derechos reservados.
          </div>

          <div className={s.footerLine}>
            Desarrollado por <span className={s.sintropia}>Sintropía</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
