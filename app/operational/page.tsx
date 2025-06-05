'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  AlertTriangle,
  CheckCircle,
  XCircle,
  Activity,
  Network,
  DollarSign,
  TrendingUp,
  MapPin,
  Wifi,
  RefreshCw
} from 'lucide-react';

interface OperationalData {
  linkInventory: any[];
  biweeklyMetrics: any[];
  radioBaseAnalysis: any[];
  cityTierClassification: any[];
  engineeringThresholds: any[];
  costAnalysis: any[];
  activeAlerts: any[];
  lastUpdated: string;
  dataQuality: {
    completeness: number;
    accuracy: number;
    freshness: number;
  };
}

export default function OperationalDashboard() {
  const [data, setData] = useState<OperationalData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState('inventory');

  useEffect(() => {
    fetchOperationalData();
  }, []);

  const fetchOperationalData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Usar datos demo con fallback
      const response = await fetch('/api/xcien/operational/demo');
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const operationalData = await response.json();
      setData(operationalData);
      console.log('✅ XCIEN operational data loaded:', operationalData);
      
    } catch (error) {
      console.error('❌ Error loading operational data:', error);
      setError(error instanceof Error ? error.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'up':
      case 'operational':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'down':
      case 'critical':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'warning':
      case 'degraded':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getUtilizationColor = (utilization: number) => {
    if (utilization >= 80) return 'text-red-600 bg-red-50';
    if (utilization >= 70) return 'text-yellow-600 bg-yellow-50';
    return 'text-green-600 bg-green-50';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Cargando datos operativos XCIEN...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              <div>
                <p className="text-red-700">Error al cargar datos operativos: {error}</p>
                <Button
                  onClick={fetchOperationalData}
                  variant="outline"
                  size="sm"
                  className="mt-2"
                >
                  Reintentar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-6">
            <p>No hay datos disponibles</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Dashboard Operativo XCIEN</h1>
          <p className="text-gray-600">
            Monitoreo quincenal, inventario de enlaces y análisis de radio-bases
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Badge variant="outline" className="bg-green-50 text-green-700">
            Calidad: {data.dataQuality.completeness}%
          </Badge>
          <Button onClick={fetchOperationalData} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualizar
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Enlaces Totales</CardTitle>
            <Network className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.linkInventory.length}</div>
            <p className="text-xs text-muted-foreground">
              {data.linkInventory.filter(l => l.status === 'up').length} operativos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Radio-Bases</CardTitle>
            <Wifi className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.radioBaseAnalysis.length}</div>
            <p className="text-xs text-muted-foreground">
              {data.radioBaseAnalysis.filter(rb => rb.status === 'operational').length} operativas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alertas Activas</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{data.activeAlerts.length}</div>
            <p className="text-xs text-muted-foreground">
              {data.activeAlerts.filter(a => a.severity === 'critical').length} críticas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Plazas</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.cityTierClassification.length}</div>
            <p className="text-xs text-muted-foreground">
              {data.cityTierClassification.filter(c => c.tier === 'I').length} Tier I
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Navigation Buttons */}
      <div className="flex space-x-2 mb-6">
        <Button
          onClick={() => setSelectedTab('inventory')}
          variant={selectedTab === 'inventory' ? 'default' : 'outline'}
        >
          Inventario de Enlaces
        </Button>
        <Button
          onClick={() => setSelectedTab('biweekly')}
          variant={selectedTab === 'biweekly' ? 'default' : 'outline'}
        >
          Monitoreo Quincenal
        </Button>
        <Button
          onClick={() => setSelectedTab('radiobases')}
          variant={selectedTab === 'radiobases' ? 'default' : 'outline'}
        >
          Radio-Bases
        </Button>
        <Button
          onClick={() => setSelectedTab('alerts')}
          variant={selectedTab === 'alerts' ? 'default' : 'outline'}
        >
          Alertas
        </Button>
      </div>

      {/* Content based on selected tab */}
      {selectedTab === 'inventory' && (
          <Card>
            <CardHeader>
              <CardTitle>Inventario de Enlaces</CardTitle>
              <CardDescription>
                Enlaces de tránsito por plaza y carrier
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">ID Enlace</th>
                      <th className="text-left p-2">Plaza</th>
                      <th className="text-left p-2">Radio-Base</th>
                      <th className="text-left p-2">Carrier</th>
                      <th className="text-left p-2">Capacidad (Mbps)</th>
                      <th className="text-left p-2">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.linkInventory.slice(0, 10).map((link) => (
                      <tr key={link.linkId} className="border-b hover:bg-gray-50">
                        <td className="p-2 font-mono text-xs">{link.linkId}</td>
                        <td className="p-2">{link.plaza}</td>
                        <td className="p-2">{link.radioBase}</td>
                        <td className="p-2">{link.carrierProvider}</td>
                        <td className="p-2">{link.contractedBandwidth.toLocaleString()}</td>
                        <td className="p-2">
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(link.status)}
                            <span className="capitalize">{link.status}</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {data.linkInventory.length > 10 && (
                <p className="text-sm text-gray-500 mt-4">
                  Mostrando 10 de {data.linkInventory.length} enlaces
                </p>
              )}
            </CardContent>
          </Card>
      )}

      {selectedTab === 'biweekly' && (
          <Card>
            <CardHeader>
              <CardTitle>Métricas Quincenales</CardTitle>
              <CardDescription>
                Análisis de utilización por período quincenal
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">ID Enlace</th>
                      <th className="text-left p-2">Período</th>
                      <th className="text-left p-2">Pico Tráfico (Mbps)</th>
                      <th className="text-left p-2">Utilización %</th>
                      <th className="text-left p-2">Umbral Ingeniería</th>
                      <th className="text-left p-2">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.biweeklyMetrics.slice(0, 10).map((metric) => (
                      <tr key={`${metric.linkId}-${metric.period}`} className="border-b hover:bg-gray-50">
                        <td className="p-2 font-mono text-xs">{metric.linkId}</td>
                        <td className="p-2">{metric.periodLabel}</td>
                        <td className="p-2">{metric.peakTrafficMbps.toFixed(1)}</td>
                        <td className="p-2">
                          <Badge className={getUtilizationColor(metric.utilizationPercent)}>
                            {metric.utilizationPercent.toFixed(1)}%
                          </Badge>
                        </td>
                        <td className="p-2">{metric.engineeringThreshold.toLocaleString()}</td>
                        <td className="p-2">
                          <Badge variant={metric.alertLevel === 'critical' ? 'destructive' : 
                                        metric.alertLevel === 'warning' ? 'secondary' : 'default'}>
                            {metric.alertLevel}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
      )}

      {selectedTab === 'radiobases' && (
          <Card>
            <CardHeader>
              <CardTitle>Análisis por Radio-Base</CardTitle>
              <CardDescription>
                Capacidad y utilización por radio-base
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {data.radioBaseAnalysis.map((rb) => (
                  <Card key={rb.radioBaseId} className="border">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{rb.radioBaseName}</CardTitle>
                        {getStatusIcon(rb.status)}
                      </div>
                      <CardDescription>{rb.plaza}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Enlaces:</span>
                        <span className="font-medium">{rb.totalLinks}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Capacidad:</span>
                        <span className="font-medium">{(rb.totalCapacityMbps / 1000).toFixed(1)} Gbps</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Utilización:</span>
                        <span className="font-medium">{(rb.totalUtilizationMbps / 1000).toFixed(1)} Gbps</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Carriers:</span>
                        <span className="font-medium">{rb.carriers.length}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
      )}

      {selectedTab === 'alerts' && (
          <Card>
            <CardHeader>
              <CardTitle>Alertas Activas</CardTitle>
              <CardDescription>
                Alertas de utilización y costos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.activeAlerts.map((alert) => (
                  <Card key={alert.id} className={
                    alert.severity === 'critical' ? 'border-red-200 bg-red-50' :
                    alert.severity === 'warning' ? 'border-yellow-200 bg-yellow-50' :
                    'border-blue-200 bg-blue-50'
                  }>
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-3">
                        <AlertTriangle className="h-4 w-4 mt-1 text-red-500" />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium">{alert.title}</h4>
                            <Badge variant={alert.severity === 'critical' ? 'destructive' : 'secondary'}>
                              {alert.severity}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{alert.description}</p>
                          <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                            <span>{alert.plaza} - {alert.carrierProvider}</span>
                            <span>{new Date(alert.createdAt).toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
      )}
    </div>
  );
}
