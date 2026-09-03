# Primitif Aksesibilitas Radix UI & shadcn/ui

Panduan kepatuhan WAI-ARIA dan manajemen fokus keyboard untuk komponen interaktif kompleks (Modal Dialog, Dropdown Menu, Popover, Tooltip, Sheet).

---

## 1. Dialog & Modal (Focus Trapping & Escape Handlers)

Primitif Dialog Radix UI menyediakan fitur aksesibilitas tingkat enterprise secara out-of-the-box:
1. **Focus Trapping**: Saat modal terbuka, penekanan tombol `Tab` tidak akan pernah melompat ke elemen di balik modal. Fokus tertahan di dalam dialog.
2. **Keyboard Dismissal**: Menekan tombol `Escape` secara otomatis memicu event penutupan modal.
3. **Restoration Focus**: Saat modal ditutup, fokus kursor secara otomatis dikembalikan ke tombol pemicu (*trigger*) awal.
4. **Scroll Lock**: Elemen `document.body` secara otomatis dikunci (*overflow hidden*) saat modal terbuka untuk mencegah scrolling latar belakang yang tidak diinginkan.

```tsx
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export function ConfirmDeleteDialog({ onConfirm }: { onConfirm: () => void }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="destructive">Hapus Akun</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Konfirmasi Penghapusan</DialogTitle>
          <DialogDescription>
            Tindakan ini tidak dapat dibatalkan. Semua data riwayat Anda akan dihapus permanen.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline">Batal</Button>
          <Button variant="destructive" onClick={onConfirm}>
            Ya, Hapus Sekarang
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

---

## 2. Dropdown Menu & Keyboard Navigation

Dropdown menu mematuhi spesifikasi WAI-ARIA Menu:
- Panah Bawah/Atas (`ArrowDown`, `ArrowUp`): Menavigasi item menu.
- `Home` / `End`: Lompat langsung ke item pertama / terakhir.
- `Enter` / `Space`: Mengaktifkan item menu.
- Pengetikan Karakter (*Typeahead*): Menekan huruf (misal "E") langsung melompat ke item yang berawalan huruf tersebut.

```tsx
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

export function UserActionsMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">Kelola Data</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel>Opsi Dokumen</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          Salin Tautan
          <DropdownMenuShortcut>⌘C</DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuItem>
          Ekspor PDF
          <DropdownMenuShortcut>⌘E</DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
```

---

## 3. Checklist Audit Aksesibilitas bagi QA Engineer

- [ ] Setiap dialog modal memiliki elemen `<DialogTitle>` dan `<DialogDescription>` yang valid untuk pembaca layar (*screen reader*).
- [ ] Tombol pemicu yang membungkus komponen custom (seperti `<Link>`) selalu menyertakan properti `asChild`.
- [ ] Tab order berjalan logis dari atas ke bawah, kiri ke kanan.
- [ ] Semua status interaktif memiliki outline ring fokus yang kontras (`focus-visible:ring-2 focus-visible:ring-ring`).
- [ ] Tooltip memiliki penundaan wajar (*delay duration* 200-400ms) agar tidak memicu kelelahan visual (*visual fatigue*).
