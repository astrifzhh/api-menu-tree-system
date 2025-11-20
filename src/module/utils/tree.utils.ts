export interface TreeItem {
  id: string | number;
  parentId?: string | number | null; // Kita pakai parentId langsung
  children: TreeItem[];
  [key: string]: any;
}

export function buildTree<T extends TreeItem>(items: T[]): T[] {
  const rootItems: T[] = [];
  const lookup: { [key: string]: T } = {};

  // 1. Masukkan semua item ke lookup table
  for (const item of items) {
    const itemId = item.id.toString();
    // Inisialisasi children array
    lookup[itemId] = { ...item, children: [] };
  }

  // 2. Susun relasi Parent-Child
  for (const item of items) {
    const itemId = item.id.toString();
    const currentItem = lookup[itemId];

    // PENTING: Menggunakan 'parentId' langsung dari kolom Entity kamu
    // (Sesuai screenshot kamu: parentId: string)
    const parentId = item.parentId ? item.parentId.toString() : null;

    if (parentId && lookup[parentId]) {
      // Jika punya parent, masukkan ke array children milik parent tersebut
      lookup[parentId].children.push(currentItem);
    } else {
      // Jika tidak punya parentId (null), berarti dia Root (Level paling atas)
      rootItems.push(currentItem);
    }
  }

  return rootItems;
}
