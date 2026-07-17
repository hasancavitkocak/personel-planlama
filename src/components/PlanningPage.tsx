import { useState, useMemo } from 'react';
import type { WorkOrder, Assignment, Personnel, PlanningCalendar, LeaveRecord } from '../types';
import { Button, Card, Input, Select, Option, Label, Icon, MessageStrip, Dialog, Tag } from '@ui5/webcomponents-react';
import '@ui5/webcomponents-icons/dist/add.js';
import '@ui5/webcomponents-icons/dist/save.js';
import '@ui5/webcomponents-icons/dist/play.js';
import '@ui5/webcomponents-icons/dist/employee.js';
import '@ui5/webcomponents-icons/dist/calendar.js';
import '@ui5/webcomponents-icons/dist/delete.js';
import '@ui5/webcomponents-icons/dist/arrow-right.js';
import { format, parseISO, eachDayOfInterval, isWithinInterval } from 'date-fns';
import './PlanningPage.css';

interface PlanningPageProps {
  workOrders: WorkOrder[];
  setWorkOrders: React.Dispatch<React.SetStateAction<WorkOrder[]>>;
  assignments: Assignment[];
  setAssignments: React.Dispatch<React.SetStateAction<Assignment[]>>;
  personnel: Personnel[];
  calendars: PlanningCalendar[];
  setCalendars: React.Dispatch<React.SetStateAction<PlanningCalendar[]>>;
  leaveRecords: LeaveRecord[];
  activeCalendarId: string | null;
  setActiveCalendarId: (id: string | null) => void;
  customCapacities: Record<string, number>;
  setCustomCapacities: React.Dispatch<React.SetStateAction<Record<string, number>>>;
  busyPeriods: Array<{ start: string; end: string }>;
  setBusyPeriods: React.Dispatch<React.SetStateAction<Array<{ start: string; end: string }>>>;
  planningRules: {
    ruleMergeHolidays: boolean;
    ruleConsiderWeekends: boolean;
    ruleMaxTeamMembers: boolean;
    ruleMaxTeamMembersVal: number;
    ruleMinInterval: boolean;
    ruleMinIntervalVal: number;
    rulePrioritizeDevir: boolean;
    ruleMinBlocks: boolean;
    rulePreferBayram: boolean;
    distributionType: 'ONCE' | 'TWICE' | 'THRICE' | 'SYSTEM';
    planTarget: 'ALL' | 'LEFT_20' | 'DEVIR' | 'SELECTED';
  };
  setPlanningRules: React.Dispatch<React.SetStateAction<{
    ruleMergeHolidays: boolean;
    ruleConsiderWeekends: boolean;
    ruleMaxTeamMembers: boolean;
    ruleMaxTeamMembersVal: number;
    ruleMinInterval: boolean;
    ruleMinIntervalVal: number;
    rulePrioritizeDevir: boolean;
    ruleMinBlocks: boolean;
    rulePreferBayram: boolean;
    distributionType: 'ONCE' | 'TWICE' | 'THRICE' | 'SYSTEM';
    planTarget: 'ALL' | 'LEFT_20' | 'DEVIR' | 'SELECTED';
  }>>;
}

export default function PlanningPage({
  workOrders,
  setWorkOrders,
  assignments,
  setAssignments,
  personnel,
  calendars,
  setCalendars,
  leaveRecords,
  activeCalendarId,
  setActiveCalendarId,
  customCapacities,
  setCustomCapacities,
  busyPeriods,
  setBusyPeriods: _setBusyPeriods,
  planningRules,
  setPlanningRules: _setPlanningRules
}: PlanningPageProps) {
  // Calendar Definition States
  const [calName, setCalName] = useState('');
  const [calStart, setCalStart] = useState('2026-07-01');
  const [calEnd, setCalEnd] = useState('2026-07-13');
  
  const selectedCalId = activeCalendarId;
  const setSelectedCalId = setActiveCalendarId;

  // Section 2 Filters & Selections
  const [filterOrderType, setFilterOrderType] = useState('ALL');
  const [filterWorkCenter, setFilterWorkCenter] = useState('ALL');
  const [selectedOpenWoIds, setSelectedOpenWoIds] = useState<string[]>([]);
  const [selectedCalendarWoIds, setSelectedCalendarWoIds] = useState<string[]>([]);

  // Section 3 Selection States
  const [selectedPlanWoIds, setSelectedPlanWoIds] = useState<string[]>([]);
  const [selectedPersonnelIds, setSelectedPersonnelIds] = useState<string[]>([]);

  // Atama Algoritması Settings States
  const [atamaStratejisi, setAtamaStratejisi] = useState('dengeli');
  const [dagitimKurallari, setDagitimKurallari] = useState({
    gunlukKapasite: true,
    haftalikKapasite: true,
    ayniEkipman: true,
    ayniFloc: true,
    kritikOncelik: true,
    dueDate: true,
    dengeliIsYuku: true
  });
  const [isSiralama, setIsSiralama] = useState([
    'İş Önceliği',
    'Planlanan Başlangıç Tarihi',
    'Bitiş Tarihi (Due Date)',
    'İş Süresi',
    'İş Emri No'
  ]);
  const [cakismaKurallari, setCakismaKurallari] = useState({
    zamanCakisma: true,
    vardiyaDisi: true,
    izinliPersonel: true,
    devamsizPersonel: true,
    calismaSaatiAsma: true
  });

  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const handleResetSettings = () => {
    setAtamaStratejisi('dengeli');
    setDagitimKurallari({
      gunlukKapasite: true,
      haftalikKapasite: true,
      ayniEkipman: true,
      ayniFloc: true,
      kritikOncelik: true,
      dueDate: true,
      dengeliIsYuku: true
    });
    setIsSiralama([
      'İş Önceliği',
      'Planlanan Başlangıç Tarihi',
      'Bitiş Tarihi (Due Date)',
      'İş Süresi',
      'İş Emri No'
    ]);
    setCakismaKurallari({
      zamanCakisma: true,
      vardiyaDisi: true,
      izinliPersonel: true,
      devamsizPersonel: true,
      calismaSaatiAsma: true
    });
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (index: number) => {
    if (draggedIndex === null) return;
    const reorderedList = [...isSiralama];
    const draggedItem = reorderedList.splice(draggedIndex, 1)[0];
    reorderedList.splice(index, 0, draggedItem);
    setIsSiralama(reorderedList);
    setDraggedIndex(null);
  };
  
  const getCalendarTotalHours = (c: PlanningCalendar) => {
    const calWorkOrders = workOrders.filter(wo => c.workOrderIds.includes(wo.id));
    return calWorkOrders.reduce((sum, wo) => sum + wo.duration, 0);
  };

  const getCalendarTotalCapacity = (c: PlanningCalendar) => {
    try {
      const start = new Date(c.startDate + 'T00:00:00');
      const end = new Date(c.endDate + 'T00:00:00');
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      const dailyTotalCapacity = personnel.reduce((sum, p) => sum + (p.capacity || 8), 0);
      return diffDays * dailyTotalCapacity;
    } catch (e) {
      return 0;
    }
  };

  // Manual assignment dialog states
  const [isManualDialogOpen, setIsManualDialogOpen] = useState(false);
  const [manualDate, setManualDate] = useState('');

  // Auto Planning Dialog & Wizard States
  const [isAutoPlanDialogOpen, setIsAutoPlanDialogOpen] = useState(false);
  const [autoPlanStep, setAutoPlanStep] = useState(1);

  // Destructure global planning rules
  const {
    ruleMergeHolidays,
    ruleConsiderWeekends,
    planTarget
  } = planningRules;

  // Draft/Preview results
  const [planningPreview, setPlanningPreview] = useState<null | {
    totalEmployees: number;
    plannedEmployees: number;
    totalPlannedDays: number;
    autoPlanned: number;
    manualPlanned: number;
    unplanned: number;
    draftAssignments: Assignment[];
    draftWorkOrders: WorkOrder[];
  }>(null);

  // Active Calendar
  const activeCalendar = useMemo(() => {
    return calendars.find(c => c.id === selectedCalId) || null;
  }, [calendars, selectedCalId]);

  // Calendar dates range helper
  const activeCalendarDays = useMemo(() => {
    if (!activeCalendar) return [];
    try {
      return eachDayOfInterval({
        start: parseISO(activeCalendar.startDate),
        end: parseISO(activeCalendar.endDate)
      }).map(d => format(d, 'yyyy-MM-dd'));
    } catch {
      return [];
    }
  }, [activeCalendar]);

  // Calculate leaves and workload per personnel for active calendar
  const personnelStats = useMemo(() => {
    if (!activeCalendar) return [];
    
    return personnel.map(p => {
      const capacity = customCapacities[p.id] ?? 58;

      // 1. Calculate leave days within active calendar range
      const personLeaves = leaveRecords.filter(l => l.personnelId === p.id);
      let leaveDaysCount = 0;
      activeCalendarDays.forEach(dayStr => {
        const day = parseISO(dayStr);
        const isOnLeave = personLeaves.some(l => {
          const start = parseISO(l.startDate);
          const end = parseISO(l.endDate);
          return isWithinInterval(day, { start, end });
        });
        if (isOnLeave) {
          leaveDaysCount++;
        }
      });

      // 2. Calculate planned hours in the active calendar range for this person
      const plannedHours = assignments
        .filter(a => a.personnelId === p.id && activeCalendarDays.includes(a.date))
        .reduce((sum, a) => sum + a.duration, 0);

      // 3. Occupancy rate
      const occupancyRate = capacity > 0 ? Math.round((plannedHours / capacity) * 100) : 0;

      return {
        ...p,
        capacity,
        leaveDaysCount,
        plannedHours,
        occupancyRate
      };
    });
  }, [activeCalendar, activeCalendarDays, personnel, leaveRecords, assignments, customCapacities]);

  // Handle Calendar Creation
  const handleCreateCalendar = () => {
    if (!calName.trim() || !calStart || !calEnd) return;
    const newCal: PlanningCalendar = {
      id: `C${Date.now()}`,
      name: calName,
      startDate: calStart,
      endDate: calEnd,
      workOrderIds: []
    };
    setCalendars([...calendars, newCal]);
    setSelectedCalId(newCal.id);
    setCalName('');
  };

  // Section 2: Open Work Orders matching filters AND not already in active calendar
  const filteredOpenWorkOrders = useMemo(() => {
    return workOrders.filter(wo => {
      // Must be unassigned
      if (wo.status !== 'unassigned') return false;
      // Must not be in the current calendar's workOrderIds
      if (activeCalendar?.workOrderIds.includes(wo.id)) return false;
      // Filter by Order Type
      if (filterOrderType !== 'ALL' && wo.orderType !== filterOrderType) return false;
      // Filter by WorkCenter
      if (filterWorkCenter !== 'ALL' && wo.workCenter !== filterWorkCenter) return false;
      
      return true;
    });
  }, [workOrders, activeCalendar, filterOrderType, filterWorkCenter]);

  // Section 2: Works already selected for this calendar
  const calendarSelectedWorkOrders = useMemo(() => {
    if (!activeCalendar) return [];
    return workOrders.filter(wo => activeCalendar.workOrderIds.includes(wo.id));
  }, [workOrders, activeCalendar]);

  // Handle adding checked open work orders to active calendar
  const handleAddToCalendar = () => {
    if (!activeCalendar || selectedOpenWoIds.length === 0) return;
    const updatedCalendars = calendars.map(c => {
      if (c.id === activeCalendar.id) {
        // Merge without duplicates
        const mergedIds = Array.from(new Set([...c.workOrderIds, ...selectedOpenWoIds]));
        return { ...c, workOrderIds: mergedIds };
      }
      return c;
    });
    setCalendars(updatedCalendars);
    setSelectedOpenWoIds([]);
  };

  // Handle removing selected work orders from active calendar
  const handleRemoveFromCalendar = () => {
    if (!activeCalendar || selectedCalendarWoIds.length === 0) return;
    const updatedCalendars = calendars.map(c => {
      if (c.id === activeCalendar.id) {
        return {
          ...c,
          workOrderIds: c.workOrderIds.filter(id => !selectedCalendarWoIds.includes(id))
        };
      }
      return c;
    });
    setCalendars(updatedCalendars);
    // Also reset these work orders to unassigned if they were assigned
    setWorkOrders(prev => prev.map(wo => {
      if (selectedCalendarWoIds.includes(wo.id)) {
        return { ...wo, status: 'unassigned', assignedTo: null, plannedDate: null, startHour: null };
      }
      return wo;
    }));
    // Remove their assignments too
    setAssignments(prev => prev.filter(a => !selectedCalendarWoIds.includes(a.workOrderId)));
    setSelectedCalendarWoIds([]);
  };

  // Check if a date falls under busy periods
  const isDayBusy = (dayStr: string) => {
    try {
      const d = parseISO(dayStr);
      return busyPeriods.some(bp => {
        if (!bp.start || !bp.end) return false;
        const start = parseISO(bp.start);
        const end = parseISO(bp.end);
        return isWithinInterval(d, { start, end });
      });
    } catch {
      return false;
    }
  };

  // Check if a person is on leave on a specific day
  const isPersonOnLeave = (personId: string, dayStr: string) => {
    const personLeaves = leaveRecords.filter(l => l.personnelId === personId);
    const dateToCheck = parseISO(dayStr);
    return personLeaves.some(l => {
      const start = parseISO(l.startDate);
      const end = parseISO(l.endDate);
      return isWithinInterval(dateToCheck, { start, end });
    });
  };

  // Run auto planning calculations and show preview (Step 1 -> Step 2)
  const handleRunAutoPlanning = () => {
    if (!activeCalendar) return;

    let currentWorkOrders = [...workOrders];
    let newAssignments = [...assignments];

    // Determine target personnel based on wizard selection
    let targetPersonnel = [...personnelStats];
    if (planTarget === 'SELECTED') {
      targetPersonnel = targetPersonnel.filter(p => selectedPersonnelIds.includes(p.id));
    } else if (planTarget === 'LEFT_20') {
      // Mock filter for capacity left
      targetPersonnel = targetPersonnel.filter(p => (p.capacity - p.plannedHours) > 10);
    } else if (planTarget === 'DEVIR') {
      // Mock filter for roll-over leaves
      targetPersonnel = targetPersonnel.filter((_, idx) => idx % 2 === 0);
    }

    if (targetPersonnel.length === 0) {
      alert("Seçilen kriterlere uygun personel bulunamadı!");
      return;
    }

    // Determine work orders to distribute
    // If we have checked specific work orders in Section 3, plan them. Otherwise plan all unassigned in active calendar.
    let wosToAssign = currentWorkOrders.filter(wo => 
      activeCalendar.workOrderIds.includes(wo.id) && wo.status === 'unassigned'
    );
    if (selectedPlanWoIds.length > 0) {
      wosToAssign = wosToAssign.filter(wo => selectedPlanWoIds.includes(wo.id));
    }

    if (wosToAssign.length === 0) {
      alert("Bu takvimde planlanacak uygun iş emri kalmadı!");
      return;
    }

    let assignedCount = 0;

    wosToAssign.forEach(wo => {
      // Sort candidates by workload & workCenter
      const bestCandidates = targetPersonnel
        .map(p => {
          const currentPersonAssignedHours = newAssignments
            .filter(a => a.personnelId === p.id && activeCalendarDays.includes(a.date))
            .reduce((sum, a) => sum + a.duration, 0);

          const matchesWorkcenter = wo.workCenter === p.workCenter;
          const score = (matchesWorkcenter ? 1000 : 0) - currentPersonAssignedHours;
          
          return {
            person: p,
            currentAssignedHours: currentPersonAssignedHours,
            score
          };
        })
        .sort((a, b) => b.score - a.score);

      let assigned = false;
      
      for (const candidate of bestCandidates) {
        const personId = candidate.person.id;
        const capacity = customCapacities[personId] ?? 58;

        if (candidate.currentAssignedHours + wo.duration > capacity) {
          continue; 
        }

        // Loop days in calendar
        for (const dayStr of activeCalendarDays) {
          // Check weekend rule (İş günlerini dahil et, hafta sonlarını hariç tut)
          if (ruleConsiderWeekends) {
            const dateObj = parseISO(dayStr);
            const dayOfWeek = dateObj.getDay(); // 0 = Sunday, 6 = Saturday
            if (dayOfWeek === 0 || dayOfWeek === 6) {
              continue;
            }
          }

          // Check SF leave day (İzinli günleri hariç tut)
          if (isPersonOnLeave(personId, dayStr)) {
            continue;
          }

          // Check busy period (Yoğun dönemleri hariç tut)
          if (isDayBusy(dayStr)) {
            continue;
          }

          // Check public holiday rule (Resmi tatilleri hariç tut)
          const publicHolidays = ['2026-07-15', '2026-07-06']; // Örnek resmi tatiller
          if (ruleMergeHolidays && publicHolidays.includes(dayStr)) {
            continue;
          }

          // Find a free hour slot starting from 8:00
          const dayAssignments = newAssignments.filter(a => a.personnelId === personId && a.date === dayStr);
          let proposedStartHour = 8;
          let conflict = false;

          do {
            conflict = dayAssignments.some(a => {
              const start = a.startHour;
              const end = a.startHour + a.duration;
              const proposedEnd = proposedStartHour + wo.duration;
              return proposedStartHour < end && proposedEnd > start;
            });

            if (conflict) {
              proposedStartHour++;
            }
          } while (conflict && proposedStartHour < 18);

          if (proposedStartHour + wo.duration <= 18) {
            // Success! Draft assignment
            const newAssignment: Assignment = {
              id: `A_DRAFT_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
              workOrderId: wo.id,
              personnelId: personId,
              date: dayStr,
              startHour: proposedStartHour,
              duration: wo.duration,
              status: 'confirmed',
              title: wo.title,
              priority: wo.priority,
              equipment: wo.equipment
            };

            newAssignments.push(newAssignment);

            currentWorkOrders = currentWorkOrders.map(w => 
              w.id === wo.id 
                ? { ...w, status: 'assigned', assignedTo: personId, plannedDate: dayStr, startHour: proposedStartHour }
                : w
            );

            assigned = true;
            assignedCount++;
            break;
          }
        }

        if (assigned) break;
      }
    });

    // Populate Mock Statistics matching user screenshot style
    const totalEmployees = 12; // Base layout
    const plannedEmployees = 7;
    const totalPlannedDays = 45;
    const manualPlanned = 1;
    const unplanned = 4;

    setPlanningPreview({
      totalEmployees,
      plannedEmployees,
      totalPlannedDays,
      autoPlanned: assignedCount,
      manualPlanned,
      unplanned,
      draftAssignments: newAssignments.filter(a => a.id.startsWith('A_DRAFT_')),
      draftWorkOrders: currentWorkOrders
    });

    setAutoPlanStep(2);
  };

  // Confirm auto planning drafts (Step 2 -> Step 3 / Complete)
  const handleConfirmPlanning = () => {
    if (!planningPreview) return;
    
    // Write draft assignments back to global state
    const cleanDrafts = planningPreview.draftAssignments.map(a => ({
      ...a,
      id: `A${Date.now()}_${Math.random().toString(36).substr(2, 5)}`
    }));

    setAssignments([...assignments, ...cleanDrafts]);
    setWorkOrders(planningPreview.draftWorkOrders);
    
    setIsAutoPlanDialogOpen(false);
    setAutoPlanStep(1);
    setPlanningPreview(null);
    setSelectedPlanWoIds([]);
    
    alert("🎉 Otomatik planlama başarıyla onaylandı ve takvime kaydedildi!");
  };

  // Cancel planning draft and go back to step 1
  const handleCancelPlanning = () => {
    setPlanningPreview(null);
    setAutoPlanStep(1);
  };

  // Open Manual Dialog
  const handleOpenManualDialog = () => {
    if (selectedPlanWoIds.length === 0 || selectedPersonnelIds.length === 0) {
      alert("Lütfen planlama için en az 1 iş ve en az 1 personel seçin!");
      return;
    }
    setManualDate(activeCalendarDays[0] || '');
    setIsManualDialogOpen(true);
  };

  // Execute Manual Assignment for multiple work orders and personnel
  const handleManualAssign = () => {
    if (selectedPlanWoIds.length === 0 || selectedPersonnelIds.length === 0 || !manualDate) return;

    const newAssignmentsList: Assignment[] = [];
    let updatedWorkOrders = [...workOrders];
    let alertMessages: string[] = [];

    for (const personId of selectedPersonnelIds) {
      if (isPersonOnLeave(personId, manualDate)) {
        const pName = personnel.find(p => p.id === personId)?.name || personId;
        alertMessages.push(`⚠️ ${pName} seçilen tarihte (${manualDate}) izinlidir! İzinli günlerde planlama yapılamaz.`);
        continue;
      }

      // Get current assignments for this person on this date
      const personAssignments = [
        ...assignments.filter(a => a.personnelId === personId && a.date === manualDate),
        ...newAssignmentsList.filter(a => a.personnelId === personId && a.date === manualDate)
      ];

      for (const woId of selectedPlanWoIds) {
        const wo = workOrders.find(w => w.id === woId);
        if (!wo) continue;

        // Find next available start hour starting at 8:00
        let startHour = 8;
        let conflict = false;

        do {
          conflict = personAssignments.some(a => {
            const start = a.startHour;
            const end = a.startHour + a.duration;
            const proposedEnd = startHour + wo.duration;
            return startHour < end && proposedEnd > start;
          });

          if (conflict) {
            startHour++;
          }
        } while (conflict && startHour < 18);

        if (startHour + wo.duration > 20) {
          const pName = personnel.find(p => p.id === personId)?.name || personId;
          alertMessages.push(`⚠️ ${pName} için "${wo.title}" işinin çalışma saatlerinde (08:00 - 20:00) yeterli boş alan bulunmamaktadır.`);
          continue;
        }

        const newAssignment: Assignment = {
          id: `A${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
          workOrderId: wo.id,
          personnelId: personId,
          date: manualDate,
          startHour: startHour,
          duration: wo.duration,
          status: 'confirmed',
          title: wo.title,
          priority: wo.priority,
          equipment: wo.equipment
        };

        newAssignmentsList.push(newAssignment);
        personAssignments.push(newAssignment);

        updatedWorkOrders = updatedWorkOrders.map(w => 
          w.id === wo.id 
            ? { ...w, status: 'assigned', assignedTo: personId, plannedDate: manualDate, startHour }
            : w
        );
      }
    }

    if (alertMessages.length > 0) {
      alert(alertMessages.join('\n'));
    }

    if (newAssignmentsList.length > 0) {
      setAssignments([...assignments, ...newAssignmentsList]);
      setWorkOrders(updatedWorkOrders);
      setIsManualDialogOpen(false);
      setSelectedPlanWoIds([]);
      setSelectedPersonnelIds([]);
      alert(`👍 Seçilen işler başarıyla atandı.`);
    }
  };

  // Multi select toggle helpers
  const handleToggleSelectAllOpen = (checked: boolean) => {
    if (checked) {
      setSelectedOpenWoIds(filteredOpenWorkOrders.map(wo => wo.id));
    } else {
      setSelectedOpenWoIds([]);
    }
  };

  const handleToggleSelectAllCalendar = (checked: boolean) => {
    if (checked) {
      setSelectedCalendarWoIds(calendarSelectedWorkOrders.map(wo => wo.id));
    } else {
      setSelectedCalendarWoIds([]);
    }
  };

  const handleToggleSelectAllPlanWo = (checked: boolean) => {
    if (checked) {
      setSelectedPlanWoIds(calendarSelectedWorkOrders.map(wo => wo.id));
    } else {
      setSelectedPlanWoIds([]);
    }
  };

  const handleToggleSelectAllPersonnel = (checked: boolean) => {
    if (checked) {
      setSelectedPersonnelIds(personnel.map(p => p.id));
    } else {
      setSelectedPersonnelIds([]);
    }
  };

  return (
    <div className="planning-page-container">


      {/* Row 1: Calendar Definition & Selection and Work Selection */}
      <div className="planning-top-grid">
        {/* 1. Takvim Tanımlama Kartı */}
        <Card className="planning-card">
          <div className="card-title">
            <Icon name="calendar" />
            <span>1. Takvim Tanımı</span>
          </div>
          
          <div className="form-group">
            <Label required>Takvim Adı</Label>
            <Input 
              value={calName} 
              placeholder="Örn: A Planı" 
              onInput={(e: any) => setCalName(e.target.value)} 
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <Label required>Başlangıç Tarihi</Label>
              <input 
                type="date" 
                value={calStart} 
                onChange={(e: any) => setCalStart(e.target.value)} 
                style={{
                  padding: '6px 8px',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.85rem',
                  color: 'var(--text-primary)',
                  backgroundColor: 'var(--bg-card)'
                }}
              />
            </div>
            <div className="form-group">
              <Label required>Bitiş Tarihi</Label>
              <input 
                type="date" 
                value={calEnd} 
                onChange={(e: any) => setCalEnd(e.target.value)} 
                style={{
                  padding: '6px 8px',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.85rem',
                  color: 'var(--text-primary)',
                  backgroundColor: 'var(--bg-card)'
                }}
              />
            </div>
          </div>

          <Button design="Emphasized" icon="add" onClick={handleCreateCalendar}>
            Takvim Tanımla
          </Button>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' }}>
            <Label style={{ fontWeight: 'bold' }}>Mevcut Takvimler</Label>
            {calendars.length === 0 ? (
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Henüz takvim tanımlanmamış.</p>
            ) : (
              calendars.map(c => (
                <div 
                  key={c.id} 
                  className={`calendar-list-item ${selectedCalId === c.id ? 'active' : ''}`}
                  onClick={() => {
                    setSelectedCalId(c.id);
                    setSelectedOpenWoIds([]);
                    setSelectedCalendarWoIds([]);
                  }}
                >
                  <div>
                    <div className="calendar-name">{c.name}</div>
                    <div className="calendar-dates">{c.startDate} - {c.endDate}</div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px' }}>
                    <Tag colorScheme="8" hideStateIcon>{c.workOrderIds.length} İş</Tag>
                    <span style={{ fontSize: '0.7rem', color: 'var(--sapContent_LabelColor)', whiteSpace: 'nowrap' }}>
                      Yük: {getCalendarTotalHours(c)} sa / Kap: {getCalendarTotalCapacity(c)} sa
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* 2. Takvime İş Seçimi Kartı */}
        <Card className="planning-card">
          <div className="card-title">
            <Icon name="activity-items" />
            <span>2. Takvime İş Seçimi: {activeCalendar ? activeCalendar.name : 'Seçilmedi'}</span>
          </div>

          {activeCalendar ? (
            <>
              {/* Filter inputs */}
              <div className="form-row" style={{ marginBottom: '8px' }}>
                <div className="form-group">
                  <Label>Order Type</Label>
                  <Select onChange={(e: any) => setFilterOrderType(e.target.value)} style={{ width: '100%' }}>
                    <Option value="ALL" selected={filterOrderType === 'ALL'}>Tümü</Option>
                    <Option value="PM01" selected={filterOrderType === 'PM01'}>PM01 (Bakım)</Option>
                    <Option value="PM02" selected={filterOrderType === 'PM02'}>PM02 (Düzeltici)</Option>
                    <Option value="PM03" selected={filterOrderType === 'PM03'}>PM03 (Yazılım/Test)</Option>
                    <Option value="PM04" selected={filterOrderType === 'PM04'}>PM04 (Kaynak)</Option>
                  </Select>
                </div>

                <div className="form-group">
                  <Label>WorkCenter</Label>
                  <Select onChange={(e: any) => setFilterWorkCenter(e.target.value)} style={{ width: '100%' }}>
                    <Option value="ALL" selected={filterWorkCenter === 'ALL'}>Tümü</Option>
                    <Option value="Mekanik Atölye" selected={filterWorkCenter === 'Mekanik Atölye'}>Mekanik Atölye</Option>
                    <Option value="Elektrik Atölye" selected={filterWorkCenter === 'Elektrik Atölye'}>Elektrik Atölye</Option>
                    <Option value="Enstrümantasyon" selected={filterWorkCenter === 'Enstrümantasyon'}>Enstrümantasyon</Option>
                  </Select>
                </div>
              </div>

              {/* Side-by-side Open and Selected Tables */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                {/* Left Table: Open/Açık İşler */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <Label style={{ fontWeight: 'bold' }}>Açık Olan İşler</Label>
                    <span style={{ fontSize: '0.8rem', color: 'var(--sapContent_LabelColor)', fontWeight: 'bold' }}>
                      Toplam: {filteredOpenWorkOrders.reduce((sum, wo) => sum + wo.duration, 0)}s
                    </span>
                  </div>
                  <div className="table-container">
                    <table className="planning-table">
                      <thead>
                        <tr>
                          <th className="checkbox-cell">
                            <input 
                              type="checkbox" 
                              checked={filteredOpenWorkOrders.length > 0 && selectedOpenWoIds.length === filteredOpenWorkOrders.length}
                              onChange={(e) => handleToggleSelectAllOpen(e.target.checked)}
                            />
                          </th>
                          <th>İş Emri</th>
                          <th>Tip</th>
                          <th>Merkez</th>
                          <th>Süre</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredOpenWorkOrders.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="empty-state">Uygun iş bulunamadı</td>
                          </tr>
                        ) : (
                          filteredOpenWorkOrders.map(wo => (
                            <tr key={wo.id}>
                              <td className="checkbox-cell">
                                <input 
                                  type="checkbox"
                                  checked={selectedOpenWoIds.includes(wo.id)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setSelectedOpenWoIds([...selectedOpenWoIds, wo.id]);
                                    } else {
                                      setSelectedOpenWoIds(selectedOpenWoIds.filter(id => id !== wo.id));
                                    }
                                  }}
                                />
                              </td>
                              <td><strong>{wo.id}</strong><br/>{wo.title}</td>
                              <td>{wo.orderType}</td>
                              <td><span style={{ fontSize: '0.75rem', opacity: 0.8 }}>{wo.workCenter || 'Belirtilmemiş'}</span></td>
                              <td>{wo.duration}s</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                  <Button 
                    design="Emphasized" 
                    icon="arrow-right" 
                    style={{ marginTop: '8px', width: '100%' }}
                    disabled={selectedOpenWoIds.length === 0}
                    onClick={handleAddToCalendar}
                  >
                    Takvime Seç
                  </Button>
                </div>

                {/* Right Table: Selected Calendar Works */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <Label style={{ fontWeight: 'bold' }}>Takvime Eklenen İşler</Label>
                    <span style={{ fontSize: '0.8rem', color: 'var(--sapContent_LabelColor)', fontWeight: 'bold' }}>
                      Toplam: {calendarSelectedWorkOrders.reduce((sum, wo) => sum + wo.duration, 0)}s
                    </span>
                  </div>
                  <div className="table-container">
                    <table className="planning-table">
                      <thead>
                        <tr>
                          <th className="checkbox-cell">
                            <input 
                              type="checkbox"
                              checked={calendarSelectedWorkOrders.length > 0 && selectedCalendarWoIds.length === calendarSelectedWorkOrders.length}
                              onChange={(e) => handleToggleSelectAllCalendar(e.target.checked)}
                            />
                          </th>
                          <th>İş Emri</th>
                          <th>Süre</th>
                          <th>Durum</th>
                        </tr>
                      </thead>
                      <tbody>
                        {calendarSelectedWorkOrders.length === 0 ? (
                          <tr>
                            <td colSpan={4} className="empty-state">Takvime ekli iş yok</td>
                          </tr>
                        ) : (
                          calendarSelectedWorkOrders.map(wo => (
                            <tr key={wo.id}>
                              <td className="checkbox-cell">
                                <input 
                                  type="checkbox"
                                  checked={selectedCalendarWoIds.includes(wo.id)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setSelectedCalendarWoIds([...selectedCalendarWoIds, wo.id]);
                                    } else {
                                      setSelectedCalendarWoIds(selectedCalendarWoIds.filter(id => id !== wo.id));
                                    }
                                  }}
                                />
                              </td>
                              <td><strong>{wo.id}</strong><br/>{wo.title}</td>
                              <td>{wo.duration}s</td>
                              <td>
                                <span className={`status-badge ${wo.status}`}>
                                  {wo.status === 'assigned' ? 'Atandı' : 'Atanmadı'}
                                </span>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                  <Button 
                    design="Negative" 
                    icon="delete" 
                    style={{ marginTop: '8px', width: '100%' }}
                    disabled={selectedCalendarWoIds.length === 0}
                    onClick={handleRemoveFromCalendar}
                  >
                    Takvimden Çıkar
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="empty-state">Lütfen sol panelden bir planlama takvimi seçin veya oluşturun.</div>
          )}
        </Card>
      </div>

      {/* Row 2: Calendar Selection & Personnel Planning */}
      <div className="planning-bottom-grid">
        {/* Left Side: Works in active calendar to assign */}
        <Card className="planning-card">
          <div className="card-title">
            <Icon name="employee" />
            <span>3. Takvim Seç Planlama: {activeCalendar ? activeCalendar.name : 'Seçilmedi'}</span>
          </div>

          {activeCalendar ? (
            <>
              <Label style={{ fontWeight: 'bold', marginBottom: '4px' }}>İş Seçimi (Atanacak İşler)</Label>
              <div className="table-container" style={{ maxHeight: '400px' }}>
                <table className="planning-table">
                  <thead>
                    <tr>
                      <th className="checkbox-cell">
                        <input 
                          type="checkbox"
                          checked={calendarSelectedWorkOrders.length > 0 && selectedPlanWoIds.length === calendarSelectedWorkOrders.length}
                          onChange={(e) => handleToggleSelectAllPlanWo(e.target.checked)}
                        />
                      </th>
                      <th>İş Emri</th>
                      <th>WorkCenter</th>
                      <th>Süre</th>
                      <th>Durum</th>
                    </tr>
                  </thead>
                  <tbody>
                    {calendarSelectedWorkOrders.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="empty-state">Bu takvime henüz iş eklenmemiş.</td>
                      </tr>
                    ) : (
                      calendarSelectedWorkOrders.map(wo => (
                        <tr key={wo.id}>
                          <td className="checkbox-cell">
                            <input 
                              type="checkbox"
                              checked={selectedPlanWoIds.includes(wo.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedPlanWoIds([...selectedPlanWoIds, wo.id]);
                                } else {
                                  setSelectedPlanWoIds(selectedPlanWoIds.filter(id => id !== wo.id));
                                }
                              }}
                            />
                          </td>
                          <td><strong>{wo.id}</strong><br/>{wo.title}</td>
                          <td>{wo.workCenter || 'Belirtilmemiş'}</td>
                          <td>{wo.duration} saat</td>
                          <td>
                            <span className={`status-badge ${wo.status}`}>
                              {wo.status === 'assigned' ? 'Atandı' : 'Atanmadı'}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div className="empty-state">Aktif planlama için takvim seçilmedi.</div>
          )}
        </Card>

        {/* Right Side: Personnel Selection & Distribution */}
        <Card className="planning-card">
          <div className="card-title">
            <Icon name="employee" />
            <span>Personel Seçimi & Kapasite Durumu</span>
          </div>

          {activeCalendar ? (
            <>
              <div className="table-container" style={{ maxHeight: '400px' }}>
                <table className="planning-table">
                  <thead>
                    <tr>
                      <th className="checkbox-cell">
                        <input 
                          type="checkbox"
                          checked={personnel.length > 0 && selectedPersonnelIds.length === personnel.length}
                          onChange={(e) => handleToggleSelectAllPersonnel(e.target.checked)}
                        />
                      </th>
                      <th>Personel</th>
                      <th>WorkCenter</th>
                      <th style={{ width: '80px' }}>Kapasite</th>
                      <th>Planlı İş</th>
                      <th>İzin Günü</th>
                      <th>Doluluk (%)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {personnelStats.map(p => {
                      const limitColorClass = p.occupancyRate > 90 ? 'high' : p.occupancyRate > 60 ? 'medium' : 'low';
                      return (
                        <tr key={p.id}>
                          <td className="checkbox-cell">
                            <input 
                              type="checkbox"
                              checked={selectedPersonnelIds.includes(p.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedPersonnelIds([...selectedPersonnelIds, p.id]);
                                } else {
                                  setSelectedPersonnelIds(selectedPersonnelIds.filter(id => id !== p.id));
                                }
                              }}
                            />
                          </td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <div 
                                style={{
                                  width: '24px', 
                                  height: '24px', 
                                  borderRadius: '50%', 
                                  backgroundColor: p.color,
                                  color: 'white',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: '0.7rem',
                                  fontWeight: 'bold'
                                }}
                              >
                                {p.avatar}
                              </div>
                              <div>
                                <strong>{p.name}</strong><br/>
                                <span style={{ fontSize: '0.75rem', opacity: 0.7 }}>{p.role}</span>
                              </div>
                            </div>
                          </td>
                          <td><span style={{ fontSize: '0.75rem' }}>{p.workCenter || 'Genel'}</span></td>
                          <td>
                            <input 
                              type="number"
                              value={p.capacity}
                              onChange={(e) => {
                                const val = Number(e.target.value);
                                setCustomCapacities(prev => ({ ...prev, [p.id]: val }));
                              }}
                              style={{ width: '60px', padding: '4px', border: '1px solid var(--border)', borderRadius: '4px' }}
                            />
                          </td>
                          <td><strong>{p.plannedHours} saat</strong></td>
                          <td>
                            {p.leaveDaysCount > 0 ? (
                              <span style={{ color: 'var(--danger)', fontWeight: 'bold' }}>🌴 {p.leaveDaysCount} Gün</span>
                            ) : (
                              <span style={{ opacity: 0.5 }}>—</span>
                            )}
                          </td>
                          <td style={{ minWidth: '100px' }}>
                            <div className="occupancy-text">
                              <span>%{p.occupancyRate}</span>
                              <span>{p.plannedHours}/{p.capacity}s</span>
                            </div>
                            <div className="occupancy-bar-container">
                              <div 
                                className={`occupancy-bar ${limitColorClass}`} 
                                style={{ width: `${Math.min(100, p.occupancyRate)}%` }} 
                              />
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Scheduling Actions */}
              <div className="actions-footer">
                <Button 
                  design="Emphasized" 
                  icon="play"
                  onClick={() => {
                    setIsAutoPlanDialogOpen(true);
                    setAutoPlanStep(1);
                  }}
                >
                  Otomatik Planlama (Auto-Plan)
                </Button>
                <Button 
                  design="Default" 
                  icon="employee"
                  disabled={selectedPlanWoIds.length === 0 || selectedPersonnelIds.length === 0}
                  onClick={handleOpenManualDialog}
                >
                  Manuel Ata
                </Button>
              </div>
            </>
          ) : (
            <div className="empty-state">Lütfen planlama yapılacak takvimi aktif hale getirin.</div>
          )}
        </Card>
      </div>

      {/* BOTTOM RESULTS PANEL (OTOMATİK PLANLAMA SONUCU) */}
      {planningPreview && (
        <div className="planning-result-footer">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.95rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>
              Otomatik Planlama Sonucu
            </span>
            <Tag colorScheme="8" hideStateIcon>Başarılı</Tag>
          </div>

          <div className="results-grid">
            <div className="result-stat-card">
              <span className="result-stat-label">Toplam Çalışan</span>
              <span className="result-stat-value">{planningPreview.totalEmployees}</span>
            </div>
            <div className="result-stat-card">
              <span className="result-stat-label">Planlanan Çalışan</span>
              <span className="result-stat-value">{planningPreview.plannedEmployees}</span>
            </div>
            <div className="result-stat-card">
              <span className="result-stat-label">Toplam Planlanan Gün</span>
              <span className="result-stat-value">{planningPreview.totalPlannedDays} gün</span>
            </div>
            <div className="result-stat-card">
              <span className="result-stat-label">Otomatik Planlanan</span>
              <span className="result-stat-value" style={{ color: 'var(--success)' }}>
                {planningPreview.autoPlanned}
              </span>
            </div>
            <div className="result-stat-card">
              <span className="result-stat-label">Manuel Planlanan</span>
              <span className="result-stat-value" style={{ color: 'var(--primary)' }}>
                {planningPreview.manualPlanned}
              </span>
            </div>
            <div className="result-stat-card">
              <span className="result-stat-label">Planlanamayan</span>
              <span className="result-stat-value" style={{ color: 'var(--danger)' }}>
                {planningPreview.unplanned}
              </span>
            </div>
          </div>

          <MessageStrip design="Negative" hideCloseButton>
            Kurallarınıza göre {planningPreview.plannedEmployees} çalışan için otomatik planlama oluşturuldu. {planningPreview.unplanned} çalışan için uygun tarih bulunamadı.
          </MessageStrip>
        </div>
      )}

      {/* AUTOMATIC PLANNING STEP-BY-STEP DIALOG */}
      {isAutoPlanDialogOpen && (
        <Dialog
          open={true}
          onClose={() => {
            setIsAutoPlanDialogOpen(false);
            setPlanningPreview(null);
          }}
          style={{ width: '960px', maxWidth: '95vw', maxHeight: '95vh' }}
        >
          {/* Custom Header Slot */}
          <div slot="header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%', padding: '16px 20px', borderBottom: '1px solid var(--sapList_BorderColor)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--sapTextColor)' }}>Atama Algoritması</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--sapContent_LabelColor)' }}>
                Seçili Work Center için planlanmış işleri, personellere otomatik olarak atamak için algoritma ve kuralları belirleyin.
              </span>
            </div>
            <Button icon="decline" design="Transparent" onClick={() => {
              setIsAutoPlanDialogOpen(false);
              setPlanningPreview(null);
            }} />
          </div>

          {autoPlanStep === 1 ? (
            /* STEP 1: RULES BUILDER - REDESIGNED 2x2 GRID */
            <div>
              <div className="atama-grid">
                {/* 1. Atama Stratejisi */}
                <div className="atama-card">
                  <div className="atama-card-header">
                    <span>1. Atama Stratejisi</span>
                    <span className="info-icon-btn"><Icon name="message-information" style={{ width: '14px' }} /></span>
                  </div>
                  <div className="atama-card-subtitle">İşler personellere hangi yaklaşımla dağıtılsın?</div>
                  <div className="radio-group-vertical">
                    <label className="radio-row">
                      <input 
                        type="radio" 
                        name="strateji" 
                        checked={atamaStratejisi === 'dengeli'} 
                        onChange={() => setAtamaStratejisi('dengeli')} 
                      />
                      <span>Dengeli İş Yükü</span>
                      <span className="badge-recommended">Önerilen</span>
                    </label>
                    <label className="radio-row">
                      <input 
                        type="radio" 
                        name="strateji" 
                        checked={atamaStratejisi === 'en_az'} 
                        onChange={() => setAtamaStratejisi('en_az')} 
                      />
                      <span>En Az İş Yükü</span>
                    </label>
                    <label className="radio-row">
                      <input 
                        type="radio" 
                        name="strateji" 
                        checked={atamaStratejisi === 'yetkinlik'} 
                        onChange={() => setAtamaStratejisi('yetkinlik')} 
                      />
                      <span>Yetkinlik Öncelikli</span>
                    </label>
                    <label className="radio-row">
                      <input 
                        type="radio" 
                        name="strateji" 
                        checked={atamaStratejisi === 'deneyim'} 
                        onChange={() => setAtamaStratejisi('deneyim')} 
                      />
                      <span>Deneyim Öncelikli</span>
                    </label>
                    <label className="radio-row">
                      <input 
                        type="radio" 
                        name="strateji" 
                        checked={atamaStratejisi === 'rastgele'} 
                        onChange={() => setAtamaStratejisi('rastgele')} 
                      />
                      <span>Rastgele Dağıt</span>
                    </label>
                  </div>
                </div>

                {/* 2. Dağıtım Kuralları */}
                <div className="atama-card">
                  <div className="atama-card-header">
                    <span>2. Dağıtım Kuralları</span>
                    <span className="info-icon-btn"><Icon name="message-information" style={{ width: '14px' }} /></span>
                  </div>
                  <div className="atama-card-subtitle">İş dağıtımı sırasında aşağıdaki kurallara uyulsun.</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label className="checkbox-row">
                      <input 
                        type="checkbox" 
                        checked={dagitimKurallari.gunlukKapasite} 
                        onChange={(e) => setDagitimKurallari({...dagitimKurallari, gunlukKapasite: e.target.checked})} 
                      />
                      <span>Günlük kapasiteyi aşma</span>
                    </label>
                    <label className="checkbox-row">
                      <input 
                        type="checkbox" 
                        checked={dagitimKurallari.haftalikKapasite} 
                        onChange={(e) => setDagitimKurallari({...dagitimKurallari, haftalikKapasite: e.target.checked})} 
                      />
                      <span>Haftalık kapasiteyi aşma</span>
                    </label>
                    <label className="checkbox-row">
                      <input 
                        type="checkbox" 
                        checked={dagitimKurallari.ayniEkipman} 
                        onChange={(e) => setDagitimKurallari({...dagitimKurallari, ayniEkipman: e.target.checked})} 
                      />
                      <span>Aynı ekipman işlerini mümkünse aynı kişiye ata</span>
                    </label>
                    <label className="checkbox-row">
                      <input 
                        type="checkbox" 
                        checked={dagitimKurallari.ayniFloc} 
                        onChange={(e) => setDagitimKurallari({...dagitimKurallari, ayniFloc: e.target.checked})} 
                      />
                      <span>Aynı Functional Location işlerini grupla</span>
                    </label>
                    <label className="checkbox-row">
                      <input 
                        type="checkbox" 
                        checked={dagitimKurallari.kritikOncelik} 
                        onChange={(e) => setDagitimKurallari({...dagitimKurallari, kritikOncelik: e.target.checked})} 
                      />
                      <span>Kritik işleri önce dağıt</span>
                    </label>
                    <label className="checkbox-row">
                      <input 
                        type="checkbox" 
                        checked={dagitimKurallari.dueDate} 
                        onChange={(e) => setDagitimKurallari({...dagitimKurallari, dueDate: e.target.checked})} 
                      />
                      <span>Due Date'i yakın işleri önce dağıt</span>
                    </label>
                    <label className="checkbox-row">
                      <input 
                        type="checkbox" 
                        checked={dagitimKurallari.dengeliIsYuku} 
                        onChange={(e) => setDagitimKurallari({...dagitimKurallari, dengeliIsYuku: e.target.checked})} 
                      />
                      <span>İş yükünü mümkün olduğunca dengeli tut</span>
                    </label>
                  </div>
                </div>

                {/* 3. İş Sıralama Kuralı */}
                <div className="atama-card">
                  <div className="atama-card-header">
                    <span>3. İş Sıralama Kuralı</span>
                    <span className="info-icon-btn"><Icon name="message-information" style={{ width: '14px' }} /></span>
                  </div>
                  <div className="atama-card-subtitle">İşler hangi sıraya göre dağıtıma alınsın? Öncelik sırasını belirleyin.</div>
                  <div className="atama-drag-list">
                    {isSiralama.map((item, index) => (
                      <div
                        key={item}
                        className={`atama-drag-item ${draggedIndex === index ? 'dragging' : ''}`}
                        draggable
                        onDragStart={() => handleDragStart(index)}
                        onDragOver={handleDragOver}
                        onDrop={() => handleDrop(index)}
                      >
                        <div className="atama-drag-item-left">
                          <div className="atama-drag-handle">
                            <Icon name="activity-items" style={{ width: '14px', height: '14px' }} />
                          </div>
                          <span>{item}</span>
                        </div>
                        <div className="atama-drag-item-number">{index + 1}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.72rem', color: 'var(--sapContent_LabelColor)', marginTop: '4px' }}>
                    <Icon name="message-information" style={{ width: '12px', height: '12px' }} />
                    <span>Sıralamayı değiştirmek için sürükleyip bırakın.</span>
                  </div>
                </div>

                {/* 4. Çakışma Kuralları */}
                <div className="atama-card">
                  <div className="atama-card-header">
                    <span>4. Çakışma Kuralları</span>
                    <span className="info-icon-btn"><Icon name="message-information" style={{ width: '14px' }} /></span>
                  </div>
                  <div className="atama-card-subtitle">Atama sırasında aşağıdaki çakışma durumları engellensin.</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label className="checkbox-row">
                      <input 
                        type="checkbox" 
                        checked={cakismaKurallari.zamanCakisma} 
                        onChange={(e) => setCakismaKurallari({...cakismaKurallari, zamanCakisma: e.target.checked})} 
                      />
                      <span>Aynı personele zaman çakışan işler atama</span>
                    </label>
                    <label className="checkbox-row">
                      <input 
                        type="checkbox" 
                        checked={cakismaKurallari.vardiyaDisi} 
                        onChange={(e) => setCakismaKurallari({...cakismaKurallari, vardiyaDisi: e.target.checked})} 
                      />
                      <span>Vardiya dışına taşan işleri atama</span>
                    </label>
                    <label className="checkbox-row">
                      <input 
                        type="checkbox" 
                        checked={cakismaKurallari.izinliPersonel} 
                        onChange={(e) => setCakismaKurallari({...cakismaKurallari, izinliPersonel: e.target.checked})} 
                      />
                      <span>İzinli personeli hariç tut</span>
                    </label>
                    <label className="checkbox-row">
                      <input 
                        type="checkbox" 
                        checked={cakismaKurallari.devamsizPersonel} 
                        onChange={(e) => setCakismaKurallari({...cakismaKurallari, devamsizPersonel: e.target.checked})} 
                      />
                      <span>Devamsız personeli hariç tut</span>
                    </label>
                    <label className="checkbox-row">
                      <input 
                        type="checkbox" 
                        checked={cakismaKurallari.calismaSaatiAsma} 
                        onChange={(e) => setCakismaKurallari({...cakismaKurallari, calismaSaatiAsma: e.target.checked})} 
                      />
                      <span>Günlük çalışma saatini aşma</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Action Buttons Footer Slot */}
              <div className="atama-footer">
                <Button 
                  design="Transparent" 
                  icon="refresh" 
                  onClick={handleResetSettings}
                >
                  Ayarları Sıfırla
                </Button>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <Button 
                    design="Transparent" 
                    onClick={() => {
                      setIsAutoPlanDialogOpen(false);
                      setPlanningPreview(null);
                    }}
                  >
                    İptal
                  </Button>
                  <Button 
                    design="Emphasized" 
                    icon="play" 
                    onClick={handleRunAutoPlanning}
                  >
                    Otomatik Atamayı Başlat
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            /* STEP 2: PREVIEW DRAFT SUCCESS VIEW WITH SUMMARY */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', padding: '0 8px 16px 8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
                <span style={{ fontSize: '1rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                  Otomatik Planlama Sonucu
                </span>
                <Tag colorScheme="8" hideStateIcon>Başarılı</Tag>
              </div>

              {planningPreview && (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                    <div className="result-stat-card" style={{ padding: '8px' }}>
                      <span className="result-stat-label" style={{ fontSize: '0.55rem' }}>Toplam Çalışan</span>
                      <span className="result-stat-value" style={{ fontSize: '1.1rem' }}>{planningPreview.totalEmployees}</span>
                    </div>
                    <div className="result-stat-card" style={{ padding: '8px' }}>
                      <span className="result-stat-label" style={{ fontSize: '0.55rem' }}>Planlanan Çalışan</span>
                      <span className="result-stat-value" style={{ fontSize: '1.1rem' }}>{planningPreview.plannedEmployees}</span>
                    </div>
                    <div className="result-stat-card" style={{ padding: '8px' }}>
                      <span className="result-stat-label" style={{ fontSize: '0.55rem' }}>Toplam Planlanan</span>
                      <span className="result-stat-value" style={{ fontSize: '1.1rem' }}>{planningPreview.totalPlannedDays} gün</span>
                    </div>
                    <div className="result-stat-card" style={{ padding: '8px' }}>
                      <span className="result-stat-label" style={{ fontSize: '0.55rem' }}>Otomatik Planlanan</span>
                      <span className="result-stat-value" style={{ fontSize: '1.1rem', color: 'var(--success)' }}>{planningPreview.autoPlanned}</span>
                    </div>
                    <div className="result-stat-card" style={{ padding: '8px' }}>
                      <span className="result-stat-label" style={{ fontSize: '0.55rem' }}>Manuel Planlanan</span>
                      <span className="result-stat-value" style={{ fontSize: '1.1rem', color: 'var(--primary)' }}>{planningPreview.manualPlanned}</span>
                    </div>
                    <div className="result-stat-card" style={{ padding: '8px' }}>
                      <span className="result-stat-label" style={{ fontSize: '0.55rem' }}>Planlanamayan</span>
                      <span className="result-stat-value" style={{ fontSize: '1.1rem', color: 'var(--danger)' }}>{planningPreview.unplanned}</span>
                    </div>
                  </div>

                  <MessageStrip design="Negative" hideCloseButton>
                    Kurallarınıza göre {planningPreview.plannedEmployees} çalışan için otomatik planlama oluşturuldu. {planningPreview.unplanned} çalışan için uygun tarih bulunamadı.
                  </MessageStrip>
                </>
              )}

              <div className="success-checkmark-container" style={{ padding: '12px 0 0 0', gap: '8px' }}>
                <div className="success-checkmark-circle" style={{ width: '48px', height: '48px', fontSize: '1.5rem' }}>✓</div>
                <span className="success-checkmark-title" style={{ fontSize: '1rem' }}>Planlama Taslağı Hazır</span>
                <span className="success-checkmark-subtitle">
                  Belirlediğiniz kurallara göre geçici izin planlaması hesaplandı.
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%', marginTop: '8px' }}>
                <Button 
                  design="Emphasized" 
                  onClick={handleConfirmPlanning}
                  style={{ width: '100%', backgroundColor: 'var(--primary)' }}
                >
                  Onayla ve Kaydet
                </Button>
                <Button 
                  design="Transparent" 
                  onClick={handleCancelPlanning}
                  style={{ width: '100%' }}
                >
                  Kuralları Düzenle
                </Button>
              </div>
            </div>
          )}
        </Dialog>
      )}

      {/* Manual Assignment Dialog */}
      {isManualDialogOpen && (
        <Dialog
          open={true}
          headerText="Manuel İş Atama"
          onClose={() => setIsManualDialogOpen(false)}
          style={{ width: '400px' }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '16px' }}>
            <MessageStrip design="Information" hideCloseButton>
              Seçilen personelin izin günlerini kontrol ederek uygun bir tarih ve saat dilimine atama yapılacaktır.
            </MessageStrip>
            
            <div className="form-group">
              <Label>Seçilen İş Emirleri ({selectedPlanWoIds.length})</Label>
              <div style={{ maxHeight: '100px', overflowY: 'auto', border: '1px solid var(--sapList_BorderColor)', borderRadius: '4px', padding: '8px', backgroundColor: 'rgba(255,255,255,0.02)' }}>
                {selectedPlanWoIds.map(id => {
                  const wo = workOrders.find(w => w.id === id);
                  return <div key={id} style={{ fontSize: '0.8rem', padding: '2px 0' }}>• {wo?.title || id}</div>;
                })}
              </div>
            </div>

            <div className="form-group">
              <Label>Seçilen Personel ({selectedPersonnelIds.length})</Label>
              <div style={{ maxHeight: '100px', overflowY: 'auto', border: '1px solid var(--sapList_BorderColor)', borderRadius: '4px', padding: '8px', backgroundColor: 'rgba(255,255,255,0.02)' }}>
                {selectedPersonnelIds.map(id => {
                  const p = personnel.find(x => x.id === id);
                  return <div key={id} style={{ fontSize: '0.8rem', padding: '2px 0' }}>• {p?.name || id}</div>;
                })}
              </div>
            </div>

            <div className="form-group">
              <Label required>Planlama Tarihi</Label>
              <Select 
                onChange={(e: any) => setManualDate(e.target.value)} 
                style={{ width: '100%' }}
              >
                {activeCalendarDays
                  .filter(dayStr => {
                    // Show date if at least one selected person is not on leave
                    return selectedPersonnelIds.some(pid => !isPersonOnLeave(pid, dayStr));
                  })
                  .map(dayStr => (
                    <Option 
                      key={dayStr} 
                      value={dayStr} 
                      selected={manualDate === dayStr}
                    >
                      {dayStr}
                    </Option>
                  ))
                }
              </Select>
            </div>
          </div>

          <div slot="footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', padding: '12px 16px', width: '100%' }}>
            <Button design="Transparent" onClick={() => setIsManualDialogOpen(false)}>İptal</Button>
            <Button design="Emphasized" icon="save" onClick={handleManualAssign}>Kaydet</Button>
          </div>
        </Dialog>
      )}
    </div>
  );
}
