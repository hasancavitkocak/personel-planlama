import { useState } from 'react';
import type { Personnel, Assignment, WorkOrder } from '../types';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format, addDays, subDays, startOfWeek, addWeeks, subWeeks } from 'date-fns';
import { tr } from 'date-fns/locale';
import { motion } from 'framer-motion';
import CalendarRow from './CalendarRow';
import './Calendar.css';

interface CalendarProps {
  personnel: Personnel[];
  assignments: Assignment[];
  currentDate: Date;
  onDateChange: (date: Date) => void;
  onAssign: (workOrder: WorkOrder | Assignment, personnelId: string, startHour: number) => void;
  onRemoveAssignment: (assignmentId: string) => void;
}

export default function Calendar({ personnel, assignments, currentDate, onDateChange, onAssign, onRemoveAssignment }: CalendarProps) {
  const [view, setView] = useState<'day' | 'week'>('day');
  
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const currentDateStr = currentDate.toISOString().split('T')[0];

  // Week view: get 7 days starting from Monday
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const handlePrevious = () => {
    onDateChange(view === 'day' ? subDays(currentDate, 1) : subWeeks(currentDate, 1));
  };

  const handleNext = () => {
    onDateChange(view === 'day' ? addDays(currentDate, 1) : addWeeks(currentDate, 1));
  };

  const handleToday = () => {
    onDateChange(new Date());
  };

  const getDateRangeText = () => {
    if (view === 'day') {
      return format(currentDate, 'EEEE, d MMMM yyyy', { locale: tr });
    } else {
      const start = format(weekDays[0], 'd MMM', { locale: tr });
      const end = format(weekDays[6], 'd MMM yyyy', { locale: tr });
      return `${start} - ${end}`;
    }
  };

  return (
    <div className="calendar-container">
      <div className="calendar-header">
        <div className="date-navigation">
          <motion.button 
            className="nav-btn"
            onClick={handlePrevious}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <ChevronLeft size={20} />
          </motion.button>
          <div className="current-date">{getDateRangeText()}</div>
          <motion.button 
            className="nav-btn"
            onClick={handleNext}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <ChevronRight size={20} />
          </motion.button>
          <motion.button 
            className="btn btn-secondary"
            onClick={handleToday}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Bugün
          </motion.button>
        </div>
        
        <div className="view-switcher">
          <button 
            className={`view-btn ${view === 'week' ? 'active' : ''}`}
            onClick={() => setView('week')}
          >
            Hafta
          </button>
          <button 
            className={`view-btn ${view === 'day' ? 'active' : ''}`}
            onClick={() => setView('day')}
          >
            Gün
          </button>
        </div>
      </div>

      {view === 'day' ? (
        // DAY VIEW
        <div className="planning-calendar">
          <div className="calendar-timeline">
            <div className="personnel-column">Personel</div>
            <div className="time-grid">
              {hours.map(hour => (
                <div key={hour} className={`time-slot ${hour >= 8 && hour <= 17 ? 'work-hour' : ''}`}>
                  {hour.toString().padStart(2, '0')}:00
                </div>
              ))}
            </div>
          </div>
          
          <div className="calendar-rows">
            {personnel.map((person, index) => {
              const personAssignments = assignments.filter(
                a => a.personnelId === person.id && a.date === currentDateStr
              );
              
              return (
                <CalendarRow
                  key={person.id}
                  person={person}
                  assignments={personAssignments}
                  onAssign={onAssign}
                  onRemoveAssignment={onRemoveAssignment}
                  index={index}
                />
              );
            })}
          </div>
          <div className="drop-hint">↑ İş emirlerini buraya sürükleyip bırakın</div>
        </div>
      ) : (
        // WEEK VIEW
        <div className="planning-calendar week-view">
          <div className="week-header">
            <div className="personnel-column-week">Personel</div>
            {weekDays.map(day => {
              const isToday = day.toISOString().split('T')[0] === new Date().toISOString().split('T')[0];
              return (
                <div key={day.toISOString()} className={`week-day-header ${isToday ? 'today' : ''}`}>
                  <div className="day-name">{format(day, 'EEE', { locale: tr })}</div>
                  <div className="day-number">{format(day, 'd')}</div>
                </div>
              );
            })}
          </div>

          <div className="calendar-rows">
            {personnel.map((person) => (
              <div key={person.id} className="week-row">
                <div className="row-personnel-week">
                  <div className="personnel-avatar" style={{ background: person.color }}>
                    {person.avatar}
                  </div>
                  <div className="personnel-info">
                    <h4>{person.name}</h4>
                    <p>{person.role}</p>
                  </div>
                </div>

                {weekDays.map(day => {
                  const dayStr = day.toISOString().split('T')[0];
                  const dayAssignments = assignments.filter(
                    a => a.personnelId === person.id && a.date === dayStr
                  );
                  const isToday = dayStr === new Date().toISOString().split('T')[0];

                  return (
                    <div
                      key={dayStr}
                      className={`week-day-cell ${isToday ? 'today' : ''}`}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault();
                        const workOrderData = e.dataTransfer.getData('workOrder');
                        if (workOrderData) {
                          const workOrder = JSON.parse(workOrderData);
                          // Default to 8:00 AM for week view drops
                          onAssign(workOrder, person.id, 8);
                        }
                      }}
                    >
                      {dayAssignments.map(assignment => (
                        <motion.div
                          key={assignment.id}
                          className="week-assignment"
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          whileHover={{ scale: 1.03 }}
                          style={{
                            background: assignment.priority === 'critical' ? 'linear-gradient(135deg, #BE185D, #9D174D)' :
                                       assignment.priority === 'high' ? 'linear-gradient(135deg, #DC2626, #B91C1C)' :
                                       assignment.priority === 'medium' ? 'linear-gradient(135deg, #D97706, #B45309)' :
                                       'linear-gradient(135deg, #16A34A, #15803D)'
                          }}
                        >
                          <div className="week-assignment-title">{assignment.title}</div>
                          <div className="week-assignment-time">
                            {String(assignment.startHour).padStart(2,'0')}:00 – {String(assignment.startHour + assignment.duration).padStart(2,'0')}:00
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
