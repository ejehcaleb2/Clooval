const axios = require('axios');
(async ()=>{
  try{
    const res = await axios.post('http://127.0.0.1:3000/api/auth/login', {
      email: 'admin@cloova.com',
      password: 'adminpass'
    });
    console.log(JSON.stringify(res.data, null, 2));
  }catch(e){
    if (e.response) console.error('Error:', e.response.status, e.response.data);
    else console.error(e.message);
  }
})();
