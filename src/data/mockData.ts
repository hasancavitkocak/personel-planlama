import type { User, Personnel, WorkOrder, Assignment } from '../types';

export const currentUser: User = {
  id: "U001",
  name: "Hasan Cavit Koçak",
  role: "Planlama Uzmanı",
  avatar: "HK"
};

export const personnel: Personnel[] = [
  { id: "P001", name: "Ahmet Yılmaz", role: "Elektrik Teknisyeni", skills: ["Elektrik", "PLC"], capacity: 8, avatar: "AY", color: "#007AFF" },
  { id: "P002", name: "Mehmet Demir", role: "Mekanik Teknisyen", skills: ["Mekanik", "Hidrolik"], capacity: 8, avatar: "MD", color: "#34C759" },
  { id: "P003", name: "Ali Kaya", role: "Enstrümantasyon", skills: ["Enstrümantasyon", "SCADA"], capacity: 8, avatar: "AK", color: "#FF9500" },
  { id: "P004", name: "Fatma Şahin", role: "Kaynak Teknisyeni", skills: ["Kaynak", "Metal İşleme"], capacity: 8, avatar: "FŞ", color: "#FF2D55" },
  { id: "P005", name: "Mustafa Çelik", role: "Elektrik Teknisyeni", skills: ["Elektrik", "Otomasyon"], capacity: 8, avatar: "MÇ", color: "#5856D6" },
  { id: "P006", name: "Zeynep Arslan", role: "Mekanik Teknisyen", skills: ["Mekanik", "Pompa"], capacity: 8, avatar: "ZA", color: "#FF6B35" }
];

export const initialWorkOrders: WorkOrder[] = [
  {
    id: "WO-2024-001", title: "Pompa Bakımı", description: "P-101 santrifüj pompa periyodik bakımı",
    priority: "high", status: "unassigned", duration: 4, requiredSkill: "Mekanik",
    location: "Üretim Sahası A", plannedDate: null, assignedTo: null,
    startHour: 8, equipment: "P-101", orderType: "PM01"
  },
  {
    id: "WO-2024-002", title: "Elektrik Pano Kontrolü", description: "MCC-05 motor kontrol merkezi bakımı",
    priority: "critical", status: "unassigned", duration: 3, requiredSkill: "Elektrik",
    location: "Elektrik Odası", plannedDate: null, assignedTo: null,
    startHour: 10, equipment: "MCC-05", orderType: "PM02"
  },
  {
    id: "WO-2024-003", title: "Vana Değişimi", description: "V-203 kontrol vanası değişimi",
    priority: "medium", status: "unassigned", duration: 2, requiredSkill: "Mekanik",
    location: "Boru Hattı B", plannedDate: null, assignedTo: null,
    startHour: null, equipment: "V-203", orderType: "PM01"
  },
  {
    id: "WO-2024-004", title: "PLC Yazılım Güncelleme", description: "Siemens S7-1500 firmware güncellemesi",
    priority: "medium", status: "unassigned", duration: 5, requiredSkill: "PLC",
    location: "Kontrol Odası", plannedDate: null, assignedTo: null,
    startHour: 13, equipment: "PLC-01", orderType: "PM03"
  },
  {
    id: "WO-2024-005", title: "Kompresör Yağ Değişimi", description: "K-301 hava kompresörü yağ değişimi",
    priority: "low", status: "unassigned", duration: 2, requiredSkill: "Mekanik",
    location: "Kompresör İstasyonu", plannedDate: null, assignedTo: null,
    startHour: null, equipment: "K-301", orderType: "PM01"
  },
  {
    id: "WO-2024-006", title: "Sensör Kalibrasyonu", description: "FT-401 akış transmitteri kalibrasyonu",
    priority: "high", status: "unassigned", duration: 3, requiredSkill: "Enstrümantasyon",
    location: "Proses Alanı C", plannedDate: null, assignedTo: null,
    startHour: null, equipment: "FT-401", orderType: "PM02"
  },
  {
    id: "WO-2024-007", title: "Kaynak Onarımı", description: "Tank T-102 kaynak onarımı",
    priority: "critical", status: "unassigned", duration: 6, requiredSkill: "Kaynak",
    location: "Tank Sahası", plannedDate: null, assignedTo: null,
    startHour: null, equipment: "T-102", orderType: "PM04"
  },
  {
    id: "WO-2024-008", title: "Motor Revizyonu", description: "M-501 elektrik motoru revizyonu",
    priority: "high", status: "unassigned", duration: 8, requiredSkill: "Elektrik",
    location: "Makine Dairesi", plannedDate: null, assignedTo: null,
    startHour: null, equipment: "M-501", orderType: "PM01"
  },
  {
    id: "WO-2024-009", title: "Trafo Bakımı", description: "TR-01 güç trafosu periyodik bakımı",
    priority: "high", status: "assigned", duration: 3, requiredSkill: "Elektrik",
    location: "Trafo Merkezi", plannedDate: new Date().toISOString().split('T')[0], assignedTo: "P001",
    startHour: 8, equipment: "TR-01", orderType: "PM02"
  },
  {
    id: "WO-2024-010", title: "Redüktör Bakımı", description: "RD-02 dişli redüktör yağ ve rulman kontrolü",
    priority: "medium", status: "assigned", duration: 4, requiredSkill: "Mekanik",
    location: "Üretim Hattı 2", plannedDate: new Date().toISOString().split('T')[0], assignedTo: "P002",
    startHour: 9, equipment: "RD-02", orderType: "PM01"
  },
  {
    id: "WO-2024-011", title: "Transmitter Bakımı", description: "PT-201 basınç transmitteri kalibrasyon ve bakımı",
    priority: "low", status: "assigned", duration: 2, requiredSkill: "Enstrümantasyon",
    location: "Proses Alanı B", plannedDate: new Date().toISOString().split('T')[0], assignedTo: "P003",
    startHour: 13, equipment: "PT-201", orderType: "PM02"
  },
  {
    id: "WO-2024-012", title: "Kablo Döşeme", description: "KBL-03 güç kablosu yenileme çalışması",
    priority: "medium", status: "assigned", duration: 5, requiredSkill: "Elektrik",
    location: "Kablo Kanalı C", plannedDate: new Date().toISOString().split('T')[0], assignedTo: "P004",
    startHour: 10, equipment: "KBL-03", orderType: "PM03"
  },
  {
    id: "WO-2024-013", title: "Otomasyon Testi", description: "AUTO-01 otomasyon sistemi fonksiyon testi",
    priority: "high", status: "assigned", duration: 4, requiredSkill: "Otomasyon",
    location: "Kontrol Odası", plannedDate: new Date().toISOString().split('T')[0], assignedTo: "P005",
    startHour: 7, equipment: "AUTO-01", orderType: "PM03"
  }
];

export const initialAssignments: Assignment[] = [
  {
    id: "A001", workOrderId: "WO-2024-009", personnelId: "P001",
    date: new Date().toISOString().split('T')[0], startHour: 8, duration: 3, status: "confirmed",
    title: "Trafo Bakımı", priority: "high", equipment: "TR-01"
  },
  {
    id: "A002", workOrderId: "WO-2024-010", personnelId: "P002",
    date: new Date().toISOString().split('T')[0], startHour: 9, duration: 4, status: "confirmed",
    title: "Redüktör Bakımı", priority: "medium", equipment: "RD-02"
  },
  {
    id: "A003", workOrderId: "WO-2024-011", personnelId: "P003",
    date: new Date().toISOString().split('T')[0], startHour: 13, duration: 2, status: "pending",
    title: "Transmitter Bakımı", priority: "low", equipment: "PT-201"
  },
  {
    id: "A004", workOrderId: "WO-2024-012", personnelId: "P004",
    date: new Date().toISOString().split('T')[0], startHour: 10, duration: 5, status: "confirmed",
    title: "Kablo Döşeme", priority: "medium", equipment: "KBL-03"
  },
  {
    id: "A005", workOrderId: "WO-2024-013", personnelId: "P005",
    date: new Date().toISOString().split('T')[0], startHour: 7, duration: 4, status: "confirmed",
    title: "Otomasyon Testi", priority: "high", equipment: "AUTO-01"
  }
];
