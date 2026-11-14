export function parseISBNList(input: string): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const raw of input.split(/[\n,]/)) {
    const trimmed = raw.trim();
    if (trimmed && !seen.has(trimmed)) {
      seen.add(trimmed);
      result.push(trimmed);
    }
  }
  return result;
}

function validateISBN10(s: string): boolean {
  if (!/^[0-9]{9}[0-9Xx]$/.test(s)) return false;
  let sum = 0;
  for (let i = 0; i < 9; i++) sum += parseInt(s[i]) * (10 - i);
  const last = s[9].toUpperCase() === 'X' ? 10 : parseInt(s[9]);
  return (sum + last) % 11 === 0;
}

function validateISBN13(s: string): boolean {
  if (!/^[0-9]{13}$/.test(s)) return false;
  let sum = 0;
  for (let i = 0; i < 12; i++) sum += parseInt(s[i]) * (i % 2 === 0 ? 1 : 3);
  return (10 - (sum % 10)) % 10 === parseInt(s[12]);
}

export function validateISBN(isbn: string): boolean {
  const stripped = isbn.replace(/[\s-]/g, '');
  if (stripped.length === 10) return validateISBN10(stripped);
  if (stripped.length === 13) return validateISBN13(stripped);
  return false;
}

export function getISBNError(isbn: string): string | null {
  if (!/^[0-9Xx\s-]+$/.test(isbn)) return 'invalid characters';
  const stripped = isbn.replace(/[\s-]/g, '');
  if (stripped.length !== 10 && stripped.length !== 13) return 'Invalid length';
  if (stripped.length === 10 && !validateISBN10(stripped)) return 'Invalid checksum';
  if (stripped.length === 13 && !validateISBN13(stripped)) return 'Invalid checksum';
  return null;
}
