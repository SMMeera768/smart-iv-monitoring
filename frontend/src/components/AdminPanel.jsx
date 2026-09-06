import { useState } from 'react';
import { api } from '../api.js';

function useFormState(initial) {
  const [values, setValues] = useState(initial);
  const update = (key) => (e) => setValues((v) => ({ ...v, [key]: e.target.value }));
  return [values, update, setValues];
}

export default function AdminPanel({ isDemo, onNotify }) {
  const [ward, updateWard, resetWard] = useFormState({ name: '', floorNumber: '' });
  const [nurse, updateNurse, resetNurse] = useFormState({
    fullName: '', email: '', passwordHash: '', phoneNumber: '', role: 'NURSE', ward: { id: '' },
  });
  const [patient, updatePatient, resetPatient] = useFormState({
    fullName: '', bedNumber: '', ward: { id: '' }, attendingDoctor: '',
  });
  const [device, updateDevice, resetDevice] = useFormState({
    deviceCode: '', initialVolumeMl: 500, tareWeightGrams: 120, ward: { id: '' }, patient: { id: '' },
  });

  async function submitWard(e) {
    e.preventDefault();
    if (isDemo) return onNotify('Demo mode — connect a real backend to save this.', true);
    try {
      await api.createWard({ name: ward.name, floorNumber: Number(ward.floorNumber) || null });
      onNotify(`Ward "${ward.name}" created.`);
      resetWard({ name: '', floorNumber: '' });
    } catch (err) {
      onNotify(err.message, true);
    }
  }

  async function submitNurse(e) {
    e.preventDefault();
    if (isDemo) return onNotify('Demo mode — connect a real backend to save this.', true);
    try {
      await api.createNurse({
        fullName: nurse.fullName,
        email: nurse.email,
        passwordHash: nurse.passwordHash, // backend hashes this on save
        phoneNumber: nurse.phoneNumber,
        role: nurse.role,
        ward: nurse.ward.id ? { id: Number(nurse.ward.id) } : null,
      });
      onNotify(`Staff account for "${nurse.fullName}" created.`);
      resetNurse({ fullName: '', email: '', passwordHash: '', phoneNumber: '', role: 'NURSE', ward: { id: '' } });
    } catch (err) {
      onNotify(err.message, true);
    }
  }

  async function submitPatient(e) {
    e.preventDefault();
    if (isDemo) return onNotify('Demo mode — connect a real backend to save this.', true);
    try {
      await api.createPatient({
        fullName: patient.fullName,
        bedNumber: patient.bedNumber,
        ward: { id: Number(patient.ward.id) },
        attendingDoctor: patient.attendingDoctor || null,
      });
      onNotify(`Patient "${patient.fullName}" admitted to bed ${patient.bedNumber}.`);
      resetPatient({ fullName: '', bedNumber: '', ward: { id: '' }, attendingDoctor: '' });
    } catch (err) {
      onNotify(err.message, true);
    }
  }

  async function submitDevice(e) {
    e.preventDefault();
    if (isDemo) return onNotify('Demo mode — connect a real backend to save this.', true);
    try {
      await api.createDevice({
        deviceCode: device.deviceCode,
        initialVolumeMl: Number(device.initialVolumeMl),
        tareWeightGrams: Number(device.tareWeightGrams),
        ward: { id: Number(device.ward.id) },
        patient: device.patient.id ? { id: Number(device.patient.id) } : null,
      });
      onNotify(`Device "${device.deviceCode}" registered.`);
      resetDevice({ deviceCode: '', initialVolumeMl: 500, tareWeightGrams: 120, ward: { id: '' }, patient: { id: '' } });
    } catch (err) {
      onNotify(err.message, true);
    }
  }

  return (
    <div>
      <div className="section-heading"><h2>Admin — onboarding</h2></div>
      {isDemo && (
        <div className="banner">
          You're in demo mode. These forms are fully interactive but won't persist — connect
          to your running backend from the login screen to actually create records.
        </div>
      )}

      <div className="admin-grid">
        <form className="admin-card" onSubmit={submitWard}>
          <h3>New ward</h3>
          <div className="field">
            <label>Ward name</label>
            <input value={ward.name} onChange={updateWard('name')} required placeholder="e.g. General Ward B" />
          </div>
          <div className="field">
            <label>Floor number</label>
            <input type="number" value={ward.floorNumber} onChange={updateWard('floorNumber')} placeholder="2" />
          </div>
          <button className="btn-primary" type="submit">Create ward</button>
        </form>

        <form className="admin-card" onSubmit={submitNurse}>
          <h3>New staff account</h3>
          <div className="field">
            <label>Full name</label>
            <input value={nurse.fullName} onChange={updateNurse('fullName')} required />
          </div>
          <div className="field">
            <label>Email</label>
            <input type="email" value={nurse.email} onChange={updateNurse('email')} required />
          </div>
          <div className="field">
            <label>Temporary password</label>
            <input type="password" value={nurse.passwordHash} onChange={updateNurse('passwordHash')} required />
          </div>
          <div className="field">
            <label>Phone</label>
            <input value={nurse.phoneNumber} onChange={updateNurse('phoneNumber')} placeholder="+91…" required />
          </div>
          <div className="field">
            <label>Role</label>
            <select value={nurse.role} onChange={updateNurse('role')}>
              <option value="NURSE">Nurse</option>
              <option value="DOCTOR">Doctor</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>
          <div className="field">
            <label>Ward ID (blank for admin)</label>
            <input
              type="number"
              value={nurse.ward.id}
              onChange={(e) => updateNurse('ward')({ target: { value: { id: e.target.value } } })}
              placeholder="1"
            />
          </div>
          <button className="btn-primary" type="submit">Create account</button>
        </form>

        <form className="admin-card" onSubmit={submitPatient}>
          <h3>Admit patient</h3>
          <div className="field">
            <label>Full name</label>
            <input value={patient.fullName} onChange={updatePatient('fullName')} required />
          </div>
          <div className="field">
            <label>Bed number</label>
            <input value={patient.bedNumber} onChange={updatePatient('bedNumber')} placeholder="A-105" required />
          </div>
          <div className="field">
            <label>Ward ID</label>
            <input
              type="number"
              value={patient.ward.id}
              onChange={(e) => updatePatient('ward')({ target: { value: { id: e.target.value } } })}
              required
            />
          </div>
          <div className="field">
            <label>Attending doctor</label>
            <input value={patient.attendingDoctor} onChange={updatePatient('attendingDoctor')} placeholder="Dr. …" />
          </div>
          <button className="btn-primary" type="submit">Admit patient</button>
        </form>

        <form className="admin-card" onSubmit={submitDevice}>
          <h3>Register ESP32 device</h3>
          <div className="field">
            <label>Device code</label>
            <input value={device.deviceCode} onChange={updateDevice('deviceCode')} placeholder="ESP32-A105" required />
          </div>
          <div className="field">
            <label>Ward ID</label>
            <input
              type="number"
              value={device.ward.id}
              onChange={(e) => updateDevice('ward')({ target: { value: { id: e.target.value } } })}
              required
            />
          </div>
          <div className="field">
            <label>Patient ID (optional)</label>
            <input
              type="number"
              value={device.patient.id}
              onChange={(e) => updateDevice('patient')({ target: { value: { id: e.target.value } } })}
            />
          </div>
          <div className="field">
            <label>Initial volume (mL)</label>
            <input type="number" value={device.initialVolumeMl} onChange={updateDevice('initialVolumeMl')} />
          </div>
          <div className="field">
            <label>Tare weight (grams, empty bag)</label>
            <input type="number" value={device.tareWeightGrams} onChange={updateDevice('tareWeightGrams')} />
          </div>
          <button className="btn-primary" type="submit">Register device</button>
        </form>
      </div>
    </div>
  );
}
