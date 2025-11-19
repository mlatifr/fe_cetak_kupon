/**
 * Helper function untuk membuat pagination config dengan opsi "Show All"
 */
export function getPaginationConfig(
  totalItems: number,
  defaultPageSize: number = 10,
  customOptions?: string[]
) {
  const defaultOptions = ['10', '20', '50', '100'];
  const options = customOptions || defaultOptions;
  
  // Tambahkan opsi "Show All" jika total items lebih besar dari opsi terbesar
  const maxOption = Math.max(...options.map(Number));
  if (totalItems > maxOption) {
    options.push(String(totalItems));
  }
  
  return {
    pageSize: defaultPageSize,
    showSizeChanger: true,
    showTotal: (total: number, range: [number, number]) =>
      `${range[0]}-${range[1]} dari ${total} item`,
    pageSizeOptions: options,
    showQuickJumper: true,
  };
}

