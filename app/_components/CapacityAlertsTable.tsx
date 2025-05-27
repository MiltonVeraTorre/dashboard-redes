interface PortData {
  port_id: string;
  device_id: string;
  hostname: string;
  ifDescr: string;
  ifSpeed: number;
  utilization: number; // % de uso
}

const CapacityAlertsTable: React.FC<{
  ports: PortData[];
  thresholdFilter?: (port: PortData) => boolean;
}> = ({ ports, thresholdFilter }) => {
  const filteredPorts = thresholdFilter
    ? ports.filter(thresholdFilter)
    : ports;

  return (
    <div className="bg-white rounded-lg p-4 border">
      <h2 className="text-lg font-bold mb-4">Enlaces en Riesgo</h2>
      <table className="min-w-full text-sm">
        <thead>
          <tr className="border-b">
            <th>Dispositivo</th>
            <th>Puerto</th>
            <th>Velocidad</th>
            <th>Utilización</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          {filteredPorts.map((port) => {
            const danger =
              (port.ifSpeed < 500_000_000 && port.utilization > 50) ||
              (port.ifSpeed >= 1_000_000_000 && port.utilization > 80);
            return (
              <tr key={port.port_id} className={danger ? "bg-red-50" : ""}>
                <td>{port.hostname}</td>
                <td>{port.ifDescr}</td>
                <td>{(port.ifSpeed / 1_000_000).toFixed(1)} Mbps</td>
                <td>{port.utilization.toFixed(1)}%</td>
                <td>
                  {danger ? (
                    <span className="text-red-600 font-bold">¡ALERTA!</span>
                  ) : (
                    <span className="text-green-600">Normal</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
