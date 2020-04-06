// https://observablehq.com/@sdaas/covid19@408
import define1 from "./e93997d5089d7165@2227.js";

export default function define(runtime, observer) {
  const main = runtime.module();
  main.variable(observer()).define(["md"], function(md){return(
md`# covid19`
)});
  main.variable(observer()).define(["md"], function(md){return(
md`exploring the data from http://www.covid19india.org`
)});
  main.variable(observer("viewof stateName")).define("viewof stateName", ["select","getNameOfAllStates"], function(select,getNameOfAllStates){return(
select({
  title: "Select State or Union Territory ...",
  options: getNameOfAllStates(),
  value: 'INDIA - TOTAL'
})
)});
  main.variable(observer("stateName")).define("stateName", ["Generators", "viewof stateName"], (G, _) => G.input(_));
  main.variable(observer()).define(["bigFigure","width","stateName","data"], function(bigFigure,width,stateName,data){return(
bigFigure(width < 600 ? width : 600, 200, stateName, data)
)});
  main.variable(observer()).define(["md"], function(md){return(
md`### Load all the data from covid19india.org API ..`
)});
  main.variable(observer("d3")).define("d3", ["require"], function(require){return(
require("d3")
)});
  main.variable(observer("raw_data")).define("raw_data", ["d3"], function(d3){return(
d3.json('https://api.covid19india.org/states_daily.json')
)});
  main.variable(observer("data")).define("data", ["raw_data","confirmedCases","dateToObject"], function(raw_data,confirmedCases,dateToObject){return(
raw_data.states_daily.filter(confirmedCases).map(dateToObject)
)});
  main.variable(observer()).define(["md"], function(md){return(
md`### All the utility functions along with some simple tests`
)});
  const child1 = runtime.module(define1);
  main.import("select", child1);
  main.variable(observer("bigFigure")).define("bigFigure", ["getSymbolForState","dataForState","moment","rateOfGrowth","html","timeSeries"], function(getSymbolForState,dataForState,moment,rateOfGrowth,html,timeSeries){return(
async function(width, height, stateName, data) {
  const stateSymbol = getSymbolForState(stateName);
  const state_data = dataForState(stateSymbol, data);

  const last_item = state_data[state_data.length - 1];
  const current_date = moment(last_item.date).format("MMM Do, YYYY");
  const current_growth = last_item.count;
  const current_cum = last_item.cumulative;
  const prev_cum = state_data[state_data.length - 6].cumulative;
  const growth_rate = rateOfGrowth(current_cum, prev_cum, 5);

  const timeSeriesData = state_data.map(function(x) {
    const o = {};
    o.date = x.date;
    o.value = x.cumulative;
    return o;
  });

  // style="border:1px solid black"

  return html`
    <figure>
      <figcaption><h3>${stateName}</h3></figcaption>
      <figcaption><h4>Total: ${current_cum} cases [+${current_growth}]</h4></figcaption>
      <figcaption>As of ${current_date}, growing at ${growth_rate} every day</figcaption>
      ${await timeSeries(width, height, timeSeriesData)}
    </figure>
  `;
}
)});
  main.variable(observer("timeSeries")).define("timeSeries", ["d3","computeYAxisMax"], function(d3,computeYAxisMax){return(
function(width, height, data) {
  // computing the maximum value of the y axis
  const maxy = d3.extent(data, d => d.value)[1];
  const yAxisMax = computeYAxisMax(maxy);

  const margin = { top: 5, right: 30, bottom: 30, left: 40 };
  const viewportHeight = height;
  const viewportWidth = width;
  const xMapper = d3
    .scaleUtc()
    .domain(d3.extent(data, d => d.date))
    .range([margin.left, viewportWidth - margin.right]);

  const yMapper = d3
    .scaleLinear()
    .domain([0, yAxisMax]) 
    .range([viewportHeight - margin.bottom, margin.top]);

  const line = d3
    .line()
    .x(d => xMapper(d.date))
    .y(d => yMapper(d.value));

  const xAxis = function(g) {
    return g.attr("transform", `translate(0,${height - margin.bottom})`).call(
      d3
        .axisBottom(xMapper)
        .ticks(10)
        .tickSizeOuter(0)
    );
  };

  const yAxis = function(g) {
    return g.attr("transform", `translate(${margin.left},0)`).call(
      d3
        .axisLeft(yMapper)
        .ticks(5)
        .tickSizeOuter(0)
    );
    // to remove the axis line, add the following
    // .call(g => g.select(".domain").remove());
  };

  const svg = d3
    .create("svg")
    .attr("width", width)
    .attr("height", height)
    //.attr("style", "border:1px solid black");

  svg
    .append("path")
    .datum(data)
    .attr("d", line)
    .attr("fill", "none")
    .attr("stroke", "steelblue")
    .attr("stroke-width", 2.5)
    .attr("stroke-miterlimit", 1)
    .attr("stroke-linejoin", "round")
    .attr("stroke-linecap", "round");

  svg.append("g").call(xAxis);

  svg.append("g").call(yAxis);

  return svg.node();
}
)});
  main.variable(observer("rateOfGrowth")).define("rateOfGrowth", function(){return(
function(curr, prev, days) {
  if (curr == 0) return 0;
  else if (prev == 0) return "unknown";
  else {
    const t1 = Math.log10((curr * 1.0) / prev) / days;
    const t2 = Math.pow(10, t1);
    const t3 = (t2 - 1.00) * 100;
    return t3.toFixed(1) + "%";
  }
}
)});
  main.variable(observer("computeYAxisMax")).define("computeYAxisMax", function(){return(
function(ymax) {
  if (ymax <= 50) return 50;
  else if (ymax <= 100) return 100;
  else if (ymax <= 200) return 200;
  else if (ymax <= 500) return 500;
  else if (ymax <= 600) return 600;
  else if (ymax <= 1000) return 1000;
  else if (ymax <= 2000) return 1000;
  else if (ymax <= 5000) return 5000;
  else if (ymax <= 6000) return 6000;
  else if (ymax <= 10000) return 10000;
  else if (ymax <= 20000) return 10000;
  else if (ymax <= 50000) return 50000;
  else if (ymax <= 60000) return 60000;
  else if (ymax <= 100000) return 100000;
}
)});
  main.variable(observer("dataForState")).define("dataForState", function(){return(
function dataForState(state, data) {
  let out = [];
  let sum = 0;
  for (let i in data) {
    const item = data[i];
    const tmp_count = parseInt(item[state]);
    const count = isNaN(tmp_count) ? 0 : tmp_count
    sum += count;
    out.push({
      date: item.date,
      count: count,
      cumulative: sum
    });
  }
  return out;
}
)});
  main.variable(observer()).define(["dataForState","assertEquals"], function(dataForState,assertEquals)
{
  const data = [
    { date: "01-01-20", bihar: "1", karnataka: "5", tamilnadu: "0" },
    { date: "02-01-20", bihar: "0", karnataka: "2", tamilnadu: "1" },
    { date: "03-01-20", bihar: "2", karnataka: "2", tamilnadu: "0" },
    { date: "04-01-20", bihar: "3", karnataka: "2", tamilnadu: "1" }
  ];

  const b = dataForState("bihar", data);
  const k = dataForState("karnataka", data);
  assertEquals(6, b[3].cumulative, 'incorrect cumulative for bihar');
  assertEquals(11, k[3].cumulative, 'incorrect cumulative for karnataka');
  return "ok";
}
);
  main.variable(observer("confirmedCases")).define("confirmedCases", function(){return(
function(item) {
  return item.status === "Confirmed";
}
)});
  main.variable(observer("statesOfIndia")).define("statesOfIndia", function()
{
  return {
    an: "Andaman and nicobar",
    ap: "Andhra Pradesh",
    ar: "Arunachal Pradesh",
    as: "Assam",
    br: "Bihar",
    ch: "Chandigarh",
    ct: "ChattisGarh",
    dd: "DD",
    dl: "Delhi",
    dn: "DN",
    ga: "Goa",
    gj: "Gujarat",
    hp: "Himachal Pradesh",
    hr: "Haryana",
    jh: "Jharkhand",
    jk: "Jammu & Kashmir",
    ka: "Karnataka",
    kl: "Kerala",
    la: "Ladakh",
    ld: "LD",
    mh: "Maharashtra",
    ml: "Meghalaya",
    mn: "Manipur",
    mp: "Madhya Pradesh",
    mz: "Mizoram",
    nl: "Nagaland",
    or: "Odisha",
    pb: "Punjab",
    py: "Puducherry",
    rj: "Rajasthan",
    sk: "Sikkim",
    tg: "Telangana",
    tn: "Tamil Nadu",
    tr: "Tripura",
    tt: "INDIA - TOTAL",
    up: "Uttar Pradesh",
    ut: "Uttarakhand",
    wb: "WestBengal"
  };
}
);
  main.variable(observer("getNameOfState")).define("getNameOfState", ["statesOfIndia"], function(statesOfIndia){return(
function(symbol) {
  return statesOfIndia[symbol];
}
)});
  main.variable(observer("getSymbolForState")).define("getSymbolForState", ["statesOfIndia"], function(statesOfIndia){return(
function(name) {
  for (var key in statesOfIndia) {
    if (statesOfIndia[key] == name) return key;
  }
}
)});
  main.variable(observer("getNameOfAllStates")).define("getNameOfAllStates", ["statesOfIndia"], function(statesOfIndia){return(
function() {
  return Object.values(statesOfIndia);
}
)});
  main.variable(observer("moment")).define("moment", ["require"], function(require){return(
require("moment")
)});
  main.variable(observer("dateToObject")).define("dateToObject", ["moment"], function(moment){return(
function(item) {
  let temp = {...item}; // copy the item - we dont want to modify the original
  temp.date = moment(temp.date).toDate();
  return temp;
}
)});
  main.variable(observer("assert")).define("assert", function(){return(
function assert(condition, message) {
  if (!condition) {
    throw message;
  }
  return "ok";
}
)});
  main.variable(observer()).define(["assert"], function(assert){return(
assert(1 == 1, "This message")
)});
  main.variable(observer("assertEquals")).define("assertEquals", function(){return(
function assertEquals(expected, actual, message) {
  if (expected != actual) {
    throw message + " [expected: " + expected + " actual: " + actual + "]";
  }
  return "ok";
}
)});
  main.variable(observer()).define(["assertEquals"], function(assertEquals){return(
assertEquals(10, 10, "should be ok")
)});
  main.variable(observer()).define(["assertEquals"], function(assertEquals){return(
assertEquals(10, 20, "this should fail")
)});
  main.variable(observer()).define(["assertEquals"], function(assertEquals){return(
assertEquals("hello", "hel" + "lo", "should be ok")
)});
  return main;
}
