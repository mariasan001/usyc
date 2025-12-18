'use client';

import { useEffect, useMemo, useState } from 'react';
import { Save, ImagePlus, RotateCcw } from 'lucide-react';

import Card from '@/shared/ui/Card/Card';
import Button from '@/shared/ui/Button/Button';
import Input from '@/shared/ui/Input/Input';
import Badge from '@/shared/ui/Badge/Badge';

import type { ReceiptTemplateSettings } from '@/modules/receipts/utils/receipt-template.settings';
import {
  defaultReceiptSettings,
  loadReceiptSettings,
  saveReceiptSettings,
} from '@/modules/receipts/utils/receipt-template.settings';

import s from './ReceiptSettingsPanel.module.css';

async function fileToDataUrl(file: File): Promise<string> {
  return await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function ReceiptSettingsPanel() {
  const initial = useMemo(() => loadReceiptSettings(), []);
  const [form, setForm] = useState<ReceiptTemplateSettings>(initial);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!saved) return;
    const t = setTimeout(() => setSaved(false), 1200);
    return () => clearTimeout(t);
  }, [saved]);

  function update<K extends keyof ReceiptTemplateSettings>(k: K, v: ReceiptTemplateSettings[K]) {
    setForm((prev) => ({ ...prev, [k]: v }));
  }

  async function onPickLogo(file?: File | null) {
    if (!file) return;
    const dataUrl = await fileToDataUrl(file);
    update('logoDataUrl', dataUrl);
  }

  function onSave() {
    saveReceiptSettings(form);
    setSaved(true);
  }

  function onReset() {
    setForm(defaultReceiptSettings);
    saveReceiptSettings(defaultReceiptSettings);
    setSaved(true);
  }

  return (
    <Card
      title="Configuración del Recibo"
      subtitle="Personaliza plantel, serie y logo (sin internet)"
      right={
        saved ? <Badge tone="ok">Guardado</Badge> : <Badge tone="info">Plantilla</Badge>
      }
    >
      <div className={s.grid}>
        <div className={s.form}>
          <Input
            label="Nombre del plantel"
            value={form.plantelName}
            onChange={(e) => update('plantelName', e.target.value)}
            placeholder="PLANTEL TOLUCA"
          />

          <Input
            label="Serie"
            value={form.serie}
            onChange={(e) => update('serie', e.target.value.toUpperCase())}
            placeholder="TL"
          />

          <Input
            label="Texto inferior"
            value={form.footerText}
            onChange={(e) => update('footerText', e.target.value)}
            placeholder="Control escolar"
          />

          <div className={s.logoRow}>
            <label className={s.logoLabel}>
              <span>Logo</span>
              <input
                type="file"
                accept="image/*"
                className={s.file}
                onChange={(e) => onPickLogo(e.target.files?.[0])}
              />
              <div className={s.logoBtn}>
                <ImagePlus size={16} /> Seleccionar imagen
              </div>
            </label>

            {form.logoDataUrl ? (
              <Button
                variant="secondary"
                onClick={() => update('logoDataUrl', undefined)}
              >
                Quitar
              </Button>
            ) : null}
          </div>

          <div className={s.actions}>
            <Button variant="secondary" onClick={onReset} leftIcon={<RotateCcw size={16} />}>
              Restablecer
            </Button>

            <Button onClick={onSave} leftIcon={<Save size={16} />}>
              Guardar
            </Button>
          </div>
        </div>

        <div className={s.preview}>
          <div className={s.previewTitle}>Vista previa rápida</div>
          <div className={s.previewCard}>
            <div className={s.previewLogo}>
              {form.logoDataUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={form.logoDataUrl} alt="Logo" />
              ) : (
                <div className={s.previewLogoEmpty}>LOGO</div>
              )}
            </div>

            <div className={s.previewMeta}>
              <div className={s.previewPlantel}>{form.plantelName}</div>
              <div className={s.previewSerie}>Serie: {form.serie}</div>
              <div className={s.previewFooter}>{form.footerText}</div>
            </div>
          </div>

          <div className={s.previewHint}>
            Esto se aplica al PDF/impresión del recibo.
          </div>
        </div>
      </div>
    </Card>
  );
}
