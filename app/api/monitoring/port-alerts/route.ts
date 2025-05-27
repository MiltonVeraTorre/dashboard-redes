// app/api/monitoring/port-alerts/route.ts

import { NextResponse } from 'next/server';
import axios from 'axios';

const OBSERVIUM_BASE_URL =  process.env.OBSERVIUM_BASE_URL;
const OBSERVIUM_USERNAME = process.env.OBSERVIUM_USERNAME!;
const OBSERVIUM_PASSWORD = process.env.OBSERVIUM_PASSWORD!;

const observiumApi = axios.create({
  baseURL: OBSERVIUM_BASE_URL,
  auth: {
    username: OBSERVIUM_USERNAME,
    password: OBSERVIUM_PASSWORD,
  },
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  timeout: 30000,
});

export async function GET() {
  try {
    const response = await observiumApi.get('/alerts', {
      params: {
        entity_type: 'port',
        status: 'failed',
      },
    });

    const alerts = Object.values(response.data.alerts || {});

    return NextResponse.json({ alerts });
  } catch (error: any) {
    console.error('❌ Error al consultar alertas de puertos:', error.message);
    return NextResponse.json(
      { error: 'Error al obtener alertas de Observium' },
      { status: 500 }
    );
  }
}
