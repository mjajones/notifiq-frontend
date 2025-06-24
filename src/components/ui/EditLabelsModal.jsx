import React, { useState } from 'react';
import { SketchPicker } from 'react-color';
import { FiTrash2, FiCheck, FiX, FiPlus } from 'react-icons/fi';

export default function EditLabelsModal({ open, onClose, labels, onUpdate, onCreate, onDelete }) {
  const [newLabelName, setNewLabelName] = useState('');
  const [newLabelColor, setNewLabelColor] = useState('#cccccc');
  const [editingLabelId, setEditingLabelId] = useState(null);
  const [editingLabelName, setEditingLabelName] = useState('');
  const [editingLabelColor, setEditingLabelColor] = useState('');

  if (!open) return null;

  const handleStartEdit = (label) => {
    setEditingLabelId(label.id);
    setEditingLabelName(label.name);
    setEditingLabelColor(label.color);
  };

  const handleCancelEdit = () => {
    setEditingLabelId(null);
  };

  const handleSaveEdit = () => {
    onUpdate(editingLabelId, { name: editingLabelName, color: editingLabelColor });
    setEditingLabelId(null);
  };

  const handleCreate = (e) => {
    e.preventDefault();
    if (newLabelName.trim() === '') return;
    onCreate({ name: newLabelName, color: newLabelColor });
    setNewLabelName('');
    setNewLabelColor('#cccccc');
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-foreground rounded-lg shadow-xl w-full max-w-md">
        <div className="p-4 border-b flex justify-between items-center">
            <h3 className="text-xl font-bold text-text-primary">Edit Labels</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><FiX size={24} /></button>
        </div>
        
        <div className="p-4 max-h-[40vh] overflow-y-auto">
            <ul className="space-y-2">
                {labels.map(label => (
                    <li key={label.id} className="flex items-center gap-2">
                        {editingLabelId === label.id ? (
                            <>
                                <SketchPicker color={editingLabelColor} onChange={(color) => setEditingLabelColor(color.hex)} />
                                <input type="text" value={editingLabelName} onChange={(e) => setEditingLabelName(e.target.value)} className="flex-grow p-2 border rounded-md" />
                                <button onClick={handleSaveEdit} className="p-2 text-green-500 hover:bg-green-100 rounded-md"><FiCheck /></button>
                                <button onClick={handleCancelEdit} className="p-2 text-red-500 hover:bg-red-100 rounded-md"><FiX /></button>
                            </>
                        ) : (
                            <>
                                <span style={{ backgroundColor: label.color }} className="w-4 h-4 rounded-full flex-shrink-0"></span>
                                <span className="flex-grow font-medium">{label.name}</span>
                                <button onClick={() => handleStartEdit(label)} className="p-2 text-gray-500 hover:bg-gray-100 rounded-md text-sm">Edit</button>
                                <button onClick={() => onDelete(label.id)} className="p-2 text-red-500 hover:bg-red-100 rounded-md"><FiTrash2 /></button>
                            </>
                        )}
                    </li>
                ))}
            </ul>
        </div>

        <div className="p-4 border-t">
            <form onSubmit={handleCreate} className="space-y-2">
                <p className="font-semibold">Create new label</p>
                <div className="flex items-center gap-2">
                    <div style={{ backgroundColor: newLabelColor }} className="w-6 h-6 rounded-full border"></div>
                    <SketchPicker color={newLabelColor} onChange={(color) => setNewLabelColor(color.hex)} />
                    <input type="text" value={newLabelName} onChange={(e) => setNewLabelName(e.target.value)} placeholder="New label name" className="flex-grow p-2 border rounded-md" />
                    <button type="submit" className="bg-primary text-white px-4 py-2 rounded-md">Create</button>
                </div>
            </form>
        </div>
      </div>
    </div>
  );
}