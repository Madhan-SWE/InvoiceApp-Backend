const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");


dotenv.config();

const invoiceAPIs = require("./Routes/Invoice");
const itemAPIs = require("./Routes/Items");
const orgAPIs = require("./Routes/Orgs");
const customerAPIs = require("./Routes/Customers");
const userAPIs = require("./Routes/Users");

const adminOps = require("./Routes/AdminOps");

var corsOptions = {
    origin: 'http://netlify.com:8080',
    optionsSuccessStatus: 200 // For legacy browser support
}



const port = process.env.PORT;

const app = express();
app.use(express.json());
// app.use(cors());
app.use(cors(corsOptions));

app.use("/admin", adminOps);

app.use("/api/v1", invoiceAPIs);
app.use("/api/v1", itemAPIs);
app.use("/api/v1", orgAPIs);
app.use("/api/v1/", customerAPIs);
app.use("/api/v1/users", userAPIs);



app.get("/", async (req, res) => {
    try{
        console.log("hello")
        console.log(req.headers.host)
        console.log(req.headers.origin)
        console.log(req.hostname)
        //console.log(req)//
    }
    catch(err){

    }
})

function print (path, layer) {
    if (layer.route) {
      layer.route.stack.forEach(print.bind(null, path.concat(split(layer.route.path))))
    } else if (layer.name === 'router' && layer.handle.stack) {
      layer.handle.stack.forEach(print.bind(null, path.concat(split(layer.regexp))))
    } else if (layer.method) {
      console.log('%s /%s',
        layer.method.toUpperCase(),
        path.concat(split(layer.regexp)).filter(Boolean).join('/'))
    }
  }
  
  function split (thing) {
    if (typeof thing === 'string') {
      return thing.split('/')
    } else if (thing.fast_slash) {
      return ''
    } else {
      var match = thing.toString()
        .replace('\\/?', '')
        .replace('(?=\\/|$)', '$')
        .match(/^\/\^((?:\\[.*+?^${}()|[\]\\\/]|[^.*+?^${}()|[\]\\\/])*)\$\//)
      return match
        ? match[1].replace(/\\(.)/g, '$1').split('/')
        : '<complex:' + thing.toString() + '>'
    }
  }
  
  app._router.stack.forEach(print.bind(null, []))



app.listen(port, () => console.log("App is running in port: ", port));
