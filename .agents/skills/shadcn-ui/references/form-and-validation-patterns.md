# shadcn/ui Form & Type-Safe Validation Patterns

Panduan arsitektur pembuatan formulir kompleks berstandar industri menggunakan shadcn/ui `<Form>`, `react-hook-form`, dan validasi skema `zod`.

---

## 1. Anatomi Komponen `<Form>` shadcn

Komponen Form shadcn membungkus `react-hook-form` FormProvider dengan penanganan aksesibilitas WAI-ARIA otomatis:

```
<Form {...form}>                    <-- Context Provider react-hook-form
  <form onSubmit={...}>
    <FormField                      <-- Controller bridge (field state, error, touch)
      control={form.control}
      name="email"
      render={({ field }) => (
        <FormItem>                  <-- Kontainer elemen dengan id otomatis
          <FormLabel />             <-- Terhubung ke input melalui htmlFor otomatis
          <FormControl>             <-- Input/Select/Textarea dengan aria-describedby & aria-invalid
            <Input {...field} />
          </FormControl>
          <FormDescription />       <-- Teks bantuan yang terbaca oleh screen reader
          <FormMessage />           <-- Pesan error validasi Zod (aria-live polite)
        </FormItem>
      )}
    />
  </form>
</Form>
```

---

## 2. Implementasi Lengkap: Formulir Registrasi Akun

```tsx
"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

const registerSchema = z
  .object({
    fullName: z.string().min(2, "Nama minimal 2 karakter").max(50),
    email: z.string().email("Format alamat email tidak valid"),
    role: z.enum(["developer", "designer", "product-manager"], {
      required_error: "Silakan pilih peran utama Anda",
    }),
    password: z
      .string()
      .min(8, "Kata sandi minimal 8 karakter")
      .regex(/[A-Z]/, "Harus mengandung minimal 1 huruf kapital")
      .regex(/[0-9]/, "Harus mengandung minimal 1 angka"),
    confirmPassword: z.string(),
    terms: z.boolean().refine((val) => val === true, {
      message: "Anda wajib menyetujui syarat & ketentuan",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Konfirmasi kata sandi tidak cocok",
    path: ["confirmPassword"],
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
      terms: false,
    },
  });

  async function onSubmit(data: RegisterFormValues) {
    setIsLoading(true);
    try {
      console.log("Submitting payload to backend:", data);
      // Panggil endpoint API di sini
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 max-w-md mx-auto p-6 rounded-2xl border bg-card shadow-sm">
        <FormField
          control={form.control}
          name="fullName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nama Lengkap</FormLabel>
              <FormControl>
                <Input placeholder="Budi Santoso" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email Perusahaan</FormLabel>
              <FormControl>
                <Input type="email" placeholder="budi@perusahaan.id" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Peran Utama</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih peran..." />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="developer">Software Engineer</SelectItem>
                  <SelectItem value="designer">UI/UX Designer</SelectItem>
                  <SelectItem value="product-manager">Product Manager</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Kata Sandi</FormLabel>
                <FormControl>
                  <Input type="password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ulangi Sandi</FormLabel>
                <FormControl>
                  <Input type="password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="terms"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel className="cursor-pointer">
                  Saya menyetujui Ketentuan Layanan dan Kebijakan Privasi.
                </FormLabel>
                <FormMessage />
              </div>
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Mendaftarkan..." : "Daftar Akun Baru"}
        </Button>
      </form>
    </Form>
  );
}
```

---

## 3. Best Practices Validasi Form

1. **Gunakan Async Validation Hanya untuk Pengecekan Server**:
   - Pengecekan unik seperti "apakah email sudah terdaftar" sebaiknya menggunakan debounce async validation atau ditangani saat submission.
2. **Kustomisasi Pesan Error yang Manusiawi**:
   - Berikan arahan spesifik bagaimana pengguna dapat memperbaiki input, bukan sekadar "Input salah".
3. **Reset Form yang Anggun**:
   - Selalu gunakan `form.reset()` setelah submission berhasil agar status *isDirty* dan *isSubmitted* kembali bersih.
