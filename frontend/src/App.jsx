
import React, { useState } from 'react';

export default function App(){
  const [handle, setHandle] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  async function check(){
    if(!handle) return alert('Please enter X handle (without @)');
    setLoading(true); setError(null); setData(null);
    try{
      const res = await fetch(`/api/profile?handle=${encodeURIComponent(handle)}`);
      if(!res.ok){
        const txt = await res.text();
        throw new Error(txt || 'API error');
      }
      const j = await res.json();
      setData(j);
    }catch(e){
      console.error(e);
      setError(e.message);
    }finally{ setLoading(false); }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-purple-50 p-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-semibold mb-4">Zama — Keyword Activity Checker</h1>

        <div className="flex gap-2 mb-4">
          <input value={handle} onChange={e=>setHandle(e.target.value)} placeholder="Enter X handle (without @)" className="flex-1 p-2 rounded border" />
          <button onClick={check} className="px-4 py-2 rounded bg-indigo-600 text-white">{loading? 'Checking...' : 'Check'}</button>
        </div>

        {error && <div className="text-red-500 mb-3">{error}</div>}

        {!data && !error && (
          <div className="p-6 bg-white rounded shadow text-gray-500">Enter an X handle and click Check.</div>
        )}

        {data && (
          <div className="mt-4 bg-white rounded shadow p-4">
            <h2 className="font-semibold mb-2">Results for @{data.handle}</h2>
            <div className="grid grid-cols-2 gap-3">
              <Stat label="Keyword posts" value={data.keyword_posts} />
              <Stat label="Retweets" value={data.retweets} />
              <Stat label="Quote Tweets" value={data.quotes} />
              <Stat label="Replies" value={data.replies} />
              <Stat label="Total checked" value={data.total_checked} />
              <Stat label="Keywords tracked" value={data.keywords.join(', ')} />
            </div>

            {data.creator_info && (
              <div className="mt-4 p-3 bg-gray-50 rounded">
                <div className="font-medium">Creator Program Info</div>
                <div>{data.creator_info}</div>
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
}

function Stat({label, value}){
  return (
    <div className="p-3 rounded bg-gray-50 text-center">
      <div className="text-xs text-gray-500">{label}</div>
      <div className="text-xl font-semibold">{value}</div>
    </div>
  );
}
