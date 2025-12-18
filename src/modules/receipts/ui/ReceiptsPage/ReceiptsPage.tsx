'use client';

import { useMemo } from 'react';

import Card from '@/shared/ui/Card/Card';
import Badge from '@/shared/ui/Badge/Badge';

import ReceiptForm from '../ReceiptForm/ReceiptForm';
import ReceiptsTable from '../ReceiptsTable/ReceiptsTable';
import { useReceipts } from '../../hooks/useReceipts';

import s from './ReceiptsPage.module.css';

// ✅ mismo normalizador que usas en tabla: evita duplicados por acentos/espacios
function normalizeKey(str: string) {
  return (str ?? '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ');
}

export default function ReceiptsPage() {
  const vm = useReceipts();

  // ✅ total alumnos únicos (matrícula si existe, si no por nombre normalizado)
  const totalAlumnos = useMemo(() => {
    const set = new Set<string>();

    for (const r of vm.items ?? []) {
      const matricula = (r.alumno?.matricula ?? '').trim();
      const nombre = (r.alumno?.nombre ?? '').trim();
      const key = matricula ? `m:${matricula}` : `n:${normalizeKey(nombre)}`;
      set.add(key);
    }
    return set.size;
  }, [vm.items]);

  return (
    <div className={s.grid}>
      <Card
        title="Registrar alumno y pago"
        subtitle="Captura datos del alumno"
        right={<Badge tone="info">Registro</Badge>}
        className={s.left}
      >
        {/* ✅ body “encerrado” para que el card no crezca infinito */}
        <div className={s.leftBody}>
          <ReceiptForm onCreate={vm.createReceipt} creating={vm.creating} />
        </div>
      </Card>

      <Card
        title="Alumnos"
        subtitle="Directorio general • ver historial y proyección por alumno"
        right={
          <Badge tone="info">
            {totalAlumnos} alumno{totalAlumnos === 1 ? '' : 's Totales'}
          </Badge>
        }
        className={s.right}
      >
        {/* ✅ rightBody = flex container con altura real */}
        <div className={s.rightBody}>
          {/* ✅ rightScroll = “host” que define altura disponible (sin scroll aquí) */}
          <div className={s.rightScroll}>
            <ReceiptsTable
              items={vm.items}
              loading={vm.loading}
              error={vm.error}
              query={vm.query}
              setQuery={vm.setQuery}
              onRefresh={vm.refresh}
            />
          </div>
        </div>
      </Card>
    </div>
  );
}
