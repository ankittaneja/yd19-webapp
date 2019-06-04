const sfdx = require('sfdx-node');
const Router = require('koa-router');
const path = require('path');

const router = new Router();

router.get('/create', (ctx) => {
  //authorize a dev hub
  
  sfdx.auth.webLogin({
    setdefaultdevhubusername: true,
    setalias: 'HubOrg'
  })
  .then(() => {
    // Display confirmation of source push
    console.log('Succesfully authenticated');
  })
  .then(() => {
    sfdx.org.create(path.join(__dirname, './project-scratch-def.json'), '-u mytest' )
    .then( () => {
      // Successfully Scratch org Created
      console.log('Scratch org created');
      sfdx.org.open('-u mytest')
      .then(() => {
        console.log('Opened');
      });
    })
    .catch((error) => {
      // Promise rejected in case of conflicts or some other issue while pulling from scratch org
      console.log('Errors occurred during operation:', error);
    });
  
  })
  ctx.status = 204;
});

module.exports = router;
