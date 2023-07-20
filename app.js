//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://krindy:kaviya@cluster0.tvbzznm.mongodb.net/todolistDB",{useNewURLParser: true});

const itemsSchema ={
  name : String
};

const Item= mongoose.model("Item",itemsSchema);

const item1 = new Item({
  name:"Buy groceries"
});
const item2 = new Item({
  name:"Buy pens"
});
const item3 = new Item({
  name:"Buy boots"
})

const defaultItems =[];

const listSchema = {
  name : String,
  items : [itemsSchema]
};

const List=  mongoose.model("List",listSchema)



app.get("/", function(req, res) {
  Item.find({}).then(function(foundItems){
    if(foundItems.length === 0){
      Item.insertMany(defaultItems).then(function(){
        console.log("Success");
      }).catch(function(err) {
        console.error(err);
      });
      res.redirect("/");
    }else{
      res.render("list", {listTitle: "Today", newListItems: foundItems});
    } 
   });

});

app.get("/:customeListName",function(req,res){
  const customeListName = _.capitalize( req.params.customeListName);

  List.findOne({name : customeListName}).then(function(foundList){
    if(foundList){
      res.render("list",{listTitle: customeListName, newListItems: foundList.items})
    }else{
      const list = new List({
        name : customeListName,
        items : defaultItems
      });
      list.save();
    res.redirect("/"+customeListName)    }
  });

 
});




app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name :itemName
  });

  if(listName=== "Today"){
    item.save();
  res.redirect("/");
  }else{
    List.findOne({name : listName}).then(function(foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/"+ listName)
    })
  }

  
});

app.post("/delete",function(req,res){
  const checkedItemId = (req.body.checkbox);
  const listName = req.body.listName;

  if(listName === "Today"){
    Item.findByIdAndRemove(checkedItemId).then(function(err){
      if(!err){
        console.log("Successfully deleted");
        
      }res.redirect("/");
    });

  }else{
    List.findOneAndUpdate({name : listName},{$pull : {items :{_id : checkedItemId}}}).then(function(foundList){
      res.redirect("/"+listName);
    });
  }


  

});



app.get("/work", function(req,res){
  res.render("list", {listTitle: "Work List", newListItems: workItems});
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(process.env.PORT ||3000, function() {
  console.log("Server started on port 3000");
});
