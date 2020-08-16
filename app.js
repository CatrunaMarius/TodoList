//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const date = require(__dirname + "/date.js");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

// --------- refactoring code for working with mongoDB ----------
// conectare si creare baza de date
mongoose.connect("mongodb://localhost:27017/todolistDB", {useUnifiedTopology:true, useNewUrlParser:true});
const itemsSckema = {
  name : String
};

// creare model
const Item = mongoose.model(
  "Item", itemsSckema
);

// crearea  itemlor de inceput/ new Document
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
// -----------------------------------------------------------------

const listSheme = {
  name: String,
  items:[itemsSckema]

};

const List = mongoose.model("List", listSheme);

app.get("/", function(req, res) {

  // -------- refactoring code for working with mongoDB ---------------
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
    // ------------------------------------------------------------------
  })

  

});

// ========= add new function (Create new list) ==============
app.get("/:customListName", function(req, res){
  const customListName = req.params.customListName;

  
 

  List.findOne({name: customListName}, function(err, foundList){
    if (!err ){
      if(!foundList){
        // Create a new list
        const list = new List({
          name: customListName,
          items : defaultItems
        })
        list.save();
        res.redirect("/"+customListName);
      }
      
    }else{
      //Show an existing List
      res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
    }
  })

 
});
// ==============================================================



app.post("/", function(req, res){

  const itemName = req.body.newItem;

  // --------- refactoring code for working with mongoDB and add item to the todolistDB -------
  const item = new Item({
    name:itemName
  });

  item.save();

  res.redirect("/");

  // ----------------------------------------------------------
});

// add delete function
app.post("/delete", function(req, res){
  const checkedItemId = req.body.checkbox;

  // remove item from mondoDB
  Item.findByIdAndRemove(checkedItemId,function(err){
    if(!err){
      console.log("Succesdfully delete");
  
    }
  })
  res.redirect("/")
})



app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
