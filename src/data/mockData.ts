import type { User, Personnel, WorkOrder, Assignment, PlanningCalendar, LeaveRecord } from '../types';

export const currentUser: User = {
  id: "U001",
  name: "Hasan Cavit Koçak",
  role: "Planlama Uzmanı",
  avatar: "HK"
};

export const personnel: Personnel[] = [
  { id: "P001", name: "Ahmet Yılmaz", role: "Elektrik Teknisyeni", skills: ["Elektrik", "PLC"], capacity: 8, avatar: "AY", color: "#007AFF", workCenter: "Elektrik Atölye" },
  { id: "P002", name: "Mehmet Demir", role: "Mekanik Teknisyen", skills: ["Mekanik", "Hidrolik"], capacity: 8, avatar: "MD", color: "#34C759", workCenter: "Mekanik Atölye" },
  { id: "P003", name: "Ali Kaya", role: "Enstrümantasyon", skills: ["Enstrümantasyon", "SCADA"], capacity: 8, avatar: "AK", color: "#FF9500", workCenter: "Enstrümantasyon" },
  { id: "P004", name: "Fatma Şahin", role: "Kaynak Teknisyeni", skills: ["Kaynak", "Metal İşleme"], capacity: 8, avatar: "FŞ", color: "#FF2D55", workCenter: "Mekanik Atölye" },
  { id: "P005", name: "Mustafa Çelik", role: "Elektrik Teknisyeni", skills: ["Elektrik", "Otomasyon"], capacity: 8, avatar: "MÇ", color: "#5856D6", workCenter: "Elektrik Atölye" },
  { id: "P006", name: "Zeynep Arslan", role: "Mekanik Teknisyen", skills: ["Mekanik", "Pompa"], capacity: 8, avatar: "ZA", color: "#FF6B35", workCenter: "Mekanik Atölye" }
];

export const initialWorkOrders: WorkOrder[] = [
  {
    id: "WO-2024-001", title: "Pompa Bakımı", description: "P-101 santrifüj pompa periyodik bakımı",
    priority: "high", status: "completed", duration: 4, requiredSkill: "Mekanik",
    location: "Üretim Sahası A", plannedDate: "2026-07-01", assignedTo: "P001",
    startHour: 9, equipment: "P-101", orderType: "PM01", workCenter: "Mekanik Atölye"
  },
  {
    id: "WO-2024-002", title: "Elektrik Pano Kontrolü", description: "MCC-05 motor kontrol merkezi bakımı",
    priority: "critical", status: "completed", duration: 3, requiredSkill: "Elektrik",
    location: "Elektrik Odası", plannedDate: "2026-07-02", assignedTo: "P002",
    startHour: 10, equipment: "MCC-05", orderType: "PM02", workCenter: "Elektrik Atölye"
  },
  {
    id: "WO-2024-003", title: "Vana Değişimi", description: "V-203 kontrol vanası değişimi",
    priority: "medium", status: "assigned", duration: 2, requiredSkill: "Mekanik",
    location: "Boru Hattı B", plannedDate: "2026-07-03", assignedTo: "P003",
    startHour: 14, equipment: "V-203", orderType: "PM01", workCenter: "Mekanik Atölye"
  },
  {
    id: "WO-2024-004", title: "PLC Yazılım Güncelleme", description: "Siemens S7-1500 firmware güncellemesi",
    priority: "medium", status: "assigned", duration: 5, requiredSkill: "PLC",
    location: "Kontrol Odası", plannedDate: "2026-04-12", assignedTo: "P004",
    startHour: 11, equipment: "PLC-01", orderType: "PM03", workCenter: "Elektrik Atölye"
  },
  {
    id: "WO-2024-005", title: "Kompresör Yağ Değişimi", description: "K-301 hava kompresörü yağ değişimi",
    priority: "low", status: "unassigned", duration: 2, requiredSkill: "Mekanik",
    location: "Kompresör İstasyonu", plannedDate: null, assignedTo: null,
    startHour: null, equipment: "K-301", orderType: "PM01", workCenter: "Mekanik Atölye"
  },
  {
    id: "WO-2024-006", title: "Sensör Kalibrasyonu", description: "FT-401 akış transmitteri kalibrasyonu",
    priority: "high", status: "unassigned", duration: 3, requiredSkill: "Enstrümantasyon",
    location: "Proses Alanı C", plannedDate: null, assignedTo: null,
    startHour: null, equipment: "FT-401", orderType: "PM02", workCenter: "Enstrümantasyon"
  },
  {
    id: "WO-2024-007", title: "Kaynak Onarımı", description: "Tank T-102 kaynak onarımı",
    priority: "critical", status: "unassigned", duration: 6, requiredSkill: "Kaynak",
    location: "Tank Sahası", plannedDate: null, assignedTo: null,
    startHour: null, equipment: "T-102", orderType: "PM04", workCenter: "Mekanik Atölye"
  },
  {
    id: "WO-2024-008", title: "Motor Revizyonu", description: "M-501 elektrik motoru revizyonu",
    priority: "high", status: "unassigned", duration: 8, requiredSkill: "Elektrik",
    location: "Makine Dairesi", plannedDate: null, assignedTo: null,
    startHour: null, equipment: "M-501", orderType: "PM01", workCenter: "Elektrik Atölye"
  },
  {
    id: "WO-2024-009", title: "Trafo Bakımı", description: "TR-01 güç trafosu periyodik bakımı",
    priority: "high", status: "assigned", duration: 3, requiredSkill: "Elektrik",
    location: "Trafo Merkezi", plannedDate: new Date().toISOString().split('T')[0], assignedTo: "P001",
    startHour: 8, equipment: "TR-01", orderType: "PM02", workCenter: "Elektrik Atölye"
  },
  {
    id: "WO-2024-010", title: "Redüktör Bakımı", description: "RD-02 dişli redüktör yağ ve rulman kontrolü",
    priority: "medium", status: "assigned", duration: 4, requiredSkill: "Mekanik",
    location: "Üretim Hattı 2", plannedDate: new Date().toISOString().split('T')[0], assignedTo: "P002",
    startHour: 9, equipment: "RD-02", orderType: "PM01", workCenter: "Mekanik Atölye"
  },
  {
    id: "WO-2024-011", title: "Transmitter Bakımı", description: "PT-201 basınç transmitteri kalibrasyon ve bakımı",
    priority: "low", status: "assigned", duration: 2, requiredSkill: "Enstrümantasyon",
    location: "Proses Alanı B", plannedDate: new Date().toISOString().split('T')[0], assignedTo: "P003",
    startHour: 13, equipment: "PT-201", orderType: "PM02", workCenter: "Enstrümantasyon"
  },
  {
    id: "WO-2024-012", title: "Kablo Döşeme", description: "KBL-03 güç kablosu yenileme çalışması",
    priority: "medium", status: "assigned", duration: 5, requiredSkill: "Elektrik",
    location: "Kablo Kanalı C", plannedDate: new Date().toISOString().split('T')[0], assignedTo: "P004",
    startHour: 10, equipment: "KBL-03", orderType: "PM03", workCenter: "Elektrik Atölye"
  },
  {
    id: "WO-2024-013", title: "Otomasyon Testi", description: "AUTO-01 otomasyon sistemi fonksiyon testi",
    priority: "high", status: "assigned", duration: 4, requiredSkill: "Otomasyon",
    location: "Kontrol Odası", plannedDate: new Date().toISOString().split('T')[0], assignedTo: "P005",
    startHour: 7, equipment: "AUTO-01", orderType: "PM03", workCenter: "Elektrik Atölye"
  },
  {
    id: "WO-2024-014", title: "Rulman Değişimi", description: "Fan motoru rulman yenileme",
    priority: "high", status: "completed", duration: 3, requiredSkill: "Mekanik",
    location: "Kazan Dairesi", plannedDate: "2026-06-10", assignedTo: "P002",
    startHour: 8, equipment: "FAN-02", orderType: "PM01", workCenter: "Mekanik Atölye"
  },
  {
    id: "WO-2024-015", title: "Aydınlatma Revizyonu", description: "Depo aydınlatma armatür değişimi",
    priority: "low", status: "completed", duration: 4, requiredSkill: "Elektrik",
    location: "Depo Alanı", plannedDate: "2026-06-12", assignedTo: "P005",
    startHour: 13, equipment: "LGT-09", orderType: "PM03", workCenter: "Elektrik Atölye"
  },
  {
    id: "WO-2024-016", title: "Kalibrasyon Çalışması", description: "Sıcaklık transmiteri kalibrasyonu",
    priority: "medium", status: "assigned", duration: 2, requiredSkill: "Enstrümantasyon",
    location: "Reaktör B", plannedDate: "2026-07-17", assignedTo: "P003",
    startHour: 10, equipment: "TT-302", orderType: "PM02", workCenter: "Enstrümantasyon"
  },
  {
    id: "WO-2024-017", title: "Hava Sızıntısı Onarımı", description: "Hava boru hattı kaçak tespiti ve kaynak onarımı",
    priority: "high", status: "assigned", duration: 3, requiredSkill: "Kaynak",
    location: "Kompresör Alanı", plannedDate: "2026-07-18", assignedTo: "P004",
    startHour: 9, equipment: "AIR-05", orderType: "PM01", workCenter: "Mekanik Atölye"
  },
  {
    id: "WO-2024-018", title: "Yıllık Trafo Testi", description: "TR-02 trafo izolasyon ve yağ testleri",
    priority: "critical", status: "assigned", duration: 6, requiredSkill: "Elektrik",
    location: "Trafo Merkezi 2", plannedDate: "2026-07-20", assignedTo: "P001",
    startHour: 8, equipment: "TR-02", orderType: "PM02", workCenter: "Elektrik Atölye"
  },
  {
    id: "WO-2024-019", title: "Bant Konveyör Revizyonu", description: "C-104 bant rulosu ve şasi kontrolü",
    priority: "high", status: "assigned", duration: 4, requiredSkill: "Mekanik",
    location: "Paketleme Ünitesi", plannedDate: "2026-07-22", assignedTo: "P002",
    startHour: 13, equipment: "CVY-104", orderType: "PM01", workCenter: "Mekanik Atölye"
  },
  {
    id: "WO-2024-020", title: "SCADA Haberleşme Kontrolü", description: "RTU panosu ethernet switch değişimi",
    priority: "medium", status: "assigned", duration: 3, requiredSkill: "PLC",
    location: "Kontrol Odası", plannedDate: "2026-07-25", assignedTo: "P005",
    startHour: 10, equipment: "RTU-03", orderType: "PM03", workCenter: "Elektrik Atölye"
  },
  {
    id: "WO-2024-021", title: "Seviye Sensörü Temizliği", description: "LT-105 ultrasonik seviye sensörü temizliği",
    priority: "low", status: "assigned", duration: 2, requiredSkill: "Enstrümantasyon",
    location: "Atık Su Tankı", plannedDate: "2026-05-08", assignedTo: "P003",
    startHour: 15, equipment: "LT-105", orderType: "PM02", workCenter: "Enstrümantasyon"
  },
  {
    id: "WO-2024-022", title: "Pompa Kaplin Ayarı", description: "P-104 besi pompası lazer kaplin ayarı",
    priority: "medium", status: "assigned", duration: 3, requiredSkill: "Mekanik",
    location: "Kazan Dairesi", plannedDate: "2026-04-20", assignedTo: "P006",
    startHour: 9, equipment: "P-104", orderType: "PM01", workCenter: "Mekanik Atölye"
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
  },
  {
    id: "A-MOCK-001", workOrderId: "WO-2024-001", personnelId: "P001",
    date: "2026-07-01", startHour: 9, duration: 4, status: "completed",
    title: "Pompa Bakımı", priority: "high", equipment: "P-101"
  },
  {
    id: "A-MOCK-002", workOrderId: "WO-2024-002", personnelId: "P002",
    date: "2026-07-02", startHour: 10, duration: 3, status: "completed",
    title: "Elektrik Pano Kontrolü", priority: "critical", equipment: "MCC-05"
  },
  {
    id: "A-MOCK-003", workOrderId: "WO-2024-003", personnelId: "P003",
    date: "2026-07-03", startHour: 14, duration: 2, status: "confirmed",
    title: "Vana Değişimi", priority: "medium", equipment: "V-203"
  },
  {
    id: "A-MOCK-004", workOrderId: "WO-2024-004", personnelId: "P004",
    date: "2026-04-12", startHour: 11, duration: 5, status: "pending",
    title: "PLC Yazılım Güncelleme", priority: "medium", equipment: "PLC-01"
  },
  {
    id: "A-MOCK-005", workOrderId: "WO-2024-014", personnelId: "P002",
    date: "2026-06-10", startHour: 8, duration: 3, status: "completed",
    title: "Rulman Değişimi", priority: "high", equipment: "FAN-02"
  },
  {
    id: "A-MOCK-006", workOrderId: "WO-2024-015", personnelId: "P005",
    date: "2026-06-12", startHour: 13, duration: 4, status: "completed",
    title: "Aydınlatma Revizyonu", priority: "low", equipment: "LGT-09"
  },
  {
    id: "A-MOCK-007", workOrderId: "WO-2024-016", personnelId: "P003",
    date: "2026-07-17", startHour: 10, duration: 2, status: "confirmed",
    title: "Kalibrasyon Çalışması", priority: "medium", equipment: "TT-302"
  },
  {
    id: "A-MOCK-008", workOrderId: "WO-2024-017", personnelId: "P004",
    date: "2026-07-18", startHour: 9, duration: 3, status: "confirmed",
    title: "Hava Sızıntısı Onarımı", priority: "high", equipment: "AIR-05"
  },
  {
    id: "A-MOCK-009", workOrderId: "WO-2024-018", personnelId: "P001",
    date: "2026-07-20", startHour: 8, duration: 6, status: "confirmed",
    title: "Yıllık Trafo Testi", priority: "critical", equipment: "TR-02"
  },
  {
    id: "A-MOCK-010", workOrderId: "WO-2024-019", personnelId: "P002",
    date: "2026-07-22", startHour: 13, duration: 4, status: "confirmed",
    title: "Bant Konveyör Revizyonu", priority: "high", equipment: "CVY-104"
  },
  {
    id: "A-MOCK-011", workOrderId: "WO-2024-020", personnelId: "P005",
    date: "2026-07-25", startHour: 10, duration: 3, status: "confirmed",
    title: "SCADA Haberleşme Kontrolü", priority: "medium", equipment: "RTU-03"
  },
  {
    id: "A-MOCK-012", workOrderId: "WO-2024-021", personnelId: "P003",
    date: "2026-05-08", startHour: 15, duration: 2, status: "confirmed",
    title: "Seviye Sensörü Temizliği", priority: "low", equipment: "LT-105"
  },
  {
    id: "A-MOCK-013", workOrderId: "WO-2024-022", personnelId: "P006",
    date: "2026-04-20", startHour: 9, duration: 3, status: "confirmed",
    title: "Pompa Kaplin Ayarı", priority: "medium", equipment: "P-104"
  }
];

export const initialLeaveRecords: LeaveRecord[] = [
  { id: "L001", personnelId: "P001", startDate: "2026-07-06", endDate: "2026-07-08" },
  { id: "L002", personnelId: "P002", startDate: "2026-07-02", endDate: "2026-07-04" },
  { id: "L003", personnelId: "P003", startDate: "2026-07-10", endDate: "2026-07-12" },
  { id: "L004", personnelId: "P002", startDate: "2026-07-07", endDate: "2026-07-13" }, // Mehmet Kara (Demir) has 7 days of leave from 7th to 13th
];

export const initialCalendars: PlanningCalendar[] = [
  { id: "C001", name: "A Planı", startDate: "2026-07-01", endDate: "2026-07-13", workOrderIds: ["WO-2024-001", "WO-2024-002", "WO-2024-003"] }
];

