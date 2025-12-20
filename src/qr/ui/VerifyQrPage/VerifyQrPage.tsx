'use client';

import { useState } from 'react';
import { ShieldCheck, ShieldX, ShieldAlert, Search } from 'lucide-react';

import Card from '@/shared/ui/Card/Card';
import Button from '@/shared/ui/Button/Button';
import Badge from '@/shared/ui/Badge/Badge';

import QrScanner from '@/qr/ui/QrScanner/QrScanner';

import s from './VerifyQrPage.module.css';
import { useQrVerify } from '@/qr/hooks/seQrVerify';

function toneFromEstado(e?: string) {
  if (e === 'VALIDO') return 'ok';
  if (e === 'CANCELADO') return 'warn';
  if (e === 'ALTERADO') return 'danger';
  return 'info';
}

function iconFromEstado(e?: string) {
  if (e === 'VALIDO') return <ShieldCheck size={16} />;
  if (e === 'CANCELADO') return <ShieldAlert size={16} />;
  if (e === 'ALTERADO') return <ShieldX size={16} />;
  return <Search size={16} />;
}

function extractQrPayload(text: string) {
  const t = (text ?? '').trim();
  if (!t) return '';

  if (t.startsWith('http')) {
    try {
      const u = new URL(t);
      const qp = u.searchParams.get('qrPayload');
      if (qp) return qp;
    } catch {
      // noop
    }
  }

  return t;
}

export default function VerifyQrPage() {
  const v = useQrVerify();
  const [qrPayload, setQrPayload] = useState('');

  async function onVerify() {
    await v.verify(qrPayload);
  }

  const estado = v.data?.estado;

  return (
    <div className={s.page}>
      <Card
        title="Verificar comprobante"
        subtitle="Escanea el QR o pega el código de validación (qrPayload)."
        right={
          estado ? (
            <Badge tone={toneFromEstado(estado)}>
              <span className={s.badgeRow}>
                {iconFromEstado(estado)} {estado}
              </span>
            </Badge>
          ) : null
        }
      >
        <div className={s.block}>
          <QrScanner
            onText={(text) => {
              const qp = extractQrPayload(text);
              setQrPayload(qp);
              v.verify(qp); // auto-verify
            }}
          />
        </div>

        {v.error ? <div className={s.error}>{v.error}</div> : null}

        <div className={s.formRow}>
          <div className={s.field}>
            <label className={s.label}>qrPayload</label>
            <textarea
              className={s.textarea}
              value={qrPayload}
              onChange={(e) => setQrPayload(e.target.value)}
              placeholder="Pega aquí el contenido del QR…"
              rows={4}
            />
            <div className={s.helper}>
              Se obtiene al crear el recibo (campo <b>qrPayload</b>). También puede venir dentro de una URL.
            </div>
          </div>

          <div className={s.actions}>
            <Button
              variant="secondary"
              onClick={() => setQrPayload('')}
            >
              Limpiar
            </Button>

            <Button onClick={onVerify} disabled={v.loading}>
              {v.loading ? 'Verificando…' : 'Verificar'}
            </Button>
          </div>
        </div>

        {v.data ? (
          <div className={s.result}>
            <div className={s.resultHeader}>
              <div className={s.resultTitle}>Resultado</div>
              {estado ? (
                <div className={s.resultChip}>
                  {iconFromEstado(estado)}
                  <span>{estado}</span>
                </div>
              ) : null}
            </div>

            <div className={s.msg}>{v.data.mensaje}</div>

            {v.data.recibo ? (
              <>
                <div className={s.summary}>
                  <div className={s.summaryMain}>
                    <div className={s.folio}>
                      Folio <b>{v.data.recibo.folio}</b>
                    </div>
                    <div className={s.alumno}>
                      {v.data.recibo.alumnoNombre}
                      <span className={s.muted}>• {v.data.recibo.alumnoId}</span>
                    </div>
                  </div>

                  <div className={s.summaryRight}>
                    <div className={s.money}>
                      {v.data.recibo.monto} {v.data.recibo.moneda}
                    </div>
                    <div className={s.mutedSmall}>{v.data.recibo.concepto}</div>
                  </div>
                </div>

                <div className={s.grid}>
                  <div className={s.kv}>
                    <div className={s.k}>ReciboId</div>
                    <div className={s.v}>{v.data.recibo.reciboId}</div>
                  </div>

                  <div className={s.kv}>
                    <div className={s.k}>Estatus</div>
                    <div className={s.v}>{v.data.recibo.estatusNombre}</div>
                  </div>

                  <div className={s.kv}>
                    <div className={s.k}>Tipo de pago</div>
                    <div className={s.v}>{v.data.recibo.tipoPagoNombre}</div>
                  </div>

                  <div className={s.kv}>
                    <div className={s.k}>Fecha pago</div>
                    <div className={s.v}>{v.data.recibo.fechaPago}</div>
                  </div>

                  <div className={`${s.kv} ${s.full}`}>
                    <div className={s.k}>qrPayload</div>
                    <div className={`${s.v} ${s.mono}`}>{v.data.recibo.qrPayload}</div>
                  </div>
                </div>
              </>
            ) : (
              <div className={s.empty}>No hay recibo asociado.</div>
            )}
          </div>
        ) : null}
      </Card>
    </div>
  );
}
