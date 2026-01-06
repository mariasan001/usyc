export function nextCarreraId(existing: Array<string | null | undefined>) {
  // toma solo ids numéricos: "01", "10", "2"
  const nums = existing
    .map((x) => (x ?? '').trim())
    .filter((x) => /^\d+$/.test(x))
    .map((x) => Number(x));

  const max = nums.length ? Math.max(...nums) : 0;
  const next = max + 1;

  // padding dinámico: mínimo 2 dígitos ("01"), pero si pasa 99 ya no lo corta
  const width = Math.max(2, String(next).length);
  return String(next).padStart(width, '0');
}
