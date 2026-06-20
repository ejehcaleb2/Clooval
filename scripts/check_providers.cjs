const axios = require('axios');
(async ()=>{
  const token = process.argv[2];
  try{
    const res = await axios.get('http://127.0.0.1:3000/api/providers', { headers: { Authorization: `Bearer ${token}` } });
    console.log('Providers:', JSON.stringify(res.data, null, 2));
  }catch(e){
    if (e.response) console.error('Error:', e.response.status, e.response.data);
    else console.error(e.message);
  }
})();
