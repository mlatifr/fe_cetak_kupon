/**
 * Format validation_details dari JSON string menjadi format yang user-friendly
 */
export function formatValidationDetails(details: string): string {
  if (!details) return '-';
  
  // Coba parse sebagai JSON
  try {
    const parsed = JSON.parse(details);
    
    // Jika ada message, gunakan itu
    if (parsed.message) {
      return parsed.message;
    }
    
    // Format berdasarkan tipe validasi
    if (parsed.expected && parsed.actual) {
      // Distribution check
      const lines: string[] = [];
      lines.push('Distribusi Hadiah:');
      Object.keys(parsed.expected).forEach((amount) => {
        const expected = parsed.expected[amount];
        const actual = parsed.actual[amount];
        const status = expected === actual ? '✓' : '✗';
        lines.push(`  Rp ${parseInt(amount).toLocaleString('id-ID')}: ${actual} kupon (harusnya ${expected}) ${status}`);
      });
      if (parsed.issues && parsed.issues.length > 0) {
        lines.push('\nMasalah ditemukan:');
        parsed.issues.forEach((issue: string) => {
          lines.push(`  - ${issue}`);
        });
      }
      return lines.join('\n');
    }
    
    if (parsed.expected_per_box) {
      // Box composition
      const lines: string[] = [];
      lines.push('Komposisi Per Box:');
      Object.keys(parsed.expected_per_box).forEach((amount) => {
        const count = parsed.expected_per_box[amount];
        lines.push(`  Rp ${parseInt(amount).toLocaleString('id-ID')}: ${count} kupon`);
      });
      if (parsed.box_compositions) {
        lines.push('\nStatus per Box:');
        Object.keys(parsed.box_compositions).forEach((boxNum) => {
          const box = parsed.box_compositions[boxNum];
          const isMatch = Object.keys(parsed.expected_per_box).every((amount) => {
            return box[amount] === parsed.expected_per_box[amount];
          });
          lines.push(`  Box ${boxNum}: ${isMatch ? 'Sesuai ✓' : 'Tidak Sesuai ✗'}`);
        });
      }
      return lines.join('\n');
    }
    
    if (parsed.total_consecutive_issues !== undefined) {
      // Consecutive check
      if (parsed.total_consecutive_issues === 0) {
        return 'Tidak ada hadiah sama pada nomor berurutan ✓';
      } else {
        const lines: string[] = [];
        lines.push(`Ditemukan ${parsed.total_consecutive_issues} masalah hadiah sama berurutan:`);
        if (parsed.issues && parsed.issues.length > 0) {
          parsed.issues.forEach((issue: any) => {
            if (typeof issue === 'string') {
              lines.push(`  - ${issue}`);
            } else if (issue.coupon_number) {
              lines.push(`  - Kupon ${issue.coupon_number}: ${issue.description || 'Hadiah sama dengan kupon sebelumnya'}`);
            }
          });
        }
        return lines.join('\n');
      }
    }
    
    // Fallback: return stringified dengan format yang lebih baik
    return JSON.stringify(parsed, null, 2);
  } catch (e) {
    // Bukan JSON, return as-is
    return details;
  }
}

