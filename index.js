const Koa = require('koa');
const bodyParser = require('koa-body');
const path = require('path');
const render = require('koa-ejs'); 
const mqtt = require('mqtt');
const url = require('url');
const Router = require('koa-router');

const app = module.exports = new Koa();
const router = new Router();

// Koa related stuff. 
app.use(bodyParser());
render(app, {
  root: path.join(__dirname, 'views'),
  layout: 'layout',
  viewExt: 'html',
  cache: false,
  debug: false
});

// All MQTT stuff begins here. Parse URL to get params
var mqtt_url = url.parse(process.env.CLOUDMQTT_URL || 'mqtt://ntqxchaq:qcs-8ry6gnWw@m23.cloudmqtt.com:12004');
console.log(mqtt_url);
var auth = (mqtt_url.auth || ':').split(':');

// Create a client connection
var client = mqtt.connect(mqtt_url, { 
  port: mqtt_url.port, 
  hostname: mqtt_url.hostname,
  username: auth[0],
  password: auth[1]
});

client.stream.on('error', function (error) {
  console.error('Connection error:', error);
});

client.on('connect', function() { // When connected  
  // subscribe to a topic
  client.subscribe('hello/world', function() {
    // when a message arrives, do something with it
    client.on('message', function(topic, message, packet) {
      console.log("Received '" + message + "' on '" + topic + "'");
    });
  }); 
  // publish a message to a topic
  client.publish('hello/world', 'This is Sparta', function() {
    console.log("Message is published");
  //  client.end(); // Close the connection when published
  });
});

// Home Route
router.get('/', async ctx => {
  await ctx.render('index', {
    mqttDetails: mqtt_url,
    userDetails: auth
  });
});

//Download Route (for the workshop)
router.get('/iot', async ctx => {
  await ctx.render('iot');
})

// Ping Route
router.get('/send', async (ctx,next) => {
  // publish a message to a topic
  client.publish('hello/world', 'This is YeurDreamin', function() {
    console.log("Message is published");
  });
  // Stay on Page
  ctx.status = 204;  
});

const PORT = process.env.PORT || 5001;
app.use(router.routes());
app.use(router.allowedMethods());
app.listen(PORT, console.log(`Server started on port ${PORT}`));