import React, { useState, useRef, useEffect } from 'react';
import { Calendar, Clock, ChevronLeft, ChevronRight } from 'lucide-react';

interface DateTimePickerProps {
  value: string; // formato: "YYYY-MM-DDTHH:MM"
  onChange: (value: string) => void;
  label?: string;
  required?: boolean;
}

export const DateTimePicker: React.FC<DateTimePickerProps> = ({
  value,
  onChange,
  label,
  required = false,
}) => {
  const [showPicker, setShowPicker] = useState(false);
  const [currentMonth, setCurrentMonth] = useState<Date>(
    value ? new Date(value.split('T')[0]) : new Date()
  );
  const [selectedDate, setSelectedDate] = useState<string>(value ? value.split('T')[0] : '');
  const [selectedTime, setSelectedTime] = useState<string>(value ? value.split('T')[1] : '12:00');
  const pickerRef = useRef<HTMLDivElement>(null);

  // Fechar picker ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setShowPicker(false);
      }
    };

    if (showPicker) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showPicker]);

  // Atualizar valor quando data ou hora mudam
  useEffect(() => {
    if (selectedDate && selectedTime) {
      onChange(`${selectedDate}T${selectedTime}`);
    }
  }, [selectedDate, selectedTime, onChange]);

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const handleSelectDate = (day: number) => {
    const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    const dateStr = newDate.toISOString().split('T')[0];
    setSelectedDate(dateStr);
    setShowPicker(false);
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedTime(e.target.value);
  };

  const monthName = currentMonth.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  const daysInMonth = getDaysInMonth(currentMonth);
  const firstDay = getFirstDayOfMonth(currentMonth);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const emptyDays = Array.from({ length: firstDay }, () => null);

  const displayValue = selectedDate
    ? new Date(selectedDate).toLocaleDateString('pt-BR') + (selectedTime ? ` ${selectedTime}` : '')
    : '';

  return (
    <div ref={pickerRef} className="relative">
      {label && (
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      {/* Input display */}
      <div
        onClick={() => setShowPicker(true)}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-green-500 focus-within:border-transparent cursor-pointer flex items-center gap-3 hover:border-gray-400 transition"
      >
        <Calendar className="w-5 h-5 text-gray-400" />
        <span className="flex-1 text-gray-700">{displayValue || 'Selecione data e hora'}</span>
        <Clock className="w-5 h-5 text-gray-400" />
      </div>

      {/* Picker Modal */}
      {showPicker && (
        <div className="absolute top-full left-0 mt-2 bg-white border border-gray-300 rounded-lg shadow-2xl z-50 p-4 min-w-max">
          {/* Calendar */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={handlePrevMonth}
                className="p-1 hover:bg-gray-100 rounded transition"
                type="button"
              >
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              </button>
              <h3 className="text-sm font-semibold text-gray-800 capitalize min-w-[150px] text-center">
                {monthName}
              </h3>
              <button
                onClick={handleNextMonth}
                className="p-1 hover:bg-gray-100 rounded transition"
                type="button"
              >
                <ChevronRight className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* Days of week header */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'].map((day) => (
                <div key={day} className="text-center text-xs font-semibold text-gray-600 w-8 h-8 flex items-center justify-center">
                  {day}
                </div>
              ))}
            </div>

            {/* Days grid */}
            <div className="grid grid-cols-7 gap-1">
              {emptyDays.map((_, idx) => (
                <div key={`empty-${idx}`} className="w-8 h-8" />
              ))}
              {days.map((day) => {
                const dayDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
                  .toISOString()
                  .split('T')[0];
                const isSelected = selectedDate === dayDate;
                const isToday = dayDate === new Date().toISOString().split('T')[0];

                return (
                  <button
                    key={day}
                    onClick={() => handleSelectDate(day)}
                    className={`w-8 h-8 rounded text-sm font-medium transition ${
                      isSelected
                        ? 'bg-green-600 text-white'
                        : isToday
                        ? 'bg-green-100 text-green-800 border border-green-300'
                        : 'hover:bg-gray-100 text-gray-700'
                    }`}
                    type="button"
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Time picker */}
          <div className="border-t pt-4">
            <label className="block text-xs font-semibold text-gray-700 mb-2">Horário</label>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-400" />
              <input
                type="time"
                value={selectedTime}
                onChange={handleTimeChange}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2 mt-4 border-t pt-4">
            <button
              onClick={() => setShowPicker(false)}
              className="flex-1 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded transition"
              type="button"
            >
              Cancelar
            </button>
            <button
              onClick={() => setShowPicker(false)}
              className="flex-1 px-3 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded transition"
              type="button"
            >
              Confirmar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DateTimePicker;
