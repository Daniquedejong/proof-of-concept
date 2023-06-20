import "dotenv/config";

// Express uit de nodemodules map

import { render } from "ejs";
import express, { response } from "express";
import { format, formatISO, add, differenceInMinutes, differenceInHours } from "date-fns"
import { utcToZonedTime } from "date-fns-tz"


const app = express();

app.set("view engine", "ejs");
app.set("views", "./views");

app.use(express.static("public"));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", async function (request, response) {
  const employees = await dataFetch("https://api.werktijden.nl/2/employees");
  console.log(employees);
  response.render("aanwezigheid", { employees });
});

const baseUrl = "https://api.werktijden.nl/2";

const url = `${baseUrl}/employees`;


// Haal de datum van vandaag op om alleen de punches van vandaag te laten zien:
const date = new Date()
const timeZone = 'Europe/Amsterdam'
const zonedDate = utcToZonedTime(date, timeZone)
const start = formatISO(new Date(zonedDate), { representation: 'date' })
const end = formatISO(add(new Date(zonedDate), { days: 1 }), { representation: 'date' })

const today = format(utcToZonedTime(date, timeZone), 'd-L-y')



// Url voor ophalen alle clock ins/outs

const punchesUrl = await dataFetch(
  `https://api.werktijden.nl/2/timeclock/punches?departmentId=298538&start=${start}&end=${end}`
);

const urlClockin = `${baseUrl}/timeclock/clockin`;

const urlCLockout = `${baseUrl}/timeclock/clockout`;



const options = {
  method: "GET",
  headers: {
    Authorization: `Bearer ${process.env.API_KEY}`,
  },
};


// GET-verzoek
async function fetchData(url) {
  const response = await fetch(url, options);
  const data = await response.json();
  return data;
}

// POST-verzoek
async function postData(url, body) {
  const postOptions = {
    ...options,
    method: "POST",
    body: JSON.stringify(body)
  };

  const response = await fetch(url, postOptions);
  const data = await response.json();
  return data;
}





//route index
// index
app.get("/", async (request, response) => {
  const employees = await dataFetch("https://api.werktijden.nl/2/employees");
  const punches = await dataFetch(punchesUrl); // Fetch punches data



  // console.log(employeesData);
  // console.log(punchesData.data);

  response.render("aanwezigheid", { employees, punches }); // Pass punches data to the template
});

//   response.render("aanwezigheid", { employee: employeesData, punches: punchesData.data ? punchesData.data : false });
// });


// // Fetch and render data
// app.get("/", async (request, response) => {
//   try {
//     const employeesDataPromise = fetchData(urlEmployees);
//     const punchesDataPromise = fetchData(punchesUrl);

//     const [employeesData, punchesData] = await Promise.all([employeesDataPromise, punchesDataPromise]);

//     response.render("aanwezigheid", { employee: employeesData, punches: punchesData.data || false });
//   } catch (error) {
//     console.error(error);
//     response.status(500).send("Internal Server Error");
//   }
// });




// GET-verzoek voor het ophalen van de recente uitkloktijd
app.get("/clockout/:employeeId", async (request, response) => {
  const { employeeId } = request.params;
  const recentClockOutData = await fetchData(`/clockout/${employeeId}`);
  const recentClockOutTime = recentClockOutData.timestamp;

  response.send(recentClockOutTime);
});

//  GET-verzoek voor het ophalen van de recente inkloktijd
app.get("/clockin/:employeeId", async (request, response) => {
  const { employeeId } = request.params;
  const recentClockInData = await fetchData(`/clockin/${employeeId}`);
  const recentClockInTime = recentClockInData.timestamp;

  response.send(recentClockInTime);
});










// post json

// // clockin

// // voor het posten moet ik de employee_id en department_id(#departmentnummer)

// export async function postClockinJson(UrlClockin, body) {
//   return await fetch(UrlClockin, {
//     method: "post",

//     body: JSON.stringify(body),

//     headers: { "Content-Type": "application/json" },
//   })
//     .then((response) => response.json())

//     .catch((error) => error);
// }

// // post de uitkloktijden

// export async function postClockoutJson(UrlClockout, body) {
//   return await fetch(UrlClockout, {
//     method: "post",

//     body: JSON.stringify(body),

//     headers: { "Content-Type": "application/json" },
//   })
//     .then((response) => response.json())

//     .catch((error) => error);
// }

// Clock in
app.post("/clockin", async (request, response) => {
  const { employeeId, departmentId } = request.body;

  const clockInData = await postData(clockinUrl, {
    employee_id: employeeId,
    department_id: departmentId
  });
    console.log(clockInData);
    response.redirect("/");

});

// Clock out
app.post("/clockout", async (request, response) => {
  const { employeeId, departmentId } = request.body;

  const clockOutData = await postData(clockoutUrl, {
    employee_id: employeeId,
    department_id: departmentId
  });
    console.log(clockOutData);
    response.redirect("/");

});





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
