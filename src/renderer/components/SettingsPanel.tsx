import React, { useRef } from 'react';
import type { Settings, Task } from '../../shared/types';
import { ShieldAlert, Download, Upload, Trash, RefreshCw } from 'lucide-react';

interface SettingsPanelProps {
  settings: Settings;
  tasks: Task[];
  onUpdateSettings: (settings: Settings) => void;
  onImportTasks: (tasks: Task[]) => void;
  onClearTasks: () => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  settings,
  tasks,
  onUpdateSettings,
  onImportTasks,
  onClearTasks,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);



  const handleOpenAtLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdateSettings({
      ...settings,
      openAtLogin: e.target.checked,
    });
  };

  const handleOpacityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    onUpdateSettings({
      ...settings,
      opacity: val,
    });
  };

  const handleThresholdChange = (key: 'low' | 'medium' | 'high', value: number) => {
    onUpdateSettings({
      ...settings,
      heatmapThresholds: {
        ...settings.heatmapThresholds,
        [key]: Math.max(1, value),
      },
    });
  };

  const handleExportData = () => {
    try {
      const dataStr = JSON.stringify({ tasks, settings }, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `journey_widget_export_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      alert('Export failed: ' + error);
    }
  };

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed && Array.isArray(parsed.tasks)) {
          // Validation pass
          const validTasks = parsed.tasks.filter((t: any) => t.id && t.title && t.createdAt);
          if (validTasks.length > 0) {
            onImportTasks(validTasks);
            
            // If settings were exported, import those as well
            if (parsed.settings && parsed.settings.heatmapThresholds) {
              onUpdateSettings({
                ...settings,
                ...parsed.settings
              });
            }
            alert(`Imported ${validTasks.length} tasks successfully!`);
          } else {
            alert('No valid tasks found in the JSON file.');
          }
        } else {
          alert('Invalid format. Export file must contain a tasks array.');
        }
      } catch (error) {
        alert('Parsing JSON failed: ' + error);
      }
    };
    reader.readAsText(file);
    // Reset file input value
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleResetSettings = () => {
    if (window.confirm('Reset all widget settings to defaults?')) {
      onUpdateSettings({
        alwaysOnTop: true,
        opacity: 0.95,
        openAtLogin: false,
        theme: 'dark',
        heatmapThresholds: { low: 1, medium: 3, high: 5 },
      });
    }
  };

  const handleClearAllTasks = () => {
    if (window.confirm('WARNING: This will permanently delete all task history. This cannot be undone. Are you sure?')) {
      onClearTasks();
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', height: '100%' }} className="no-drag">
      
      {/* Behavior Group */}
      <div className="settings-group">
        <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Widget Configuration
        </div>



        <div className="settings-row">
          <div className="settings-row-label">
            <span>Launch on Startup</span>
            <span className="settings-row-sublabel">Open widget when Windows starts</span>
          </div>
          <label className="switch">
            <input 
              type="checkbox" 
              checked={settings.openAtLogin} 
              onChange={handleOpenAtLoginChange} 
            />
            <span className="slider"></span>
          </label>
        </div>

        <div className="settings-row">
          <div className="settings-row-label">
            <span>Widget Opacity</span>
            <span className="settings-row-sublabel">Adjust glass transparency</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input 
              type="range" 
              className="opacity-slider"
              min="0.3" 
              max="1.0" 
              step="0.05" 
              value={settings.opacity} 
              onChange={handleOpacityChange} 
            />
            <span style={{ fontSize: '12px', width: '30px', textAlign: 'right', fontWeight: 600 }}>
              {Math.round(settings.opacity * 100)}%
            </span>
          </div>
        </div>
      </div>

      {/* Heatmap Threshold Group */}
      <div className="settings-group">
        <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Heatmap Thresholds (Completed Tasks)
        </div>

        <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Low Level</span>
            <input 
              type="number" 
              className="input-field" 
              style={{ padding: '6px' }}
              value={settings.heatmapThresholds.low}
              onChange={(e) => handleThresholdChange('low', parseInt(e.target.value) || 1)}
              min="1"
            />
          </div>
          
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Mid Level</span>
            <input 
              type="number" 
              className="input-field" 
              style={{ padding: '6px' }}
              value={settings.heatmapThresholds.medium}
              onChange={(e) => handleThresholdChange('medium', parseInt(e.target.value) || 3)}
              min="1"
            />
          </div>

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>High Level</span>
            <input 
              type="number" 
              className="input-field" 
              style={{ padding: '6px' }}
              value={settings.heatmapThresholds.high}
              onChange={(e) => handleThresholdChange('high', parseInt(e.target.value) || 5)}
              min="1"
            />
          </div>
        </div>
      </div>

      {/* Data Backup and Reset Group */}
      <div className="settings-group">
        <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Data & Backup
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <button type="button" onClick={handleExportData} className="btn btn-secondary" style={{ fontSize: '12px', padding: '6px 10px' }}>
              <Download size={13} /> Export JSON
            </button>
            
            <button type="button" onClick={() => fileInputRef.current?.click()} className="btn btn-secondary" style={{ fontSize: '12px', padding: '6px 10px' }}>
              <Upload size={13} /> Import JSON
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              style={{ display: 'none' }}
              onChange={handleImportData}
            />
          </div>

          <button type="button" onClick={handleResetSettings} className="btn btn-secondary" style={{ fontSize: '12px', padding: '6px 10px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <RefreshCw size={13} /> Reset Settings
          </button>
          
          <button type="button" onClick={handleClearAllTasks} className="btn btn-danger" style={{ fontSize: '12px', padding: '6px 10px', marginTop: '4px' }}>
            <Trash size={13} /> Clear Task History
          </button>
        </div>
      </div>

      {/* Footer / Info */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '9px', color: 'var(--text-dim)', marginTop: 'auto' }}>
        <ShieldAlert size={10} />
        <span>Data is stored locally on your device.</span>
      </div>

    </div>
  );
};
