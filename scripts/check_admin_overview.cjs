const axios = require('axios');
(async ()=>{
  const token = process.argv[2];
  try{
    const users = await axios.get('http://127.0.0.1:3000/api/admin/users', { headers: { Authorization: 'Bearer ' + token } });
    console.log('users count:', users.data.length);
    const acts = await axios.get('http://127.0.0.1:3000/api/admin/activities', { headers: { Authorization: 'Bearer ' + token } });
    console.log('activities count:', acts.data.length);
  }catch(e){
    if (e.response) console.error('Error:', e.response.status, e.response.data);
    else console.error(e.message);
  }
})();
