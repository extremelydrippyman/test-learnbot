const express = require('express');
const mongoose = require("mongoose");
const UserModel = require("./userModel.js");
const AIdatamodel = require("./AIdatamodel.js");
const url = "mongodb://localhost:27017/learnboxdb";
const app = express();

mongoose.connect(url);
const database = mongoose.connection;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

database.on("error", (error) => {
    console.log(error);
});

database.once("connected", () => {
    console.log("Database connected");
});

app.get("/login", (req, res) => {
    res.sendFile("./login.html", { root: __dirname });
});

app.post("/login", async function (req, res) {
    console.log(req.body);
    const { email, password } = req.body;
    const user = await UserModel.findOne({ email: email }).exec();
    if (user) {
        if (user.password === password) {
            console.log("Login successful");
            res.send("Login successful");
        } else {
            console.log("Incorrect password");
            res.send("Incorrect password");
        }
    } else {
        console.log("User Not found");
        res.send("User Not found");
    }
});

app.get("/registration", (req, res) => {
    res.sendFile("./registration.html", { root: __dirname });
});

app.get("/assignment-submission", (req, res) => {
    res.sendFile("./assignment-submission.html", { root: __dirname });
});

app.post("/get-chatgpt-response", async (req,res) => {
    const {grade, question, answer} = req.body;
    console.log (grade, question, answer);
    const userPrompt = `Grade: ${grade}. Assignment Question: ${question}. Assignment Answer ${answer}. Give a detailed feedback on the answer based on the grade and the assignment question`;
    const messages = {
        messages: [
          {
            role: "system",
            content: [
              {
                type: "text",
                text: "You are an expert teacher who has deep knowledge on grading assignments based on what grade the student is. You are able to grade the assignments and give critical feedbacks and reviews on what they can do to improve their assignments. Once ready, enter your assignment and I can give feedbacks for that.",
              },
            ],
          },
          {
            role: "user",
            content: [
                {
                    type: "text",
                    text: userPrompt,
                },
            ]
          }
          ,
        ],
    };
    const response = await fetch(
        "https://beena-azure-oai.openai.azure.com/openai/deployments/beena-gpt-35/chat/completions?api-version=2024-02-15-preview",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "api-key": "9de2e486660e460aaac8824ed83cc379",
          },
          body: JSON.stringify(messages),
        }
      );
      const data= await response.json();
      const apiResponseText = data["choices"][0]["message"]["content"];
      const newAIdataset = await AIdatamodel.create({ question, answer, grade, response: apiResponseText});
      res.send(apiResponseText);
      //const resposen = data["choices"][0]["finish_reason"]
      //console.log(data["choices"]);
      //console.log(JSON.stringify(data, null, 2));
});

app.post("/register", async function (req, res) {
    console.log(req.body);
    const { email, password } = req.body;
    try {
        const existingUser = await UserModel.findOne({ email: email }).exec();
        if (existingUser) {
            console.log("User already exists");
            res.send("User already exists");
        } else {
            const newUser = await UserModel.create({ email, password });
            console.log("User registered successfully");
            res.send("User registered successfully");
        }
    } catch (error) {
        console.log("Error during registration: ", error);
        res.send("An error occurred during registration");
    }
});

app.get("/", function (request, response) {
    response.send("Hello World!");
});

app.listen(5000, function () {
    console.log("Server is running on port 5000");
});
