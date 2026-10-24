export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.17"
  }
  public: {
    Tables: {
      berita: {
        Row: {
          created_at: string
          gambar_url: string | null
          id: string
          isi: string
          judul: string
          kategori: string | null
          kelas_target: string | null
          penulis_id: string | null
          published: boolean
          tanggal_kegiatan: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          gambar_url?: string | null
          id?: string
          isi: string
          judul: string
          kategori?: string | null
          kelas_target?: string | null
          penulis_id?: string | null
          published?: boolean
          tanggal_kegiatan?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          gambar_url?: string | null
          id?: string
          isi?: string
          judul?: string
          kategori?: string | null
          kelas_target?: string | null
          penulis_id?: string | null
          published?: boolean
          tanggal_kegiatan?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      checkin_harian: {
        Row: {
          created_at: string
          id: string
          koin: number
          tanggal: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          koin?: number
          tanggal: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          koin?: number
          tanggal?: string
          user_id?: string
        }
        Relationships: []
      }
      guru_kelas: {
        Row: {
          created_at: string
          guru_id: string
          id: string
          kelas_nama: string
          sebagai: string
        }
        Insert: {
          created_at?: string
          guru_id: string
          id?: string
          kelas_nama: string
          sebagai?: string
        }
        Update: {
          created_at?: string
          guru_id?: string
          id?: string
          kelas_nama?: string
          sebagai?: string
        }
        Relationships: []
      }
      hadiah: {
        Row: {
          created_at: string
          created_by: string | null
          gambar_url: string | null
          harga_koin: number
          id: string
          ikon: string
          kategori: string
          nama: string
          stok: number
          tipe: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          gambar_url?: string | null
          harga_koin?: number
          id?: string
          ikon?: string
          kategori?: string
          nama: string
          stok?: number
          tipe?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          gambar_url?: string | null
          harga_koin?: number
          id?: string
          ikon?: string
          kategori?: string
          nama?: string
          stok?: number
          tipe?: string
          updated_at?: string
        }
        Relationships: []
      }
      katalog_perilaku: {
        Row: {
          aktif: boolean
          created_at: string
          id: string
          jenis: string
          kategori: string
          poin: number
          updated_at: string
        }
        Insert: {
          aktif?: boolean
          created_at?: string
          id?: string
          jenis: string
          kategori: string
          poin?: number
          updated_at?: string
        }
        Update: {
          aktif?: boolean
          created_at?: string
          id?: string
          jenis?: string
          kategori?: string
          poin?: number
          updated_at?: string
        }
        Relationships: []
      }
      kegiatan_sekolah: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          koin_bonus: number
          nama_kegiatan: string
          tanggal: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          koin_bonus?: number
          nama_kegiatan: string
          tanggal: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          koin_bonus?: number
          nama_kegiatan?: string
          tanggal?: string
          updated_at?: string
        }
        Relationships: []
      }
      kelas_rombel: {
        Row: {
          aktif: boolean
          created_at: string
          id: string
          nama: string
          rombel: string
          tingkat: string
          updated_at: string
          wali_kelas: string
        }
        Insert: {
          aktif?: boolean
          created_at?: string
          id?: string
          nama: string
          rombel: string
          tingkat: string
          updated_at?: string
          wali_kelas?: string
        }
        Update: {
          aktif?: boolean
          created_at?: string
          id?: string
          nama?: string
          rombel?: string
          tingkat?: string
          updated_at?: string
          wali_kelas?: string
        }
        Relationships: []
      }
      koin_bonus: {
        Row: {
          diberikan_oleh: string
          diberikan_pada: string
          id: string
          jumlah: number
          kegiatan: string
          user_id: string
        }
        Insert: {
          diberikan_oleh: string
          diberikan_pada?: string
          id?: string
          jumlah?: number
          kegiatan: string
          user_id: string
        }
        Update: {
          diberikan_oleh?: string
          diberikan_pada?: string
          id?: string
          jumlah?: number
          kegiatan?: string
          user_id?: string
        }
        Relationships: []
      }
      lencana_siswa: {
        Row: {
          created_at: string
          id: string
          jumlah: number
          kode: string
          nama: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          jumlah?: number
          kode: string
          nama: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          jumlah?: number
          kode?: string
          nama?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      modul: {
        Row: {
          cover_url: string | null
          created_at: string
          created_by: string | null
          deskripsi: string | null
          id: string
          judul: string
          kategori: string | null
          kelas: string | null
          kelas_target: string | null
          koin_reward: number
          konten: string | null
          kuis_jawaban: number
          kuis_opsi: string[]
          kuis_pertanyaan: string | null
          mapel: string | null
          tautan_tugas: string | null
          updated_at: string
        }
        Insert: {
          cover_url?: string | null
          created_at?: string
          created_by?: string | null
          deskripsi?: string | null
          id?: string
          judul: string
          kategori?: string | null
          kelas?: string | null
          kelas_target?: string | null
          koin_reward?: number
          konten?: string | null
          kuis_jawaban?: number
          kuis_opsi?: string[]
          kuis_pertanyaan?: string | null
          mapel?: string | null
          tautan_tugas?: string | null
          updated_at?: string
        }
        Update: {
          cover_url?: string | null
          created_at?: string
          created_by?: string | null
          deskripsi?: string | null
          id?: string
          judul?: string
          kategori?: string | null
          kelas?: string | null
          kelas_target?: string | null
          koin_reward?: number
          konten?: string | null
          kuis_jawaban?: number
          kuis_opsi?: string[]
          kuis_pertanyaan?: string | null
          mapel?: string | null
          tautan_tugas?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      modul_selesai: {
        Row: {
          id: string
          koin_didapat: number
          modul_id: string
          selesai_pada: string
          user_id: string
        }
        Insert: {
          id?: string
          koin_didapat?: number
          modul_id: string
          selesai_pada?: string
          user_id: string
        }
        Update: {
          id?: string
          koin_didapat?: number
          modul_id?: string
          selesai_pada?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "modul_selesai_modul_id_fkey"
            columns: ["modul_id"]
            isOneToOne: false
            referencedRelation: "modul"
            referencedColumns: ["id"]
          },
        ]
      }
      nilai_siswa: {
        Row: {
          catatan: string | null
          created_at: string
          created_by: string
          id: string
          jenis: Database["public"]["Enums"]["jenis_nilai"]
          mapel: string
          skor: number
          tanggal: string
          updated_at: string
          user_id: string
        }
        Insert: {
          catatan?: string | null
          created_at?: string
          created_by: string
          id?: string
          jenis?: Database["public"]["Enums"]["jenis_nilai"]
          mapel: string
          skor?: number
          tanggal?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          catatan?: string | null
          created_at?: string
          created_by?: string
          id?: string
          jenis?: Database["public"]["Enums"]["jenis_nilai"]
          mapel?: string
          skor?: number
          tanggal?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      pengaturan_poin: {
        Row: {
          deskripsi: string
          kunci: string
          label: string
          nilai: number
          updated_at: string
          urutan: number
        }
        Insert: {
          deskripsi?: string
          kunci: string
          label: string
          nilai?: number
          updated_at?: string
          urutan?: number
        }
        Update: {
          deskripsi?: string
          kunci?: string
          label?: string
          nilai?: number
          updated_at?: string
          urutan?: number
        }
        Relationships: []
      }
      pengaturan_sekolah: {
        Row: {
          akreditasi: string
          alamat: string
          created_at: string
          email: string
          facebook: string
          hero_url: string | null
          id: number
          instagram: string
          kepala_sekolah: string
          latitude: number | null
          logo_url: string | null
          longitude: number | null
          maps_url: string
          nama_sekolah: string
          npsn: string
          tagline: string
          telepon: string
          tiktok: string
          updated_at: string
          updated_by: string | null
          website: string
          whatsapp: string
          youtube: string
        }
        Insert: {
          akreditasi?: string
          alamat?: string
          created_at?: string
          email?: string
          facebook?: string
          hero_url?: string | null
          id?: number
          instagram?: string
          kepala_sekolah?: string
          latitude?: number | null
          logo_url?: string | null
          longitude?: number | null
          maps_url?: string
          nama_sekolah?: string
          npsn?: string
          tagline?: string
          telepon?: string
          tiktok?: string
          updated_at?: string
          updated_by?: string | null
          website?: string
          whatsapp?: string
          youtube?: string
        }
        Update: {
          akreditasi?: string
          alamat?: string
          created_at?: string
          email?: string
          facebook?: string
          hero_url?: string | null
          id?: number
          instagram?: string
          kepala_sekolah?: string
          latitude?: number | null
          logo_url?: string | null
          longitude?: number | null
          maps_url?: string
          nama_sekolah?: string
          npsn?: string
          tagline?: string
          telepon?: string
          tiktok?: string
          updated_at?: string
          updated_by?: string | null
          website?: string
          whatsapp?: string
          youtube?: string
        }
        Relationships: []
      }
      penukaran_hadiah: {
        Row: {
          ditukar_pada: string
          hadiah_id: string
          id: string
          jumlah_koin: number
          kode_voucher: string | null
          status: Database["public"]["Enums"]["status_penukaran"]
          updated_at: string
          user_id: string
        }
        Insert: {
          ditukar_pada?: string
          hadiah_id: string
          id?: string
          jumlah_koin: number
          kode_voucher?: string | null
          status?: Database["public"]["Enums"]["status_penukaran"]
          updated_at?: string
          user_id: string
        }
        Update: {
          ditukar_pada?: string
          hadiah_id?: string
          id?: string
          jumlah_koin?: number
          kode_voucher?: string | null
          status?: Database["public"]["Enums"]["status_penukaran"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "penukaran_hadiah_hadiah_id_fkey"
            columns: ["hadiah_id"]
            isOneToOne: false
            referencedRelation: "hadiah"
            referencedColumns: ["id"]
          },
        ]
      }
      perilaku_siswa: {
        Row: {
          air: number
          catatan: string
          created_at: string
          diberikan_oleh: string
          foto_url: string | null
          id: string
          jenis: string
          katalog_id: string | null
          kategori: string
          poin: number
          sumber: string
          user_id: string
        }
        Insert: {
          air?: number
          catatan?: string
          created_at?: string
          diberikan_oleh: string
          foto_url?: string | null
          id?: string
          jenis: string
          katalog_id?: string | null
          kategori: string
          poin?: number
          sumber?: string
          user_id: string
        }
        Update: {
          air?: number
          catatan?: string
          created_at?: string
          diberikan_oleh?: string
          foto_url?: string | null
          id?: string
          jenis?: string
          katalog_id?: string | null
          kategori?: string
          poin?: number
          sumber?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "perilaku_siswa_katalog_id_fkey"
            columns: ["katalog_id"]
            isOneToOne: false
            referencedRelation: "katalog_perilaku"
            referencedColumns: ["id"]
          },
        ]
      }
      pohon_siswa: {
        Row: {
          air: number
          created_at: string
          musim: number
          total_air: number
          total_panen: number
          updated_at: string
          user_id: string
        }
        Insert: {
          air?: number
          created_at?: string
          musim?: number
          total_air?: number
          total_panen?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          air?: number
          created_at?: string
          musim?: number
          total_air?: number
          total_panen?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          id: string
          kelas: string | null
          koin: number
          mapel: string | null
          nama: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id: string
          kelas?: string | null
          koin?: number
          mapel?: string | null
          nama: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          kelas?: string | null
          koin?: number
          mapel?: string | null
          nama?: string
          updated_at?: string
        }
        Relationships: []
      }
      refleksi_modul: {
        Row: {
          created_at: string
          id: string
          jawaban_1: string
          jawaban_2: string
          jawaban_3: string
          modul_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          jawaban_1: string
          jawaban_2: string
          jawaban_3: string
          modul_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          jawaban_1?: string
          jawaban_2?: string
          jawaban_3?: string
          modul_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "refleksi_modul_modul_id_fkey"
            columns: ["modul_id"]
            isOneToOne: false
            referencedRelation: "modul"
            referencedColumns: ["id"]
          },
        ]
      }
      roda_putaran: {
        Row: {
          created_at: string
          hadiah_index: number
          hadiah_label: string
          id: string
          koin_bersih: number
          user_id: string
        }
        Insert: {
          created_at?: string
          hadiah_index: number
          hadiah_label: string
          id?: string
          koin_bersih: number
          user_id: string
        }
        Update: {
          created_at?: string
          hadiah_index?: number
          hadiah_label?: string
          id?: string
          koin_bersih?: number
          user_id?: string
        }
        Relationships: []
      }
      tes_formatif: {
        Row: {
          aktif: boolean
          created_at: string
          created_by: string | null
          id: string
          judul: string
          kelas_target: string | null
          keterangan: string | null
          mapel: string | null
          tautan: string
        }
        Insert: {
          aktif?: boolean
          created_at?: string
          created_by?: string | null
          id?: string
          judul: string
          kelas_target?: string | null
          keterangan?: string | null
          mapel?: string | null
          tautan: string
        }
        Update: {
          aktif?: boolean
          created_at?: string
          created_by?: string | null
          id?: string
          judul?: string
          kelas_target?: string | null
          keterangan?: string | null
          mapel?: string | null
          tautan?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      beri_koin_bonus: {
        Args: {
          _jumlah: number
          _kegiatan: string
          _oleh: string
          _user_id: string
        }
        Returns: number
      }
      catat_perilaku: {
        Args: {
          _catatan?: string
          _katalog_id: string
          _oleh: string
          _user_id: string
        }
        Returns: {
          air: number
          musim: number
          poin: number
          saldo_koin: number
          total_air: number
        }[]
      }
      hapus_perilaku: { Args: { _id: string }; Returns: boolean }
      kirim_perilaku_mandiri: {
        Args: {
          _catatan: string
          _foto: string
          _katalog_id: string
          _user_id: string
        }
        Returns: {
          air: number
          berhasil: boolean
          musim: number
          pesan: string
          poin: number
          saldo_koin: number
          sisa_kiriman: number
          total_air: number
        }[]
      }
      klaim_checkin_harian: {
        Args: { _user_id: string }
        Returns: {
          berhasil: boolean
          koin_didapat: number
          pesan: string
          saldo_koin: number
        }[]
      }
      leaderboard_pohon: {
        Args: { _batas?: number }
        Returns: {
          kelas: string
          nama: string
          total_air: number
          total_panen: number
        }[]
      }
      leaderboard_siswa: {
        Args: { _batas?: number }
        Returns: {
          kelas: string
          koin: number
          nama: string
        }[]
      }
      nilai_poin: { Args: { _bawaan: number; _kunci: string }; Returns: number }
      panen_pohon: {
        Args: { _user_id: string }
        Returns: {
          air: number
          berhasil: boolean
          musim: number
          pesan: string
          poin_didapat: number
          saldo_koin: number
        }[]
      }
      pastikan_profil_untuk: {
        Args: { _nama: string; _peran?: string; _uid: string }
        Returns: undefined
      }
      putar_roda: {
        Args: { _user_id: string }
        Returns: {
          hadiah_index: number
          hadiah_label: string
          koin_hadiah: number
          lencana: boolean
          saldo_koin: number
          sisa_putaran: number
        }[]
      }
      rekomendasi_modul: {
        Args: { _batas?: number }
        Returns: {
          cover_url: string
          id: string
          judul: string
          kelas: string
          koin_reward: number
          mapel: string
          nama_guru: string
        }[]
      }
      riwayat_checkin_7hari: {
        Args: { _user_id: string }
        Returns: {
          hari_ini: string
          tanggal: string
        }[]
      }
      selesaikan_modul: {
        Args: { _modul_id: string; _user_id: string }
        Returns: {
          koin_didapat: number
          saldo_koin: number
        }[]
      }
      simpan_pengaturan_poin: {
        Args: { _kunci: string; _nilai: number }
        Returns: number
      }
      status_pohon: {
        Args: { _user_id: string }
        Returns: {
          air: number
          musim: number
          poin_panen: number
          saldo_koin: number
          total_air: number
          total_panen: number
        }[]
      }
      status_roda: {
        Args: { _user_id: string }
        Returns: {
          saldo_koin: number
          sisa_putaran: number
        }[]
      }
      tambah_koin_kuis: {
        Args: { _jumlah: number; _user_id: string }
        Returns: number
      }
      tukar_hadiah: {
        Args: { _hadiah_id: string; _user_id: string }
        Returns: {
          berhasil: boolean
          kode_voucher: string
          pesan: string
          saldo_koin: number
          tipe: string
        }[]
      }
      ubah_perilaku: {
        Args: { _catatan?: string; _id: string; _katalog_id: string }
        Returns: {
          air: number
          poin: number
        }[]
      }
    }
    Enums: {
      app_role: "siswa" | "guru" | "admin"
      jenis_nilai: "uh" | "pts" | "pas" | "tugas" | "praktik"
      status_penukaran: "diproses" | "siap_diambil" | "selesai"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["siswa", "guru", "admin"],
      jenis_nilai: ["uh", "pts", "pas", "tugas", "praktik"],
      status_penukaran: ["diproses", "siap_diambil", "selesai"],
    },
  },
} as const
