const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

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
  name: "Add Items to Your List!",
});
const item2 = new Item({
  name: "You Can Cross Items off once complete!",
});
const item3 = new Item({
  name: "Delete it off your List with the delete button!",
});

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemsSchema],
};

const List = mongoose.model("List", listSchema);

//ROUTES
//GET REQUEST (READ OPERATION)
app.get("/", (req, res) => {
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

//GET REQUEST (CREATE OPERATION)
app.get("/:customListName", (req, res) => {
  const customListName = req.params.customListName;

  List.findOne({ name: customListName }, function (err, foundList) {
    if (!err) {
      if (!foundList) {
        //CREATE NEW LIST
        const list = new List({
          name: customListName,
          items: defaultItems,
        });
        list.save();
        res.redirect("/" + customListName);
      } else {
        //SHOW EXISTING LIST
        res.render("home", {
          listTitle: foundList.name,
          newListItems: foundList.items,
        });
      }
    }
  });
});

//POST REQUEST (UPDATE OPERATION)
app.post("/", (req, res) => {
  const itemName = req.body.newItem;
  const listName = req.body.button;

  const item = new Item({
    name: itemName,
  });

  if (listName === "To Do List") {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({ name: listName }, function (err, foundList) {
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    });
  }
});

//DELETE REQUEST (DELETE OPERATION)
app.post("/delete", (req, res) => {
  const deleteItemId = req.body.delete;
  const listName = req.body.listName;

  if (listName === "To Do List") {
    Item.findByIdAndRemove(deleteItemId, function (err) {
      if (!err) {
        console.log("Successfully deleted item!");
        res.redirect("/");
      }
    });
  } else {
    List.findOneAndUpdate(
      { name: listName },
      { $pull: { items: { _id: deleteItemId } } },
      function (err, foundList) {
        if (!err) {
          res.redirect("/" + listName);
        }
      }
    );
  }
});

//PORT TO LISTEN
app.listen(port, function () {
  console.log("Server is listening on port 3000");
});
