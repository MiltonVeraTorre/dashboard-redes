# Observium API Investigation Report

## Executive Summary

This document provides a comprehensive analysis of the Observium API endpoints available for the dashboard-redes project, with specific focus on capacity utilization and critical sites monitoring.

## API Configuration

- **Base URL**: `http://201.150.5.213/api/v0`
- **Authentication**: Basic Auth (username: equipo2, password: 91Rert@mU)
- **Total Devices**: 6,721 devices
- **Total Ports**: 88,478 ports
- **Total Alerts**: 9,509 alerts

## Key Findings

### 1. Ports Endpoint - Capacity Utilization Data ✅

**Endpoint**: `/api/v0/ports`

**Key Fields Available**:
- `ifInOctets_rate` - Incoming data rate (bits per second)
- `ifOutOctets_rate` - Outgoing data rate (bits per second)
- `ifInOctets_perc` - Incoming utilization percentage
- `ifOutOctets_perc` - Outgoing utilization percentage
- `ifSpeed` - Port speed in bits per second
- `ifHighSpeed` - Port speed in Mbps
- `ifDescr` - Interface description (contains capacity info)
- `ifAlias` - Interface alias (business-relevant names)
- `ifOperStatus` - Operational status (up/down)

**Sample Data**:
```json
{
  "port_id": "10",
  "device_id": "3",
  "ifDescr": "sfpplus4-CCR2004_Core_Saltillo1_FO_a_sfp1",
  "ifSpeed": "10000000000",
  "ifHighSpeed": "10000",
  "ifOperStatus": "up",
  "ifAlias": "Peering:CCR2204_Core_Saltillo1_Llegadas_de_FO",
  "ifInOctets_rate": "39190007",
  "ifOutOctets_rate": "171575191",
  "ifInOctets_perc": "3",
  "ifOutOctets_perc": "14"
}
```

**Usage Strategy**:
- Use `ifInOctets_perc` and `ifOutOctets_perc` for real-time utilization
- Use `ifHighSpeed` for capacity (in Mbps)
- Filter by `ifOperStatus: "up"` for active ports
- Use pagination with `pagesize` parameter (recommended: 50-100)

### 2. Devices Endpoint - Location Mapping ✅

**Endpoint**: `/api/v0/devices`

**Key Fields**:
- `device_id` - Unique device identifier
- `hostname` - Device hostname
- `location` - Physical location (maps to plazas)
- `status` - Device status (1 = active)
- `type` - Device type (network, server, etc.)

**Location Mapping**:
- Saltillo: "Coahuila, Saltillo, RB Jolla"
- Monterrey: "Nuevo Leon, Podi, Observium"
- Guadalajara: "Guadalajara, Jalisco, RB Cardenal"

**Critical Note**: The `fields` parameter causes empty responses. Always fetch without field filtering.

### 3. Alerts Endpoint - Critical Sites ✅

**Endpoint**: `/api/v0/alerts`

**Key Fields**:
- `alert_status` - Alert status (0 = failed, 1 = ok)
- `entity_type` - Type of entity (device, port)
- `entity_id` - ID of the affected entity
- `device_id` - Device associated with alert
- `severity` - Alert severity (crit, warn)
- `alert_message` - Alert description

**Alert Types Found**:
- Device status alerts (device up/down)
- Port status alerts (interface up/down)
- Utilization threshold alerts

## Implementation Strategy

### Capacity Utilization Dashboard

1. **Data Collection**:
   - Fetch devices without field filtering
   - Group devices by location (plaza)
   - For each plaza, fetch ports for all devices
   - Use pagination to prevent API overload

2. **Utilization Calculation**:
   - Primary: Use `ifInOctets_perc` and `ifOutOctets_perc`
   - Secondary: Calculate from `ifInOctets_rate`/`ifOutOctets_rate` vs `ifHighSpeed`
   - Take maximum of input/output utilization

3. **Capacity Extraction**:
   - Use `ifHighSpeed` (Mbps) as primary capacity
   - Parse `ifDescr` and `ifAlias` for business context
   - Extract speed information from interface names

### Critical Sites Identification

1. **High Utilization Sites**:
   - Identify ports with >80% utilization
   - Group by device and location
   - Rank by highest utilization

2. **Alert-Based Critical Sites**:
   - Filter alerts with `alert_status: "0"` (failed)
   - Focus on `entity_type: "port"` for capacity issues
   - Cross-reference with device locations

## API Usage Best Practices

### Pagination
- Always use `pagesize` parameter (recommended: 50-100)
- Monitor response times and adjust accordingly
- Use `pageno` for pagination when needed

### Field Filtering
- **Devices**: Do NOT use `fields` parameter (causes empty responses)
- **Ports**: Safe to use `fields` parameter for specific data
- **Alerts**: Safe to use `fields` parameter

### Rate Limiting
- Implement delays between API calls
- Use batch processing for large datasets
- Monitor API response times

## Sample API Calls

### Get High-Utilization Ports
```bash
GET /api/v0/ports?pagesize=100&fields=port_id,device_id,ifDescr,ifAlias,ifHighSpeed,ifInOctets_perc,ifOutOctets_perc,ifOperStatus
```

### Get All Devices by Location
```bash
GET /api/v0/devices?pagesize=100
# Filter by location in application code
```

### Get Critical Alerts
```bash
GET /api/v0/alerts?pagesize=100&status=failed
```

## Data Quality Notes

- **Real-time Data**: Utilization percentages are updated in real-time
- **Capacity Information**: Available in multiple fields for redundancy
- **Business Context**: Interface aliases provide business-relevant naming
- **Geographic Distribution**: Devices span multiple Mexican states
- **Alert Coverage**: Comprehensive alerting for both devices and ports

## Next Steps

1. Implement improved capacity utilization API endpoint
2. Create critical sites detection based on real utilization data
3. Add proper error handling and fallback mechanisms
4. Implement caching for frequently accessed data
5. Create monitoring for API performance and reliability
