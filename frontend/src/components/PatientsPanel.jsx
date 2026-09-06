export default function PatientsPanel({ data, loading }) {
  if (loading) return <div className="empty-state">Loading patient history…</div>;
  if (!data || data.length === 0)
    return <div className="empty-state">No patient data available.</div>;

  return (
    <div>
      <div className="section-heading">
        <h2>Patient IV History</h2>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {data.map((p) => (
          <div key={p.patientId} className="analytics-card" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: '1rem' }}>{p.fullName}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                  Bed {p.bedNumber} · {p.attendingDoctor} · Device: {p.deviceCode}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Admitted: {new Date(p.admittedAt).toLocaleString()}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.1rem', fontWeight: 600 }}>
                  {p.totalReadings}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>total readings</div>
                {p.latestVolumeMl != null && (
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', marginTop: '0.3rem' }}>
                    {p.latestVolumeMl.toFixed(0)} mL remaining
                  </div>
                )}
                {p.latestFlowRate != null && (
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: 'var(--teal-500)' }}>
                    {p.latestFlowRate.toFixed(1)} mL/hr
                  </div>
                )}
              </div>
            </div>

            {p.readings.length > 0 && (
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                  Reading history (latest first)
                </div>
                <div style={{ maxHeight: '180px', overflowY: 'auto', fontSize: '0.8rem' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ color: 'var(--text-muted)', textAlign: 'left' }}>
                        <th style={{ padding: '0.25rem 0.5rem', fontWeight: 500 }}>Time</th>
                        <th style={{ padding: '0.25rem 0.5rem', fontWeight: 500 }}>Weight (g)</th>
                        <th style={{ padding: '0.25rem 0.5rem', fontWeight: 500 }}>Flow (mL/hr)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {p.readings.map((r, i) => (
                        <tr key={i} style={{ borderTop: '1px solid var(--border)' }}>
                          <td style={{ padding: '0.25rem 0.5rem', fontFamily: 'var(--font-mono)' }}>
                            {new Date(r.recordedAt).toLocaleString()}
                          </td>
                          <td style={{ padding: '0.25rem 0.5rem', fontFamily: 'var(--font-mono)' }}>
                            {r.weightGrams.toFixed(1)}
                          </td>
                          <td style={{ padding: '0.25rem 0.5rem', fontFamily: 'var(--font-mono)' }}>
                            {r.flowRateMlPerHr != null ? r.flowRateMlPerHr.toFixed(1) : '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
