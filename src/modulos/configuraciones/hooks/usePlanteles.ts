'use client';

import { useCallback, useEffect, useState } from 'react';
import { PlantelesService } from '../services/planteles.service';
import type {
  Plantel,
  PlantelCreate,
  PlantelUpdate,
} from '../types/planteles.types';

export function usePlanteles(params?: { soloActivos?: boolean }) {
  const [items, setItems] = useState<Plantel[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<unknown>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await PlantelesService.list(params);
      setItems(data);
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }, [params?.soloActivos]);

  useEffect(() => {
    load();
  }, [load]);

  async function create(payload: PlantelCreate) {
    try {
      setSaving(true);
      await PlantelesService.create(payload);
      await load();
    } finally {
      setSaving(false);
    }
  }

  async function update(id: number, payload: PlantelUpdate) {
    try {
      setSaving(true);
      await PlantelesService.update(id, payload);
      await load();
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: number) {
    try {
      setSaving(true);
      await PlantelesService.delete(id);
      await load();
    } finally {
      setSaving(false);
    }
  }

  return {
    items,
    loading,
    saving,
    error,

    reload: load,
    create,
    update,
    remove,
  };
}
