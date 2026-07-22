import React, { useState } from 'react';
import type { Settings } from '../../shared/types';
import { ShieldAlert, Trash, RefreshCw, Save } from 'lucide-react';

interface SettingsPanelProps {
  settings: Settings;
  onUpdateSettings: (settings: Settings) => void;
  onClearTasks: () => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  settings,
  onUpdateSettings,
  onClearTasks,
}) => {
  const [draftSettings, setDraftSettings] = useState<Settings>(settings);

  const handleOpenAtLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDraftSettings({
      ...draftSettings,
      openAtLogin: e.target.checked,
    });
  };

  const handleOpacityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setDraftSettings({
      ...draftSettings,
      opacity: val,
    });
  };

  const handleThresholdChange = (key: 'low' | 'medium' | 'high', value: number) => {
    setDraftSettings({
      ...draftSettings,
      heatmapThresholds: {
        ...draftSettings.heatmapThresholds,
        [key]: Math.max(1, value),
      },
    });
  };

  const handleSave = () => {
    onUpdateSettings(draftSettings);
    alert('Settings saved successfully!');
  };

  const handleResetSettings = () => {
    if (window.confirm('Reset all widget settings to defaults?')) {
      const defaultSettings: Settings = {
        alwaysOnTop: true,
        opacity: 0.95,
        openAtLogin: false,
        theme: 'dark',
        heatmapThresholds: { low: 1, medium: 3, high: 5 },
        enableNotifications: true,
      };
      setDraftSettings(defaultSettings);
      onUpdateSettings(defaultSettings);
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
              checked={draftSettings.openAtLogin} 
              onChange={handleOpenAtLoginChange} 
            />
            <span className="slider"></span>
          </label>
        </div>

        <div className="settings-row">
          <div className="settings-row-label">
            <span>Enable Notifications</span>
            <span className="settings-row-sublabel">Get toast alerts for due tasks</span>
          </div>
          <label className="switch">
            <input 
              type="checkbox" 
              checked={draftSettings.enableNotifications} 
              onChange={(e) => setDraftSettings({
                ...draftSettings,
                enableNotifications: e.target.checked
              })} 
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
              value={draftSettings.opacity} 
              onChange={handleOpacityChange} 
            />
            <span style={{ fontSize: '12px', width: '30px', textAlign: 'right', fontWeight: 600 }}>
              {Math.round(draftSettings.opacity * 100)}%
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
              value={draftSettings.heatmapThresholds.low}
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
              value={draftSettings.heatmapThresholds.medium}
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
              value={draftSettings.heatmapThresholds.high}
              onChange={(e) => handleThresholdChange('high', parseInt(e.target.value) || 5)}
              min="1"
            />
          </div>
        </div>
      </div>

      {/* Save Settings Action Button */}
      <button 
        type="button" 
        onClick={handleSave} 
        className="btn" 
        style={{ 
          width: '100%', 
          padding: '12px', 
          fontSize: '14px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          gap: '8px',
          marginTop: '4px'
        }}
      >
        <Save size={16} /> Save Settings
      </button>

      {/* Data Backup and Reset Group */}
      <div className="settings-group" style={{ marginTop: 'auto' }}>
        <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Data & Reset
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <button type="button" onClick={handleResetSettings} className="btn btn-secondary" style={{ fontSize: '12px', padding: '6px 10px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <RefreshCw size={13} /> Reset Settings
          </button>
          
          <button type="button" onClick={handleClearAllTasks} className="btn btn-danger" style={{ fontSize: '12px', padding: '6px 10px', marginTop: '4px' }}>
            <Trash size={13} /> Clear Task History
          </button>
        </div>
      </div>

      {/* Footer / Info */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '9px', color: 'var(--text-dim)' }}>
        <ShieldAlert size={10} />
        <span>Data is stored locally on your device.</span>
      </div>

    </div>
  );
};
