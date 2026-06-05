"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

interface KostFormProps {
    formData: any;
    onChange: (data: any) => void;
    onSave: () => void;
    onCancel: () => void;
    loading: boolean;
}

export default function KostForm({ formData, onChange, onSave, onCancel, loading }: KostFormProps) {
    return (
        <Card className="bg-white border-border shadow-premium rounded-[2rem] overflow-hidden animate-in fade-in zoom-in-95 duration-300">
            <CardContent className="p-8 space-y-6">
                <div className="space-y-3">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground ml-1">Detail Kost</p>
                    <Input
                        autoFocus
                        placeholder="Nama Kost"
                        value={formData.Nama_Kost || ""}
                        onChange={(e) => onChange({ ...formData, Nama_Kost: e.target.value })}
                        className="h-12 rounded-2xl"
                    />
                    <Input
                        placeholder="Alamat Lengkap"
                        value={formData.Alamat || ""}
                        onChange={(e) => onChange({ ...formData, Alamat: e.target.value })}
                        className="h-12 rounded-2xl"
                    />
                </div>
                <div className="flex gap-3">
                    <Button
                        disabled={loading}
                        onClick={onSave}
                        className="flex-1 h-12 rounded-xl font-bold"
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Simpan"}
                    </Button>
                    <Button
                        disabled={loading}
                        variant="ghost"
                        onClick={onCancel}
                        className="h-12 px-6 rounded-xl font-bold text-muted-foreground"
                    >
                        Batal
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
