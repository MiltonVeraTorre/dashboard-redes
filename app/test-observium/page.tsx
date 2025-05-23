'use client';

import React, { useState } from 'react';
import { observiumApi } from '@/lib/adapters/ObserviumApiAdapter';
import { fetchNetworkOverview } from '@/lib/adapters/observium-utils';

export default function TestObserviumPage() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function testDevices() {
    try {
      setLoading(true);
      setError(null);
      
      const response = await observiumApi.get('/devices');
      setResult(response.data);
    } catch (err: any) {
      console.error('Error fetching devices:', err);
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  }

  async function testPorts() {
    try {
      setLoading(true);
      setError(null);
      
      const response = await observiumApi.get('/ports');
      setResult(response.data);
    } catch (err: any) {
      console.error('Error fetching ports:', err);
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  }

  async function testAlerts() {
    try {
      setLoading(true);
      setError(null);
      
      const response = await observiumApi.get('/alerts');
      setResult(response.data);
    } catch (err: any) {
      console.error('Error fetching alerts:', err);
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  }

  async function testOverview() {
    try {
      setLoading(true);
      setError(null);
      
      const overview = await fetchNetworkOverview();
      setResult(overview);
    } catch (err: any) {
      console.error('Error fetching overview:', err);
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Test Observium API</h1>
      
      <div className="flex space-x-4 mb-8">
        <button
          onClick={testDevices}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          disabled={loading}
        >
          Test Devices
        </button>
        
        <button
          onClick={testPorts}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          disabled={loading}
        >
          Test Ports
        </button>
        
        <button
          onClick={testAlerts}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          disabled={loading}
        >
          Test Alerts
        </button>
        
        <button
          onClick={testOverview}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          disabled={loading}
        >
          Test Overview
        </button>
      </div>
      
      {loading && (
        <div className="flex justify-center my-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-8">
          <p>{error}</p>
        </div>
      )}
      
      {result && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Result</h2>
          <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-96">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
