import React from 'react';
import { Dashboard, Stat } from 'grafana-react';

export default function HeroStatDashboard() {
  return (
    <Dashboard title="Hero Stat Example" uid="hero-stat">
      <Stat
        title="API Servers Up"
        unit="short"
        thresholds={{ 1: 'green' }}
        graphMode="area"
        height={4}
        width={3}
      >
        {'count(up{job="kubernetes-apiservers"})'}
      </Stat>
    </Dashboard>
  );
}
