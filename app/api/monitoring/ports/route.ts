// app/api/monitoring/ports/route.ts

import { NextResponse } from 'next/server';
import axios from 'axios';

const OBSERVIUM_BASE_URL = process.env.OBSERVIUM_BASE_URL!;
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

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const location = searchParams.get('location') || '';

  try {
    const response = await observiumApi.get('/ports', {
      params: { location },
    });

    const ports = Object.values(response.data.ports || {});

    return NextResponse.json({ ports });
  } catch (error: any) {
    console.error('❌ Error al consultar Observium:', error.message);
    return NextResponse.json(
      { error: 'Error al obtener datos desde Observium' },
      { status: 500 }
    );
  }
}
