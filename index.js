import "dotenv/config";

// Express uit de nodemodules map
import { render } from "ejs";
import express, { response } from "express";
import {
  format,
  formatISO,
  add,
  differenceInMinutes,
  differenceInHours,
} from "date-fns";
import { utcToZonedTime } from "date-fns-tz";

const app = express();

app.set("view engine", "ejs");
app.set("views", "./views");
app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const baseUrl = "https://api.werktijden.nl/2";

/* ----------------------- Date variables & functions ----------------------- */
const date = new Date();
const timeZone = "Europe/Amsterdam";
const zonedDate = utcToZonedTime(date, timeZone);
const start = formatISO(new Date(zonedDate), { representation: "date" });
const end = formatISO(add(new Date(zonedDate), { days: 1 }), {
  representation: "date",
});

const today = format(utcToZonedTime(date, timeZone), 'd-L-y')

const options = {
  method: "GET",
  headers: {
    Authorization: `Bearer ${process.env.API_KEY}`,
  },
};

const employeesUrl = `${baseUrl}/employees`;
const punchesUrl = `${baseUrl}/timeclock/punches?departmentId=98750&start=${start}&end=${end}`;
const clockinUrl = `${baseUrl}/timeclock/clockin`;
const cLockoutUrl = `${baseUrl}/timeclock/clockout`;

// Routes
// GET root
app.get("/", async (request, response) => {
  let currentDate = new Date()
  let currentTime = currentDate.getHours() + ":" + currentDate.getMinutes() 

  const employeesData = await fetchData(employeesUrl);

  const punchesData = await fetchData(punchesUrl);

  // console.log(employeesData);
  console.log(punchesData.data);


  response.render("aanwezigheid", {
    currentTime,
    employees: employeesData,
    punches: punchesData.data ? punchesData.data : false,
  });
});

//  GET-verzoek voor het ophalen van de recente inkloktijd
app.get("/clockin/:employeeId", async (request, response) => {
  let currentDate = new Date()
  let currentTime = currentDate.getHours() + ":" + currentDate.getMinutes() 

  const { employeeId } = request.params;
  const recentClockInData = await fetchData(`/clockin/${employeeId}`);
  const recentClockInTime = recentClockInData.timestamp;
});

// GET-verzoek voor het ophalen van de recente uitkloktijd
app.get("/clockout/:employeeId", async (request, response) => {
  const { employeeId } = request.params;
  const recentClockOutData = fetchData(`/clockout/${employeeId}`);
  const recentClockOutTime = recentClockOutData.timestamp;

  response.send(recentClockOutTime);
});

// Clock in
app.post("/clockin", async (request, response) => {

  let currentDate = new Date()
  let currentTime = currentDate.getHours() + ":" + currentDate.getMinutes() 
  //   console.log('data', clockInData);
  const departmentId = Number(request.body.departmentId);
  const employeeId = Number(request.body.employeeId);

  const postData = {
    employee_id: employeeId,
    department_id: departmentId,
  };

  postJson("https://api.werktijden.nl/2/timeclock/clockin", postData);

  console.log();
  response.redirect("/");
});

// Clock out
app.post("/clockout", async (request, response) => {
  const { employeeId, departmentId } = request.body;

  const clockOutData = await postData(clockoutUrl, {
    employee_id: employeeId,
    department_id: departmentId,
  });
  response.redirect("/");
});

// Helper functions
// GET-verzoek
async function fetchData(url) {
  const response = await fetch(url, options);
  const data = await response.json();
  return data;
}

async function postJson(url, body) {
  console.log(2, JSON.stringify(body));
  return await fetch(url, {
    method: "POST",
    body: JSON.stringify(body),
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.API_KEY}`,
    },
  })
    .then((response) => response.json())
    .catch((error) => error);
}

app.set("port", process.env.PORT || 8000);
app.listen(app.get("port"), function () {
  console.log(`application started on http://localhost:${app.get("port")}`);
});
