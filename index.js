const express = require("express");
const app = express();
const { Joke } = require("./db");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// get jokes matching query params, or all jokes

app.get("/jokes", async (req, res, next) => {
  try {
    
    //get all jokes from db
    const dbJokes = await Joke.findAll();

    // use req.query to get query params
    const { tags, content } = req.query;
    // console.log(tags);
    // console.log(content);

    // filter db jokes using tags and content
    const matchingJokes = dbJokes.filter((item) => {
      if (tags && !item.tags.includes(tags)) {
        return;
      }
      if (content && !item.joke.includes(content)) {
        return;
      }
      return item;
    });

    // send response w/ matching jokes
    res.send(matchingJokes);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

// create new joke

app.post("/jokes", async (req, res, next) => {
  // save joke and tags from body of request
  const { joke, tags } = req.body;

  // validate that joke and tags have been entered
  if (!joke || !tags) {
    // send 400 status if not present
    res.send({
      status: 400,
      message: "Joke and tags fields are required",
    });
  } else {
    // if tags and joke are present
    try {
      // create new joke
      const newJoke = await Joke.create(req.body);

      // send it as response
      res.send("joke added: ", newJoke);
    } catch (error) {
      console.error(error);
      next(error);
    }
  }
});

// update joke by id

app.put("/jokes/:id", async (req, res, next) => {
  // save joke and tags from request body
  const { joke, tags } = req.body;

  //validate that joke or tags is present
  if (!joke && !tags) {
    //send 400 status if neither are present
    res.send({
      status: 400,
      message: "please enter a new joke or new tags",
    });

    // if both are present
  } else {
    try {
      // update the joke matching id with the body of the request
      const newJoke = await Joke.update(req.body, {
        where: {
          id: req.params.id,
        },
        returning: true,
      });
      res.send("joke updated: ", newJoke);
    } catch (error) {
      console.error(error);
      next(error);
    }
  }
});

//delete joke by id

app.delete("/jokes/:id", async (req, res, next) => {
  // get id from params
  const id = req.params.id;
  //console.log(id);

  try {
    // delete joke with matching id
    const joke = await Joke.destroy({
      where: {
        id: id,
      },
    })

    // return the new list of jokes without the deleted one
    const newJokes = await Joke.findAll();
    res.send(newJokes);
  } catch (error) {
    console.error(error);
    next(error);
  }
});




// we export the app, not listening in here, so that we can run tests
module.exports = app;
