// src/modulos/configuraciones/ui/catalogo-modal/hooks/useCatalogoModal.ts
'use client';

import { useEffect, useMemo, useState } from 'react';

import type { CatalogoModalProps, FlagsCatalogoModal, FormState } from '../types/catalogoModal.types';

import { getTituloCatalogoModal } from '../utils/catalogoModal.titulo';
import { getFormularioInicial } from '../utils/catalogoModal.formulario';
import { buildPayloadCatalogo } from '../utils/catalogoModal.payload';
import { CarrerasService } from '@/modulos/configuraciones/services/carreras.service';
import { nextCarreraId } from '../utils/carreras.nextId';

/**
 * Hook central del modal:
 * - Prepara título, form, banderas UI y submit.
 * - La UI solo consume lo que sale de aquí.
 */
export function useCatalogoModal(props: CatalogoModalProps) {
  const {
    catalog,
    mode,
    initialValue,
    isSaving,
    onSave,
    escolaridadesOptions = [],
  } = props;

  const titulo = useMemo(() => getTituloCatalogoModal(catalog, mode), [catalog, mode]);

  const escolaridadesOrdenadas = useMemo(() => {
    return [...escolaridadesOptions].sort((a, b) =>
      (a.nombre ?? '').localeCompare(b.nombre ?? ''),
    );
  }, [escolaridadesOptions]);

  const flags: FlagsCatalogoModal = useMemo(() => {
    const isTiposPago = catalog === 'tiposPago';
    const isPlanteles = catalog === 'planteles';
    const isEstatusRecibo = catalog === 'estatusRecibo';

    const nameKey = isTiposPago || isPlanteles ? 'name' : 'nombre';
    const activeKey = isTiposPago || isPlanteles ? 'active' : 'activo';

    const showActivo = catalog !== 'escolaridades' && !isEstatusRecibo;

    const showCarreraId = catalog === 'carreras' && mode === 'create';
    const showEscolaridadSelect = catalog === 'carreras';

    const showConceptoCodigo = catalog === 'conceptosPago' && mode === 'create';
    const showConceptoDescripcion = catalog === 'conceptosPago';
    const showConceptoTipoMonto = catalog === 'conceptosPago';

    const showTipoPagoCode = catalog === 'tiposPago' && mode === 'create';

    const showPlantelCode = catalog === 'planteles' && mode === 'create';
    const showPlantelAddress = catalog === 'planteles';

    const showCodigo =
      (catalog === 'escolaridades' && mode === 'create') ||
      (catalog === 'estatusRecibo' && mode === 'create') ||
      showConceptoCodigo ||
      showTipoPagoCode ||
      showPlantelCode;

    const placeholderCodigo =
      catalog === 'conceptosPago'
        ? 'INSCRIPCION, MENSUALIDAD...'
        : catalog === 'estatusRecibo'
          ? 'EMITIDO, PAGADO...'
          : catalog === 'tiposPago'
            ? 'EFECTIVO, TARJETA...'
            : catalog === 'planteles'
              ? 'PL01, PL02...'
              : 'SEC, LIC...';

    return {
      isTiposPago,
      isPlanteles,
      isEstatusRecibo,
      nameKey,
      activeKey,
      showActivo,
      showCarreraId,
      showEscolaridadSelect,
      showConceptoCodigo,
      showConceptoDescripcion,
      showConceptoTipoMonto,
      showTipoPagoCode,
      showPlantelCode,
      showPlantelAddress,
      showCodigo,
      placeholderCodigo,
    };
  }, [catalog, mode]);

  const [form, setForm] = useState<FormState>(() =>
    getFormularioInicial({
      catalog,
      mode,
      initialValue,
      escolaridadesOrdenadas,
    }),
  );

  /**
   * Actualiza un campo del form.
   * Mantiene el form genérico pero controlado.
   */
  function setCampo(key: string, value: unknown) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  /**
   * Maneja el submit del formulario.
   * - Evita doble submit si isSaving
   * - Construye payload según catálogo y modo
   * - Ejecuta onSave(payload)
   */
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (isSaving) return;

    const payload = buildPayloadCatalogo({ catalog, mode, form });
    await onSave(payload);
  }

  useEffect(() => {
  let alive = true;

  async function ensureCarreraId() {
    if (catalog !== 'carreras') return;
    if (props.mode !== 'create') return;

    // si ya tiene, no lo pises
    if (String(form.carreraId ?? '').trim()) return;

    // importante: traer también inactivos para no reciclar IDs
    const all = await CarrerasService.list({ soloActivos: false });

    const nextId = nextCarreraId(all.map((c) => c.carreraId));
    if (!alive) return;

    setCampo('carreraId', nextId);
  }

  void ensureCarreraId();

  return () => {
    alive = false;
  };
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [catalog, props.mode]);
  return {
    titulo,
    escolaridadesOrdenadas,
    form,
    setCampo,
    flags,
    submit,
  };
}
