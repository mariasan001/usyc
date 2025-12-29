'use client';

import {
  GraduationCap,
  BookOpen,
  BadgeCheck,
  Receipt,
  CreditCard,
  School,
} from 'lucide-react';

import type { TabCatalogo } from '../types/catalogoTabs.types';

/**
 * Definición central de pestañas:
 * - Mantener aquí evita tocar el componente UI cuando se agregan catálogos.
 * - Orden = orden visual.
 */
export const TABS_CATALOGOS: TabCatalogo[] = [
  { key: 'escolaridades', label: 'Escolaridades', Icon: GraduationCap },
  { key: 'carreras', label: 'Carreras', Icon: BookOpen },
  { key: 'planteles', label: 'Planteles', Icon: School },
  { key: 'estatusRecibo', label: 'Estatus de recibo', Icon: BadgeCheck },
  { key: 'conceptosPago', label: 'Conceptos de pago', Icon: Receipt },
  { key: 'tiposPago', label: 'Tipos de pago', Icon: CreditCard },
];
