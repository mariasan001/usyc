'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { RefreshCcw, Receipt as ReceiptIcon, QrCode, Eye } from 'lucide-react';

import Card from '@/shared/ui/Card/Card';
import Badge from '@/shared/ui/Badge/Badge';
import Button from '@/shared/ui/Button/Button';
import Table from '@/shared/ui/Table/Table';
import Modal from '@/shared/ui/Modal/Modal';

import { createReceiptService } from '@/modules/receipts/services/receipt.service';
import type { Receipt } from '@/modules/receipts/types/receipt.types';


import s from './DashboardPage.module.css';
import { encodeReceiptQr } from '@/qr/utils/qr.codec';

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function fmtMoney(n: number) {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
  }).format(n);
}

export default function DashboardPage() {
  const api = useMemo(() => createReceiptService(), []);
  const [items, setItems] = useState<Receipt[]>([]);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<Receipt | null>(null);

  const tdy = todayISO();

  const stats = useMemo(() => {
    const today = items.filter((r) => r.fechaPago === tdy);
    const todayValid = today.filter((r) => r.status === 'VALID');
    const cancelled = items.filter((r) => r.status === 'CANCELLED');

    const totalToday = todayValid.reduce((acc, r) => acc + (r.monto ?? 0), 0);

    const ym = tdy.slice(0, 7);
    const monthValid = items.filter(
      (r) => r.status === 'VALID' && r.fechaPago?.startsWith(ym)
    );
    const totalMonth = monthValid.reduce((acc, r) => acc + (r.monto ?? 0), 0);

    return {
      receiptsToday: today.length,
      totalToday,
      cancelledTotal: cancelled.length,
      totalMonth,
    };
  }, [items, tdy]);

  const latest = useMemo(() => items.slice(0, 8), [items]);

  async function load() {
    setLoading(true);
    try {
      const data = await api.list({ status: 'ALL' });
      setItems(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={s.wrap}>
      <div className={s.hero}>
        <div>
          <h2 className={s.h2}>Panel de Control</h2>
          <p className={s.p}>
            Resumen rápido del día y acceso a recibos y verificación QR.
          </p>
        </div>

        <div className={s.heroActions}>
          <Link className={s.linkBtn} href="/recibos">
            <ReceiptIcon size={16} /> Nuevo / Recibos
          </Link>

          <Link className={s.linkBtnSecondary} href="/verificar">
            <QrCode size={16} /> Verificar QR
          </Link>

          <Button
            variant="secondary"
            onClick={load}
            leftIcon={<RefreshCcw size={16} />}
            loading={loading}
          >
            Refrescar
          </Button>
        </div>
      </div>

      <div className={s.stats}>
        <div className={s.stat}>
          <div className={s.statLabel}>Recibos hoy</div>
          <div className={s.statValue}>{stats.receiptsToday}</div>
          <div className={s.statHint}>Fecha: {tdy}</div>
        </div>

        <div className={s.stat}>
          <div className={s.statLabel}>Total hoy (válidos)</div>
          <div className={s.statValue}>{fmtMoney(stats.totalToday)}</div>
          <div className={s.statHint}>Sin cancelados</div>
        </div>

        <div className={s.stat}>
          <div className={s.statLabel}>Cancelados (total)</div>
          <div className={s.statValue}>{stats.cancelledTotal}</div>
          <div className={s.statHint}>Con motivo registrado</div>
        </div>

        <div className={s.stat}>
          <div className={s.statLabel}>Total del mes (válidos)</div>
          <div className={s.statValue}>{fmtMoney(stats.totalMonth)}</div>
          <div className={s.statHint}>Mes actual</div>
        </div>
      </div>

      <Card
        title="Últimos recibos"
        subtitle="Los más recientes generados en el sistema"
        right={<Badge tone="info">Historial</Badge>}
      >
        <Table>
          <thead>
            <tr>
              <th>Folio</th>
              <th>Alumno</th>
              <th>Concepto</th>
              <th>Monto</th>
              <th>Fecha</th>
              <th>Estatus</th>
              <th style={{ textAlign: 'right' }}>Acción</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className={s.muted}>
                  Cargando…
                </td>
              </tr>
            ) : latest.length === 0 ? (
              <tr>
                <td colSpan={7} className={s.muted}>
                  Aún no hay recibos. Ve a <b>Recibos</b> y genera el primero 💳
                </td>
              </tr>
            ) : (
              latest.map((r) => (
                <tr key={r.folio}>
                  <td className={s.mono}>{r.folio}</td>
                  <td>{r.alumno.nombre}</td>
                  <td>{r.concepto}</td>
                  <td className={s.mono}>{fmtMoney(r.monto)}</td>
                  <td className={s.mono}>{r.fechaPago}</td>
                  <td>
                    {r.status === 'VALID' ? (
                      <Badge tone="ok">Válido</Badge>
                    ) : (
                      <Badge tone="warn">Cancelado</Badge>
                    )}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      className={s.iconBtn}
                      onClick={() => setView(r)}
                      title="Ver"
                    >
                      <Eye size={16} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </Card>

      <Modal open={Boolean(view)} onClose={() => setView(null)} title="Detalle del recibo">
        {view ? (
          <div className={s.detail}>
            <div>
              <span>Folio</span>
              <b className={s.mono}>{view.folio}</b>
            </div>
            <div>
              <span>Alumno</span>
              <b>{view.alumno.nombre}</b>
            </div>
            <div>
              <span>Matrícula</span>
              <b>{view.alumno.matricula ?? '—'}</b>
            </div>
            <div>
              <span>Concepto</span>
              <b>{view.concepto}</b>
            </div>
            <div>
              <span>Monto</span>
              <b>{fmtMoney(view.monto)}</b>
            </div>
            <div>
              <span>Fecha</span>
              <b className={s.mono}>{view.fechaPago}</b>
            </div>

            <div className={s.full}>
              <span>Monto en letras</span>
              <b>{view.montoLetras}</b>
            </div>

            <div className={s.full}>
              <span>Contenido QR</span>
              <b className={s.mono}>{encodeReceiptQr(view.folio)}</b>
            </div>

            {view.status === 'CANCELLED' ? (
              <div className={s.full}>
                <span>Motivo</span>
                <b>{view.cancelReason ?? '—'}</b>
              </div>
            ) : null}
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
