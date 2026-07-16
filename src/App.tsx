import { useState } from 'react';
import type { WorkOrder, Assignment, Personnel, User, PlanningCalendar, LeaveRecord } from './types';
import { currentUser, personnel as initialPersonnel, initialWorkOrders, initialAssignments, initialLeaveRecords, initialCalendars } from './data/mockData';
import NavRail, { type Page } from './components/NavRail';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import Calendar from './components/Calendar';
import WorkOrderModal from './components/WorkOrderModal';
import PersonnelPage from './components/PersonnelPage';
import ReportsPage from './components/ReportsPage';
import SettingsPage from './components/SettingsPage';
import WorkOrdersPage from './components/WorkOrdersPage';
import PlanningPage from './components/PlanningPage';
import { motion } from 'framer-motion';
import './App.css';

// Global UI5 Icons Registration
import '@ui5/webcomponents-icons/dist/add.js';
import '@ui5/webcomponents-icons/dist/save.js';
import '@ui5/webcomponents-icons/dist/delete.js';
import '@ui5/webcomponents-icons/dist/edit.js';
import '@ui5/webcomponents-icons/dist/play.js';
import '@ui5/webcomponents-icons/dist/employee.js';
import '@ui5/webcomponents-icons/dist/calendar.js';
import '@ui5/webcomponents-icons/dist/group.js';
import '@ui5/webcomponents-icons/dist/manager.js';
import '@ui5/webcomponents-icons/dist/action-settings.js';
import '@ui5/webcomponents-icons/dist/activity-items.js';
import '@ui5/webcomponents-icons/dist/date-time.js';
import '@ui5/webcomponents-icons/dist/message-information.js';
import '@ui5/webcomponents-icons/dist/time-entry-request.js';
import '@ui5/webcomponents-icons/dist/decline.js';
import '@ui5/webcomponents-icons/dist/accept.js';
import '@ui5/webcomponents-icons/dist/refresh.js';
import '@ui5/webcomponents-icons/dist/wrench.js';
import '@ui5/webcomponents-icons/dist/product.js';
import '@ui5/webcomponents-icons/dist/locate-me.js';
import '@ui5/webcomponents-icons/dist/slim-arrow-left.js';
import '@ui5/webcomponents-icons/dist/slim-arrow-right.js';
import '@ui5/webcomponents-icons/dist/sys-enter-2.js';
import '@ui5/webcomponents-icons/dist/arrow-right.js';


function App() {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>(initialWorkOrders);
  const [assignments, setAssignments] = useState<Assignment[]>(initialAssignments);
  const [personnelList, setPersonnelList] = useState<Personnel[]>(initialPersonnel);
  const [user, setUser] = useState<User>(currentUser);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWorkOrder, setEditingWorkOrder] = useState<WorkOrder | null>(null);
  const [activePage, setActivePage] = useState<Page>('workorders');
  const [calendars, setCalendars] = useState<PlanningCalendar[]>(initialCalendars);
  const [leaveRecords] = useState<LeaveRecord[]>(initialLeaveRecords);
  const [activeCalendarId, setActiveCalendarId] = useState<string | null>(initialCalendars[0]?.id || null);


  const handleCreateWorkOrder = () => {
    setEditingWorkOrder(null);
    setIsModalOpen(true);
  };

  const handleSaveWorkOrder = (workOrder: WorkOrder) => {
    if (editingWorkOrder) {
      setWorkOrders(workOrders.map(wo => wo.id === workOrder.id ? workOrder : wo));
    } else {
      setWorkOrders([...workOrders, workOrder]);
    }
    setIsModalOpen(false);
  };

  const handleAssignWorkOrder = (workOrder: WorkOrder | Assignment, personnelId: string, startHour: number) => {
    const currentDateStr = currentDate.toISOString().split('T')[0];
    const duration = workOrder.duration;

    const hasConflict = assignments.some(a => {
      if (a.personnelId !== personnelId || a.date !== currentDateStr) return false;
      const endHour = startHour + duration;
      const assignmentEnd = a.startHour + a.duration;
      return startHour < assignmentEnd && endHour > a.startHour;
    });

    if (hasConflict) {
      alert('⚠️ Çakışma tespit edildi! Bu zaman diliminde başka bir atama var.');
      return;
    }

    if ('workOrderId' in workOrder) {
      setAssignments(assignments.filter(a => a.id !== workOrder.id));
    }

    const newAssignment: Assignment = {
      id: `A${Date.now()}`,
      workOrderId: 'workOrderId' in workOrder ? workOrder.workOrderId : workOrder.id,
      personnelId,
      date: currentDateStr,
      startHour,
      duration,
      status: 'pending',
      title: workOrder.title,
      priority: workOrder.priority,
      equipment: workOrder.equipment
    };

    setAssignments([...assignments, newAssignment]);

    if (!('workOrderId' in workOrder)) {
      setWorkOrders(workOrders.map(wo =>
        wo.id === workOrder.id
          ? { ...wo, status: 'assigned' as const, assignedTo: personnelId, plannedDate: currentDateStr, startHour }
          : wo
      ));
    }
  };

  const handleRemoveAssignment = (assignmentId: string) => {
    const assignment = assignments.find(a => a.id === assignmentId);
    if (!assignment) return;
    setAssignments(prev => prev.filter(a => a.id !== assignmentId));
    setWorkOrders(prev => prev.map(wo =>
      wo.id === assignment.workOrderId
        ? { ...wo, status: 'unassigned' as const, assignedTo: null, plannedDate: null, startHour: null }
        : wo
    ));
  };

  const renderPage = () => {
    switch (activePage) {
      case 'calendar':
        return (
          <>
            <Sidebar
              user={user}
              workOrders={workOrders}
              assignments={assignments}
              personnel={personnelList}
              onRemoveAssignment={handleRemoveAssignment}
              activeCalendarId={activeCalendarId}
              calendars={calendars}
            />
            <div className="main-content">
              <TopBar onCreateWorkOrder={handleCreateWorkOrder} onRefresh={() => window.location.reload()} />
              <Calendar
                personnel={personnelList}
                assignments={assignments}
                currentDate={currentDate}
                onDateChange={setCurrentDate}
                onAssign={handleAssignWorkOrder}
                onRemoveAssignment={handleRemoveAssignment}
                calendars={calendars}
                activeCalendarId={activeCalendarId}
                onActiveCalendarChange={setActiveCalendarId}
              />
            </div>
          </>
        );
      case 'workorders':
        return (
          <div className="main-content">
            <TopBar onCreateWorkOrder={handleCreateWorkOrder} onRefresh={() => window.location.reload()} />
            <WorkOrdersPage
              workOrders={workOrders}
              assignments={assignments}
              personnel={personnelList}
              onCreateWorkOrder={handleCreateWorkOrder}
              onRemoveAssignment={handleRemoveAssignment}
            />
          </div>
        );
      case 'personnel':
        return (
          <div className="main-content">
            <TopBar onCreateWorkOrder={handleCreateWorkOrder} onRefresh={() => window.location.reload()} />
            <PersonnelPage
              personnel={personnelList}
              onAdd={p => setPersonnelList(prev => [...prev, p])}
              onUpdate={p => setPersonnelList(prev => prev.map(x => x.id === p.id ? p : x))}
              onDelete={id => setPersonnelList(prev => prev.filter(x => x.id !== id))}
            />
          </div>
        );
      case 'reports':
        return (
          <div className="main-content">
            <TopBar onCreateWorkOrder={handleCreateWorkOrder} onRefresh={() => window.location.reload()} />
            <ReportsPage workOrders={workOrders} assignments={assignments} personnel={personnelList} calendars={calendars} />
          </div>
        );
      case 'settings':
        return (
          <div className="main-content">
            <TopBar onCreateWorkOrder={handleCreateWorkOrder} onRefresh={() => window.location.reload()} />
            <SettingsPage user={user} onUpdateUser={setUser} />
          </div>
        );
      case 'planning':
        return (
          <div className="main-content">
            <TopBar onCreateWorkOrder={handleCreateWorkOrder} onRefresh={() => window.location.reload()} />
            <PlanningPage
              workOrders={workOrders}
              setWorkOrders={setWorkOrders}
              assignments={assignments}
              setAssignments={setAssignments}
              personnel={personnelList}
              calendars={calendars}
              setCalendars={setCalendars}
              leaveRecords={leaveRecords}
            />
          </div>
        );
    }
  };


  return (
    <motion.div
      className="app-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <NavRail activePage={activePage} onNavigate={setActivePage} />
      {renderPage()}
      {isModalOpen && (
        <WorkOrderModal
          workOrder={editingWorkOrder}
          onSave={handleSaveWorkOrder}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </motion.div>
  );
}

export default App;
