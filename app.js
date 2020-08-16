//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
// const date = require(__dirname + "/date.js");
const _ = require("lodash");



const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

// --------- refactoring code for working with mongoDB ----------
// conectare si creare baza de date
mongoose.connect("mongodb+srv://Admin-Marius:parola1234@cluster0.q8iwr.gcp.mongodb.net/todolistDB", {useUnifiedTopology:true, useNewUrlParser:true});



const itemsSckema =  {
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

const listSchema = {
  name: String,
  items:[itemsSckema]

};

const List = mongoose.model("List", listSchema);

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
 
  const customListName = _.capitalize(req.params.customListName);

  
 

  List.findOne({name: customListName}, function(err, foundList){
    if (!err){
      if(!foundList){
        // Create a new list
        const list = new List({
          name: customListName,
          items : defaultItems
          
        })
        list.save();
        res.redirect("/" +customListName);
        
      
      
    }else{
      //Show an existing List
      res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
    }
  }
  })

 
});
// ==============================================================



app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  // --------- refactoring code for working with mongoDB and add item to the todolistDB -------
  const item = new Item({
    name:itemName
  });

  // refactoring code for  add item to the new list create
  if(listName === "Today"){
    item.save();
    res.redirect("/");

  }else{
    List.findOne({name:listName}, function(err, foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    });
    // console.log("error");
  }



  // ----------------------------------------------------------
});

// add delete function
app.post("/delete", function(req, res){
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "Today"){
    // remove item from mondoDB 
    Item.findByIdAndRemove(checkedItemId,function(err){
      if(!err){
        console.log("Succesdfully delete");
        res.redirect("/")
      }
    })
    
  }else{
    List.findOneAndUpdate({name:listName}, {$pull:{items:{_id:checkedItemId}}} , function(err, foundList){
      if(!err){
        res.redirect("/"+listName);
      }
    })
  }
  
  
})



app.get("/about", function(req, res){
  res.render("about");
});

let port = process.env.PORT;
if(port == null || port == ""){
  port = 3000;
}

app.listen(port, function() {
  console.log("Server started successfully");
});
