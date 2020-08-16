const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
// const date = require(_dirname + "/date.js");

const app = express();

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

//TEMPLATE ENGINE
app.set("view engine", "ejs");
//BODY PARSER
app.use(bodyParser.urlencoded({ extended: true }));
//ACCESS CSS AND JS FILES
app.use(express.static("public"));

//MONGODB CONNECTION
mongoose.connect(
  "mongodb+srv://todoAppUser:1234@cluster0.ak30r.mongodb.net/todolist?retryWrites=true&w=majority",
  { useNewUrlParser: true }
);

// CREATE MONGOOSE SCHEMA
const itemsSchema = {
  name: String,
};
//MONGOOSE MODEL BASED ON SCHEMA
const Item = mongoose.model("Item", itemsSchema);
//MONGOOSE DOCUMENT
const item1 = new Item({
  name: "Item 1",
});
const item2 = new Item({
  name: "Item 2",
});
const item3 = new Item({
  name: "Item 3",
});

const defaultItems = [item1, item2, item3];

//ROUTES
//GET REQUEST (READ OPERATION)
app.get("/", (req, res) => {
  // const day = date();
  Item.find({}, function (err, foundItems) {
    if (foundItems === 0) {
      Item.insertMany(defaultItems, function (err) {
        if (err) {
          console.log(err);
        } else {
          console.log("Success");
        }
      });
      res.redirect("/");
    } else {
      res.render("home", {
        listTitle: "To Do List",
        newListItems: foundItems,
      });
    }
  });
});

//POST REQUEST (UPDATE OPERATION)
app.post("/", (req, res) => {
  const itemName = req.body.newItem;
  const item = new Item({
    name: itemName,
  });
  item.save();
  res.redirect("/");
});

//DELETE REQUEST (DELETE OPERATION)
app.post("/delete", (req, res) => {
  const deleteItemId = req.body.delete;
  Item.findByIdAndRemove(deleteItemId, function (err) {
    if (!err) {
      console.log("Successfully deleted item!");
      res.redirect("/");
    }
  });
});

//PORT TO LISTEN
app.listen(port, function () {
  console.log("Server is listening on port 3000");
});
