// https://observablehq.com/@sdaas/covid19@576
import define1 from "./e93997d5089d7165@2227.js";

export default function define(runtime, observer) {
  const main = runtime.module();
  main.variable(observer()).define(["md"], function(md){return(
md`# covid19`
)});
  main.variable(observer()).define(["md"], function(md){return(
md`FORK Exploring the state-wise COVID-19 data for India from http://www.covid19india.org`
)});
  main.variable(observer()).define(["md"], function(md){return(
md`# Summary of key states`
)});
  main.variable(observer()).define(["summary"], function(summary){return(
summary()
)});
  main.variable(observer()).define(["md"], function(md){return(
md`Note:

* Total Cases : Total cases reported
* Yesterday : New cases reported today
* Growth : daily growth rate based on past 5 days
* Daily Cases : new cases every day for the past 20 days
* Projected : news cases estimated today based on historical growth rates

`
)});
  main.variable(observer()).define(["md"], function(md){return(
md`# State Detail`
)});
  main.variable(observer("viewof stateName")).define("viewof stateName", ["select","getNameOfAllStates"], function(select,getNameOfAllStates){return(
select({
  title: "Select State or Union Territory ...",
  options: getNameOfAllStates(),
  value: 'INDIA - TOTAL'
})
)});
  main.variable(observer("stateName")).define("stateName", ["Generators", "viewof stateName"], (G, _) => G.input(_));
  main.variable(observer()).define(["bigFigure","width","stateName","raw_data"], function(bigFigure,width,stateName,raw_data){return(
bigFigure(width < 600 ? width : 600, 200, stateName, raw_data)
)});
  main.variable(observer()).define(["md"], function(md){return(
md`### Implementation - Here be dragons`
)});
  main.variable(observer()).define(["md"], function(md){return(
md`#### Load all the data from covid19india.org API ..`
)});
  main.variable(observer("d3")).define("d3", ["require"], function(require){return(
require("d3")
)});
  main.variable(observer("raw_data")).define("raw_data", ["d3"], function(d3){return(
d3.json('https://api.covid19india.org/states_daily.json')
)});
  main.variable(observer()).define(["md"], function(md){return(
md`#### All the utility functions along with some simple tests`
)});
  const child1 = runtime.module(define1);
  main.import("select", child1);
  main.variable(observer("createStateData")).define("createStateData", ["getSymbolForState","isToday","dateToObject"], function(getSymbolForState,isToday,dateToObject){return(
function(stateName, raw_data) {
  const stateSymbol = getSymbolForState(stateName);

  // Only the confirmed data for that state
  let total = 0;
  const state_data = raw_data.states_daily
    .filter(it => it.status == "Confirmed")
    .map(it => {
      const tmp_count = parseInt(it[stateSymbol]);
      const count = isNaN(tmp_count) ? 0 : tmp_count;
      total += count;
      return {
        date: it.date,
        count: count,
        total: total
      };
    });

  // today's data ....
  const today = state_data.filter(it => isToday(it.date))[0];

  // data upto yesterday ...
  const historical_data = state_data
    .filter(item => !isToday(item.date))
    .map(dateToObject);

  // Data for the sparklines - we just show the last 20 days data there ....
  const minIdx = historical_data.length - 20;
  const totals = historical_data
    .filter((e, idx) => idx >= minIdx)
    .map(item => item.total);
  const deltas = historical_data
    .filter((e, idx) => idx >= minIdx)
    .map(item => item.count);

  // The time series data for the main graphs - this must contain two fields - value and date.
  const totalsData = historical_data.map(function(x) {
    const o = {};
    o.date = x.date;
    o.value = x.total;
    return o;
  });
  const deltaData = historical_data.map(function(x) {
    const o = {};
    o.date = x.date;
    o.value = x.count;
    return o;
  });

  // Daily growth rate measured over the last 5 days
  const days = 5;
  const yesterday = historical_data[historical_data.length - 1];
  const prev_item = historical_data[historical_data.length - 1 - days];

  //const yesterday_date = moment(yesterday.date).format("MMM Do");
  const yesterday_total = yesterday.total;
  const yesterday_count = yesterday.count;
  const prev_total = prev_item.total;
  let rate = 0.0;
  let doublingDays = 100;
  if (yesterday_total == 0 || prev_total == 0) {
    rate = 0.0;
  } else {
    const t1 = Math.log10((yesterday_total * 1.0) / prev_total) / days;
    const t2 = Math.pow(10, t1);
    const t3 = (t2 - 1.00) * 100;
    rate = t3.toFixed(1);
    doublingDays = Math.log10(2) / Math.log10(1 + rate);
  }

  // put all this in a single data structure and return it
  return {
    stateName: stateName,
    stateSymbol: stateSymbol,
    yesterday: yesterday,
    today: today,
    totals: totals, // for the sparkline
    deltas: deltas, // for the sparkline
    totalsData: totalsData, // for the big detailed graph
    deltaData: deltaData, // for the big detailed graph
    today: today,
    growthRate: rate,
    doublingDays: doublingDays,
    estDelta: Math.round((yesterday.total * rate) / 100.00)
  };
}
)});
  main.variable(observer("summary")).define("summary", ["createStateData","raw_data","md","spark"], function(createStateData,raw_data,md,spark){return(
function() {
  const tt = createStateData("INDIA - TOTAL", raw_data);
  const mh = createStateData("Maharashtra", raw_data);
  const dl = createStateData("Delhi", raw_data);
  const tn = createStateData("Tamil Nadu", raw_data);
  const rj = createStateData("Rajasthan", raw_data);
  const mp = createStateData("Madhya Pradesh", raw_data);
  const tg = createStateData("Telangana", raw_data);
  const gj = createStateData("Gujarat", raw_data);
  const up = createStateData("Uttar Pradesh", raw_data);
  const an = createStateData("Andhra Pradesh", raw_data);
  const kl = createStateData("Kerala", raw_data);
  const jk = createStateData("Jammu & Kashmir", raw_data);
  const ka = createStateData("Karnataka", raw_data);
  const br = createStateData("Bihar", raw_data);
  const ct = createStateData("Chattisgarh", raw_data);

  return md`
| State | Total Cases | New Cases | Growth | Daily Cases|Projected|
| :-------- | --: | --: | --: | :--: | --: |
| ${tt.stateName}|${tt.today.total}|${tt.today.count}|${
    tt.growthRate
  }%|&nbsp; &nbsp; ${spark(tt.deltas)} | ${tt.estDelta}|
| ${mh.stateName}|${mh.today.total}|${mh.today.count}|${
    mh.growthRate
  }%|&nbsp; &nbsp; ${spark(mh.deltas)} | ${mh.estDelta}|
| ${dl.stateName}|${dl.today.total}|${dl.today.count}|${
    dl.growthRate
  }%|&nbsp; &nbsp; ${spark(dl.deltas)} | ${dl.estDelta}|
| ${tn.stateName}|${tn.today.total}|${tn.today.count}|${
    tn.growthRate
  }%|&nbsp; &nbsp; ${spark(tn.deltas)} | ${tn.estDelta}|
| ${rj.stateName}|${rj.today.total}|${rj.today.count}|${
    rj.growthRate
  }%|&nbsp; &nbsp; ${spark(rj.deltas)} | ${rj.estDelta}|
| ${mp.stateName}|${mp.today.total}|${mp.today.count}|${
    mp.growthRate
  }%|&nbsp; &nbsp; ${spark(mp.deltas)} | ${mp.estDelta}|
| ${tg.stateName}|${tg.today.total}|${tg.today.count}|${
    tg.growthRate
  }%|&nbsp; &nbsp; ${spark(tg.deltas)} | ${tg.estDelta}|
| ${gj.stateName}|${gj.today.total}|${gj.today.count}|${
    gj.growthRate
  }%|&nbsp; &nbsp; ${spark(gj.deltas)} | ${mp.estDelta}|
| ${up.stateName}|${up.today.total}|${up.today.count}|${
    up.growthRate
  }%|&nbsp; &nbsp; ${spark(up.deltas)} | ${up.estDelta}|
| ${an.stateName}|${an.today.total}|${an.today.count}|${
    an.growthRate
  }%|&nbsp; &nbsp; ${spark(an.deltas)} | ${an.estDelta}|
| ${kl.stateName}|${kl.today.total}|${kl.today.count}|${
    kl.growthRate
  }%|&nbsp; &nbsp; ${spark(kl.deltas)} | ${kl.estDelta}|
| ${jk.stateName}|${jk.today.total}|${jk.today.count}|${
    jk.growthRate
  }%|&nbsp; &nbsp; ${spark(jk.deltas)} | ${jk.estDelta}|
| ${ka.stateName}|${ka.today.total}|${ka.today.count}|${
    ka.growthRate
  }%|&nbsp; &nbsp; ${spark(ka.deltas)} | ${ka.estDelta}|
| ${br.stateName}|${br.today.total}|${br.today.count}|${
    br.growthRate
  }%|&nbsp; &nbsp; ${spark(br.deltas)} | ${br.estDelta}|
| ${ct.stateName}|${ct.today.total}|${ct.today.count}|${
    ct.growthRate
  }%|&nbsp; &nbsp; ${spark(ct.deltas)} | ${ct.estDelta}|
`;
}
)});
  main.variable(observer("spark")).define("spark", ["d3","DOM"], function(d3,DOM){return(
function spark(values, width = 100, height = 25) {
  const x = d3
    .scaleLinear()
    .domain([0, values.length - 1])
    .range([0.5, width - 0.5]);
  const y = d3
    .scaleLinear()
    .domain(d3.extent(values))
    .range([height - 0.5, 0.5]);
  const context = DOM.context2d(width, height);
  const line = d3
    .line()
    .x((d, i) => x(i))
    .y(y)
    .context(context);
  context.beginPath(), line(values), context.stroke();
  return context.canvas;
}
)});
  main.variable(observer("bigFigure")).define("bigFigure", ["createStateData","html","moment","timeSeries"], function(createStateData,html,moment,timeSeries){return(
async function(width, height, stateName, raw_data) {
  const stateData = createStateData(stateName, raw_data);

  // style="border:1px solid black"
  return html`
    <figure>
      <figcaption><h3>${stateName}</h3></figcaption>
      <figcaption><h4>Total: ${
        stateData.today.total
      } cases &nbsp;&nbsp;[Today: +${
    stateData.today.count
  }]&nbsp;&nbsp;[Yesterday: +${stateData.yesterday.count}]</h4></figcaption>
      <figcaption>Growing daily at ${stateData.growthRate}% as of ${moment(
    stateData.yesterday.date
  ).format("MMM Do")}</figcaption>
      ${await timeSeries(width, height, stateData.totalsData)}
      <figcaption><h4>Daily new cases</h4></figcaption>
      ${await timeSeries(width, height, stateData.deltaData)}
    </figure>
  `;
}
)});
  main.variable(observer("timeSeries")).define("timeSeries", ["d3","computeYAxisMax","computeXAxisTicks"], function(d3,computeYAxisMax,computeXAxisTicks){return(
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

  const nTicks = computeXAxisTicks(width);

  const xAxis = function(g) {
    return g.attr("transform", `translate(0,${height - margin.bottom})`).call(
      d3
        .axisBottom(xMapper)
        .ticks(nTicks)
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
    .attr("height", height);
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
  main.variable(observer("rateOfGrowth")).define("rateOfGrowth", ["moment","html"], function(moment,html){return(
function(confirmed_state_data) {
  // based on last 5 days of number of confirmed cases

  const days = 5;
  const length = confirmed_state_data.length;
  const last_item = confirmed_state_data[length - 1];
  const prev_item = confirmed_state_data[length - 1 - days];

  const current_date = moment(last_item.date).format("MMM Do");
  const curr = last_item.cumulative;
  const delta = last_item.count;
  const prev = confirmed_state_data[length - 6].cumulative;

  let rate = "";
  if (curr == 0) rate = "0%";
  else if (prev == 0) rate = "TBD%";
  else {
    const t1 = Math.log10((curr * 1.0) / prev) / days;
    const t2 = Math.pow(10, t1);
    const t3 = (t2 - 1.00) * 100;
    rate = t3.toFixed(1) + "%";
  }

  return html`
      <figcaption><h4>Total: ${curr} cases [+${delta}]</h4></figcaption>
      <figcaption>Growing daily at ${rate} as of ${current_date}, </figcaption>`;
}
)});
  main.variable(observer("computeXAxisTicks")).define("computeXAxisTicks", function(){return(
function(width) {
  if (width >= 600) return 10;
  else if (width >= 550) return 9;
  else if (width >= 500) return 8;
  else if (width >= 450) return 7;
  else return 6;
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
  main.variable(observer("statesOfIndia")).define("statesOfIndia", function()
{
  return {
    tt: "INDIA - TOTAL",
    an: "Andaman and nicobar",
    ap: "Andhra Pradesh",
    ar: "Arunachal Pradesh",
    as: "Assam",
    br: "Bihar",
    ch: "Chandigarh",
    ct: "Chattisgarh",
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
  main.variable(observer("isToday")).define("isToday", ["moment"], function(moment){return(
function(dateString) {
  const today = moment().format("DD-MMM-YY"); // 10-Mar-20
  return today == dateString;
}
)});
  main.variable(observer("isNotToday")).define("isNotToday", ["isToday"], function(isToday){return(
function(dateString) {
  return !isToday(dateString);
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
