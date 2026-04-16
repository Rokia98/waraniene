'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';

export default function TestArtisansAPIPage() {
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const testAPI = async () => {
    setLoading(true);
    setResult('');
    
    try {
      const response = await fetch('/api/artisans');
      const data = await response.json();
      
      setResult(`✅ API Response: ${JSON.stringify(data, null, 2)}`);
    } catch (error) {
      setResult(`❌ Error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    testAPI();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Test API Artisans</h1>
        
        <Button onClick={testAPI} disabled={loading}>
          {loading ? 'Test en cours...' : 'Tester l\'API'}
        </Button>
        
        {result && (
          <div className="mt-6 p-4 bg-white rounded-lg shadow">
            <h3 className="font-semibold mb-2">Résultat :</h3>
            <pre className="text-sm bg-gray-100 p-4 rounded overflow-x-auto whitespace-pre-wrap">
              {result}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}