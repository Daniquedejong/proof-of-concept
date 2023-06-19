import "dotenv/config";

// Express uit de nodemodules map
import express, { json, response } from "express";
const app = express();

app.set("view engine", "ejs");
app.set("views", "./views");

app.use(express.static("public"));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", async function (request, response) {
  const employees = await dataFetch("https://api.werktijden.nl/2/employees")
  console.log(employees);
  response.render("aanwezigheid", {employees})
});

const baseUrl = "https://api.werktijden.nl/2";

const urlEmployees = `${baseUrl}/employees`;

const urlPunches = `${baseUrl}/timeclock/punches`;

const urlClockin = `${baseUrl}/timeclock/clockin`;

const urlCLockout = `${baseUrl}/timeclock/clockout`;

const options = {
  method: "GET",
  headers: {
    Authorization: `Bearer ${process.env.API_KEY}`,
  },
};

// post json

// clockin

// voor het posten moet ik de employee_id en department_id(#departmentnummer)

export async function postClockinJson(UrlClockin, body) {
  return await fetch(UrlClockin, {
    method: "post",

    body: JSON.stringify(body),

    headers: { "Content-Type": "application/json" },
  })
    .then((response) => response.json())

    .catch((error) => error);
}

// post de uitkloktijden

export async function postClockoutJson(UrlClockout, body) {
  return await fetch(UrlClockout, {
    method: "post",

    body: JSON.stringify(body),

    headers: { "Content-Type": "application/json" },
  })
    .then((response) => response.json())

    .catch((error) => error);
}




async function dataFetch(baseUrl) {
  const data = await fetch(baseUrl, options)
    .then((response) => response.json())
    .catch((error) => error);
  return data;
}

// dataFetch(BaseUrl).then((data) => {
//   console.log(data);
// });

app.set("port", process.env.PORT || 8000);
app.listen(app.get("port"), function () {
  console.log(`application started on http://localhost:${app.get("port")}`);
});
