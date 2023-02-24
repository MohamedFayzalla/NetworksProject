var express = require("express");
var path = require("path");
var fs = require("fs");
var app = express();
var session = require("express-session");
const { stringify } = require("querystring");
require("dotenv").config({ path: __dirname + "/.env" });
const { Session } = require("inspector");
const PORT = process.env.PORT || 3000;
var MongoClient = require("mongodb").MongoClient;
// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));
// creating 24 hours from milliseconds
const oneDay = 1000 * 60 * 60 * 24;

//session middleware
app.use(
  session({
    secret: "thisismysecrctekeyfhrgfgrfrty84fwir767",
    saveUninitialized: false,
    cookie: { maxAge: oneDay },
    resave: false,
  })
);
// app.use(cookieParser());
// -------------- GET REQUESTS
var regsucc = "notSucc";
var searchresultArr = new Array();

app.get("/", function (req, res) {
  // res.render("login", { error: "true" });
  req.session.destroy();
  res.render(__dirname + "/views/login.ejs", { error: "true", succ: regsucc });
  regsucc = "not";
});
app.get("/home", function (req, res) {
  if (req.session.userid) res.render("home");
  else res.redirect("/");
});
app.get("/registration", function (req, res) {
  res.render("registration", { error: "true" });
});
app.get("/hiking", function (req, res) {
  if (req.session.userid) res.render("hiking");
  else res.redirect("/");
});
app.get("/annapurna", function (req, res) {
  if (req.session.userid) res.render("annapurna", { error: "false" });
  else res.redirect("/");
});
app.get("/inca", function (req, res) {
  if (req.session.userid) res.render("inca", { error: "false" });
  else res.redirect("/");
});
app.get("/cities", function (req, res) {
  if (req.session.userid) res.render("cities");
  else res.redirect("/");
});
app.get("/bali", function (req, res) {
  if (req.session.userid) res.render("bali", { error: "false" });
  else res.redirect("/");
});
app.get("/islands", function (req, res) {
  if (req.session.userid) res.render("islands");
  else res.redirect("/");
});
app.get("/paris", function (req, res) {
  if (req.session.userid) res.render("paris", { error: "false" });
  else res.redirect("/");
});
app.get("/rome", function (req, res) {
  if (req.session.userid) res.render("rome", { error: "false" });
  else res.redirect("/");
});
app.get("/santorini", function (req, res) {
  if (req.session.userid) res.render("santorini", { error: "false" });
  else res.redirect("/");
});

app.get("/wanttogo", async function (req, res) {
  if (req.session.userid) {
    var namesArr = new Array();
    var imgsArr = new Array();
    //var dbName = req.session.userid + "Collection";
    MongoClient.connect("mongodb://127.0.0.1:27017", function (err, client) {
      if (err) throw err;
      var db = client.db("myDB");
      var collection = db.collection("myCollection");
      collection.find().toArray((err, results) => {
        var flag = true;
        var index = 0;
        for (let i = 0; i < results.length; i++) {
          var s = JSON.stringify(results[i]).split(",");
          // console.log(s[2]);
          if (
            s[2].localeCompare('"username":"' + req.session.userid + '"}') == 0
          ) {
            console.log(s[1]);
            var n = s[1].substring(12, s[1].length - 1);
            namesArr[index] = n;
            index++;
            //imgsArr[i] = replaced;
          }
        }
      });
    });
    await new Promise((resolve) => setTimeout(resolve, 1000));
    res.render("wanttogo", { namesA: namesArr, imgsArr: imgsArr });
    // console.log(namesArr);
    // console.log(session.userid);
  } else res.redirect("/");
});

app.post("/santorini", function (req, res) {
  addtowanttogo("santorini", req, res);
});
app.post("/rome", function (req, res) {
  addtowanttogo("rome", req, res);
});

app.post("/paris", function (req, res) {
  addtowanttogo("paris", req, res);
});

app.post("/bali", function (req, res) {
  addtowanttogo("bali", req, res);
});

app.post("/annapurna", function (req, res) {
  addtowanttogo("annapurna", req, res);
});

app.post("/inca", function (req, res) {
  addtowanttogo("inca", req, res);
});
// ------------ START POST REGISTER PAGE
app.post("/register", function (req, res) {
  var un = req.body.username;
  var pass = req.body.password;
  MongoClient.connect("mongodb://127.0.0.1:27017", function (err, client) {
    if (err) throw err;
    var db = client.db("myDB");
    var collection = db.collection("myCollection");
    collection.find().toArray((err, results) => {
      var flag = true;
      if (un.localeCompare("") == 0 || pass.localeCompare("") == 0) {
        flag = false;
      }
      for (let i = 0; i < results.length; i++) {
        if (un.localeCompare("") == 0 || pass.localeCompare("") == 0) {
          flag = false;
          break;
        }
        var s = JSON.stringify(results[i]).split(",");
        if (s[1].localeCompare('"username":' + '"' + un + '"') == 0) {
          // "username":"kareemeladl"
          flag = false;
          break;
        }
      }

      if (flag) {
        collection.insertOne({
          username: un,
          password: pass,
        });
        regsucc = "succ";
        res.redirect("/");
      } else {
        res.render("registration", { error: "false" });
      }
    });
  });
});

// -------------------- START POST LOGIN PAGE ------------------------------------------
app.post("/", function (req, res) {
  var username = '"' + req.body.username + '"';
  var password = '"' + req.body.password + '"';
  MongoClient.connect("mongodb://127.0.0.1:27017", function (err, client) {
    if (err) throw err;
    var db = client.db("myDB");
    var collection = db.collection("myCollection");
    collection.find().toArray((err, results) => {
      var flag = false;
      for (let i = 0; i < results.length; i++) {
        var s = JSON.stringify(results[i]).split(",");
        if (
          s[1].localeCompare('"username":' + username) == 0 &&
          s[2].localeCompare('"password":' + password + "}") == 0
        ) {
          flag = true;
          break;
        }
      }
      if (flag) {
        req.session.userid = req.body.username;
        res.redirect("/home");
      } else {
        res.render("login", { error: "false", succ: "no" });
      }
    });
  });
});
// --------------------------- END POST LOGIN PAGE ------------------------------

app.post("/search", async function (req, res) {
  var searched = req.body.Search;
  // db.users.find({"name": /.*m.*/})
  var like = { DestName: new RegExp(".*" + searched + ".*") };
  // like = JSON.parse(like);
  // // var replaced = like.replace(
  // //   String.fromCharCode("/"),
  // //   String.fromCharCode("")
  // // );
  MongoClient.connect("mongodb://127.0.0.1:27017", function (err, client) {
    if (err) throw err;
    var db = client.db("myDB");
    var collection = db.collection("myCollection");
    var allplaces = ["rome", "paris", "annapurna", "inca", "bali", "santorini"];
    var regex = new RegExp(".*" + searched + ".*");
    var index = 0;
    for (let i = 0; i < allplaces.length; i++) {
      var curr = allplaces[i];
      if (curr.match(regex)) {
        searchresultArr[index] = curr;
        index++;
      }
    }
    // var n = collection.find({ like });
    // collection.find(like).toArray(function (err, result) {
    //   if (err) throw err;
    //   for (let i = 0; i < result.length; i++) {
    //     // searchresultArr[i] = result[i].split(",")[1];
    //     var s = JSON.stringify(result[i]).split(",");
    //     var n = s[1].substring(12, s[1].length - 2);
    //     searchresultArr[i] = n;
    //   }
    // });
  });
  await new Promise((resolve) => setTimeout(resolve, 1000));
  res.redirect("/searchresults");
});

app.get("/searchresults", function (req, res) {
  if (req.session.userid) {
    res.render("searchresults", { searchresultArr });
    searchresultArr = new Array();
  } else {
    res.redirect("/");
  }
});

app.get("/json", function (req, res) {
  res.json({ message: "hello world" });
});

function addtowanttogo(name, req, res) {
  console.log(req.session.userid);
  MongoClient.connect("mongodb://127.0.0.1:27017", function (err, client) {
    if (err) throw err;
    var db = client.db("myDB");
    var collection = db.collection("myCollection");
    collection.find().toArray((err, results) => {
      var flag = true;
      for (let i = 0; i < results.length; i++) {
        var s = JSON.stringify(results[i]).split(",");
        if (
          s[1].localeCompare('"DestName":' + '"' + name + '"') == 0 &&
          s[2].localeCompare('"username":"' + req.session.userid + '"}') == 0
        ) {
          flag = false;
          break;
        }
      }
      if (flag) {
        collection.insertOne({
          DestName: name,
          username: req.session.userid,
        });
        res.render(name, { error: "false" });
      } else {
        res.render(name, { error: "true" });
      }
    });
  });
}

app.listen(PORT, () => {
  console.log(`server started on port ${PORT}`);
});
