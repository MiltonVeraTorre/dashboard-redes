'use client';

import React, { useState } from 'react';
import { observiumApi } from '@/lib/data/adapters/observiumApi';
import { prtgApi } from '@/lib/data/adapters/prtgApi';

interface ApiResponse {
  source: 'Observium' | 'PRTG';
  status: 'success' | 'error';
  data?: any;
  error?: string;
}

const ApiClientExample: React.FC = () => {
  const [responses, setResponses] = useState<ApiResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const testObserviumApi = async () => {
    setLoading(true);
    try {
      const response = await observiumApi.get('/test-endpoint');
      setResponses(prev => [
        {
          source: 'Observium',
          status: 'success',
          data: response.data
        },
        ...prev
      ]);
    } catch (error) {
      setResponses(prev => [
        {
          source: 'Observium',
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error'
        },
        ...prev
      ]);
    } finally {
      setLoading(false);
    }
  };

  const testPrtgApi = async () => {
    setLoading(true);
    try {
      const response = await prtgApi.get('/test-endpoint');
      setResponses(prev => [
        {
          source: 'PRTG',
          status: 'success',
          data: response.data
        },
        ...prev
      ]);
    } catch (error) {
      setResponses(prev => [
        {
          source: 'PRTG',
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error'
        },
        ...prev
      ]);
    } finally {
      setLoading(false);
    }
  };

  const clearResponses = () => {
    setResponses([]);
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">API Client Example</h2>

      <div className="flex space-x-4 mb-6">
        <button
          onClick={testObserviumApi}
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          Test Observium API
        </button>

        <button
          onClick={testPrtgApi}
          disabled={loading}
          className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50"
        >
          Test PRTG API
        </button>

        <button
          onClick={clearResponses}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          Clear Results
        </button>
      </div>

      {loading && (
        <div className="flex justify-center my-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      )}

      <div className="border rounded-lg overflow-hidden">
        <div className="bg-gray-100 px-4 py-2 border-b">
          <h3 className="font-medium">API Responses</h3>
        </div>

        <div className="divide-y">
          {responses.length === 0 ? (
            <div className="px-4 py-3 text-gray-500 italic">
              No API calls made yet. Click one of the buttons above to test the APIs.
            </div>
          ) : (
            responses.map((response, index) => (
              <div key={index} className="px-4 py-3">
                <div className="flex items-center mb-2">
                  <span className={`px-2 py-1 rounded-full text-xs mr-2 ${
                    response.source === 'Observium'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-purple-100 text-purple-800'
                  }`}>
                    {response.source}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    response.status === 'success'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {response.status}
                  </span>
                </div>

                {response.status === 'success' ? (
                  <pre className="bg-gray-50 p-2 rounded text-sm overflow-x-auto">
                    {JSON.stringify(response.data, null, 2)}
                  </pre>
                ) : (
                  <div className="text-red-600">
                    Error: {response.error}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      <div className="mt-6 text-sm text-gray-600">
        <p>
          <strong>Note:</strong> These API calls are expected to fail in this example since we're using test endpoints.
          This component demonstrates how to use the API clients with proper error handling.
        </p>
      </div>
    </div>
  );
};

export default ApiClientExample;
