'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Camera, CameraOff } from 'lucide-react';
import s from './QrScanner.module.css';

type ScanStatus = 'idle' | 'scanning' | 'stopped' | 'error';

export default function QrScanner({ onText }: { onText: (text: string) => void }) {
  const videoSharpRef = useRef<HTMLVideoElement | null>(null); // este lo usa ZXing
  const videoBlurRef = useRef<HTMLVideoElement | null>(null);  // este solo es UI

  const readerRef = useRef<any>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [active, setActive] = useState(false);
  const [status, setStatus] = useState<ScanStatus>('idle');
  const [err, setErr] = useState<string>('');

  const statusLabel = useMemo(() => {
    if (status === 'scanning') return 'Escaneando…';
    if (status === 'stopped') return 'Detenido';
    if (status === 'error') return 'Error';
    return 'Listo';
  }, [status]);

  async function hardStopCamera() {
    // 1) para ZXing
    try {
      await readerRef.current?.stopAsync?.();
    } catch {
      // no-op
    }

    // 2) apaga tracks del stream (esto es lo que realmente “apaga” la cámara)
    try {
      const s = streamRef.current;
      if (s) s.getTracks().forEach((t) => t.stop());
    } catch {
      // no-op
    }
    streamRef.current = null;

    // 3) limpia srcObject para que el navegador deje de renderizar la imagen
    if (videoSharpRef.current) videoSharpRef.current.srcObject = null;
    if (videoBlurRef.current) videoBlurRef.current.srcObject = null;

    setActive(false);
    setStatus('stopped');
  }

  useEffect(() => {
    if (!active) return;

    let alive = true;

    (async () => {
      setErr('');
      setStatus('scanning');

      try {
        const mod = await import('@zxing/browser');
        const { BrowserQRCodeReader } = mod as any;

        const reader = new BrowserQRCodeReader();
        readerRef.current = reader;

        const videoSharp = videoSharpRef.current;
        if (!videoSharp) return;

        const devices = await BrowserQRCodeReader.listVideoInputDevices();
        const preferred =
          devices.find((d: any) => /back|rear|environment/i.test(d.label))?.deviceId ??
          devices[0]?.deviceId;

        // ZXing abre el stream y lo pega a videoSharp
        await reader.decodeFromVideoDevice(preferred, videoSharp, (result: any) => {
          if (!alive) return;
          const text = result?.getText?.();
          if (text) {
            onText(text);
            hardStopCamera(); // detener al primer match
          }
        });

        // 💡 después de iniciar, clona el mismo stream al video blur (para efecto “enfocar solo el QR”)
        const stream = videoSharp.srcObject as MediaStream | null;
        streamRef.current = stream;

        if (videoBlurRef.current && stream) {
          videoBlurRef.current.srcObject = stream;
          // algunos navegadores requieren play explícito
          videoBlurRef.current.play?.().catch?.(() => {});
        }
      } catch (e: any) {
        const name = String(e?.name ?? '');
        const msg = String(e?.message ?? '');

        setStatus('error');

        if (name === 'NotAllowedError') setErr('Permiso de cámara denegado.');
        else if (name === 'NotFoundError') setErr('No se encontró una cámara disponible.');
        else if (msg.includes("Cannot find module '@zxing/browser'"))
          setErr('Scanner no disponible: instala @zxing/browser.');
        else setErr(msg || 'No se pudo iniciar el escáner.');

        // si falló, igual apaga todo lo que haya quedado medio vivo
        await hardStopCamera();
      }
    })();

    return () => {
      alive = false;
      hardStopCamera(); // al desmontar / cambiar de ruta
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  return (
    <div className={s.card}>
      <div className={s.top}>
        <div className={s.left}>
          <div className={s.title}>Escanear QR</div>
          <div className={s.sub}>Usa la cámara o pega el qrPayload manualmente.</div>
        </div>

        <div className={s.right}>
          <span
            className={`${s.chip} ${
              status === 'scanning'
                ? s.chipScan
                : status === 'error'
                ? s.chipErr
                : status === 'stopped'
                ? s.chipStop
                : s.chipIdle
            }`}
          >
            {statusLabel}
          </span>

          <button
            className={`${s.btn} ${active ? s.btnOff : s.btnOn}`}
            type="button"
            onClick={() => (active ? hardStopCamera() : setActive(true))}
          >
            {active ? (
              <>
                <CameraOff size={16} /> Desactivar cámara
              </>
            ) : (
              <>
                <Camera size={16} /> Activar cámara
              </>
            )}
          </button>
        </div>
      </div>

      {err ? <div className={s.err}>{err}</div> : null}

      <div className={s.preview}>
        {/* VIDEO BLUR (fondo) */}
        <video ref={videoBlurRef} className={s.videoBlur} muted playsInline />

        {/* VIDEO NÍTIDO RECORTADO (solo dentro del frame) */}
        <video ref={videoSharpRef} className={s.videoSharp} muted playsInline />

        {/* overlay con marco */}
        <div className={s.overlay} aria-hidden="true">
          <div className={s.frame} />
        </div>
      </div>

      <div className={s.hint}>Tip: acerca un poco el QR y evita reflejos.</div>
    </div>
  );
}
