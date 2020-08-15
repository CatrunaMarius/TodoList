//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const date = require(__dirname + "/date.js");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

// conectare si creare baza de date
mongoose.connect("mongodb://localhost:27017/todolistDB", {useNewUrlParser:true});
const itemsSckema = {
  name : String
};

// creare model
const Item = mongoose.model(
  "Item", itemsSckema
);

// crearea  itemlor de inceput
const item1  = new Item({
    name: "Welcome to your todolist!"
}) ;
const item2  = new Item({
  name: "hit the + button to add a new item"
}) ;
const item3  = new Item({
  name: "<-- hit this to delete an item."
}) ;

// array cu itemel
const defaultItems = [item1, item2, item3];




app.get("/", function(req, res) {

  Item.find({}, function(err, foundItems){

    if(foundItems.length === 0){
      // inserare itemlor
      Item.insertMany(defaultItems, function(err){
        if (err){
          console.log(err);
        }else{
          console.log("scucces saved default items to DB");
        }
      });
      res.redirect("/");
    } else {
      res.render("list", {listTitle: "Today", newListItems: foundItems});
    }
    
  })

  

});

app.post("/", function(req, res){

  const item = req.body.newItem;

  if (req.body.list === "Work") {
    workItems.push(item);
    res.redirect("/work");
  } else {
    items.push(item);
    res.redirect("/");
  }
});

app.get("/work", function(req,res){
  res.render("list", {listTitle: "Work List", newListItems: workItems});
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
