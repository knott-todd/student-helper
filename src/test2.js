const hey = require('./sql_module.js');
const boo = async () => {console.log(await hey(1))}

boo();