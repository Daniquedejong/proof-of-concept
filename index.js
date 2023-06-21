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

const options = {
  method: "GET",
  headers: {
    Authorization: `Bearer ${process.env.API_KEY}`,
  },
};

const employeesUrl = `${baseUrl}/employees`
const punchesUrl = `${baseUrl}/timeclock/punches?departmentId=298538&start=${start}&end=${end}`;
const urlClockin = `${baseUrl}/timeclock/clockin`;
const urlCLockout = `${baseUrl}/timeclock/clockout`;

// Routes
// GET root
app.get("/", async (request, response) => {
  console.log(1);
  const employeesData = await fetchData(employeesUrl);
  console.log(2, employeesData);

  const punchesData = await fetchData(punchesUrl);

  // console.log(employeesData);
  // console.log(punchesData.data);

  response.render("aanwezigheid", {
    employees: employeesData,
    punches: punchesData.data ? punchesData.data : false,
  });
});

// GET-verzoek voor het ophalen van de recente uitkloktijd
app.get("/clockout/:employeeId", async (request, response) => {
  const { employeeId } = request.params;
  const recentClockOutData = fetchData(`/clockout/${employeeId}`);
  const recentClockOutTime = recentClockOutData.timestamp;

  response.send(recentClockOutTime);
});

//  GET-verzoek voor het ophalen van de recente inkloktijd
app.get("/clockin/:employeeId", async (request, response) => {
  const { employeeId } = request.params;
  const recentClockInData = fetchData(`/clockin/${employeeId}`);
  const recentClockInTime = recentClockInData.timestamp;

  response.send(recentClockInTime);
});

// Clock in
app.post("/clockin", async (request, response) => {
  const { employeeId, departmentId } = request.body;

  const clockInData = postData(clockinUrl, {
    employee_id: employeeId,
    department_id: departmentId,
  });
  console.log(clockInData);
  response.redirect("/");
});

// Clock out
app.post("/clockout", async (request, response) => {
  const { employeeId, departmentId } = request.body;

  const clockOutData = postData(clockoutUrl, {
    employee_id: employeeId,
    department_id: departmentId,
  });
  console.log(clockOutData);
  response.redirect("/");
});

// Helper functions
// GET-verzoek
async function fetchData(url) {
  console.log(url)
  const response = await fetch(url, options);
  const data = await response.json();
  return data;
}

// POST-verzoek
async function postData(url, body) {
  const postOptions = {
    ...options,
    method: "POST",
    body: JSON.stringify(body),
  };

  const response = fetch(url, postOptions);
  const data = response.json();
  return data;
}


app.set("port", process.env.PORT || 8000);
app.listen(app.get("port"), function () {
  console.log(`application started on http://localhost:${app.get("port")}`);
});



// // route index
// app.get("/", async (request, response) => {
//   const employees = await dataFetch("https://api.werktijden.nl/2/employees");
// })

  // // Haal de datum van vandaag op om alleen de punches van vandaag te laten zien:
  // const date = new Date();
  // const timeZone = 'Europe/Amsterdam';
  // const zonedDate = utcToZonedTime(date, timeZone);
  // const start = formatISO(new Date(zonedDate), { representation: 'date' });
  // const end = formatISO(add(new Date(zonedDate), { days: 1 }), { representation: 'date' });

  // const today = format(utcToZonedTime(date, timeZone), 'd-L-y');

  // const punchesUrl = `${baseUrl}/timeclock/punches?departmentId=298538&start=${start}&end=${end}`;
  // const punches = await dataFetch(punchesUrl); // Fetch punches data

//   response.render("aanwezigheid", { employees, punches }); // Pass punches data to the template
// });

// index

// // Test!!!!!!!!!!!!!!!!! - css transition
// // Remove the transition class
// const square = document.querySelector('.square');
// square.classList.remove('square-transition');

// // Create the observer, same as before:
// const observer = new IntersectionObserver(entries => {
//   entries.forEach(entry => {
//     if (entry.isIntersecting) {
//       square.classList.add('square-transition');
//       return;
//     }

//     square.classList.remove('square-transition');
//   });
// });

// observer.observe(document.querySelector('.square-wrapper'));
// // test!!!!!!!!!!!!!!!!!!!!!