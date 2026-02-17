const PISTON_API = 'http://localhost:4000';

export const submitCode = async (code, languageId, stdin) => {
  const languageMap = {
    71: 'python',
    54: 'cpp', 
    62: 'java',
    50: 'c'
  };
  
  const response = await fetch(`${PISTON_API}/api/piston/execute`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      language: languageMap[languageId] || 'python',
      version: '*',
      files: [{
        content: code
      }],
      stdin: stdin || ''
    })
  });
  
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }
  
  const result = await response.json();
  return {
    token: Date.now().toString(),
    stdout: result.run?.stdout || null,
    stderr: result.run?.stderr || null,
    status: { 
      id: result.run?.code === 0 ? 3 : 12, 
      description: result.run?.code === 0 ? 'Accepted' : 'Runtime Error' 
    },
    time: result.run?.time || null,
    memory: result.run?.memory || null
  };
};

export const getSubmission = async (token) => {
  return { status: { id: 3 }, stdout: '', stderr: '' };
};