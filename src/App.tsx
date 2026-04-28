import { useState } from 'react';
import type { WorkOrder, Assignment } from './types';
import { currentUser, personnel, initialWorkOrders, initialAssignments } from './data/mockData';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import Calendar from './components/Calendar';
import WorkOrderModal from './components/WorkOrderModal';
import { motion } from 'framer-motion';
import './App.css';

function App() {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>(initialWorkOrders);
  const [assignments, setAssignments] = useState<Assignment[]>(initialAssignments);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWorkOrder, setEditingWorkOrder] = useState<WorkOrder | null>(null);

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
    
    // Check for conflicts
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

    // Handle reassignment
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

    // Update work order status
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

  return (
    <motion.div 
      className="app-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Sidebar 
        user={currentUser}
        workOrders={workOrders}
        assignments={assignments}
        personnel={personnel}
        onRemoveAssignment={handleRemoveAssignment}
      />
      <div className="main-content">
        <TopBar 
          onCreateWorkOrder={handleCreateWorkOrder}
          onRefresh={() => window.location.reload()}
        />
        <Calendar 
          personnel={personnel}
          assignments={assignments}
          currentDate={currentDate}
          onDateChange={setCurrentDate}
          onAssign={handleAssignWorkOrder}
          onRemoveAssignment={handleRemoveAssignment}
        />
      </div>
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
